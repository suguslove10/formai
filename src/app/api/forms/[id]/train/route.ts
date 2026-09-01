import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isSafePublicUrl } from "@/lib/url-guard";
import { checkRateLimit } from "@/lib/rate-limit";

interface RouteParams {
  params: {
    id: string;
  };
}

const FETCH_TIMEOUT_MS = 12_000;
const MAX_PAGES_TO_CRAWL = 12; // Crawl up to 12 canonical pages per domain
const MAX_PAGE_CHARS = 3_000;  // Chars per page
const MAX_TOTAL_KB_CHARS = 24_000;

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (FormAI/1.0)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// Multi-strategy HTML text extractor: parses metadata, schema.org JSON-LD,
// Next.js/React hydration data, and rendered DOM elements.
function extractWebsiteContent(html: string): string {
  const chunks: string[] = [];

  // 1. Page Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    chunks.push(`Title: ${titleMatch[1].trim()}`);
  }

  // 2. Meta Descriptions and OpenGraph Details
  const metaDescMatch =
    html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i);
  if (metaDescMatch && metaDescMatch[1]) {
    chunks.push(`Description: ${metaDescMatch[1].trim()}`);
  }

  // 3. JSON-LD Structured Data (Schema.org business info, menu, FAQs)
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const ld of jsonLdMatches) {
    const rawJson = ld.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "").trim();
    try {
      const parsed = JSON.parse(rawJson);
      const stringified = JSON.stringify(parsed, null, 2)
        .replace(/[{}[\]",]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (stringified.length > 20) {
        chunks.push(`Business Info / Structured Data:\n${stringified}`);
      }
    } catch (e) {}
  }

  // 4. Next.js App Router / Pages Router SSR payloads
  const nextDataMatches = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatches && nextDataMatches[1]) {
    try {
      const parsed = JSON.parse(nextDataMatches[1]);
      const jsonText = JSON.stringify(parsed.props?.pageProps || parsed)
        .replace(/[{}[\]",]/g, " ")
        .replace(/\b(pageProps|__N_SSP|__N_SSG|initialState|style|className)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (jsonText.length > 40) {
        chunks.push(jsonText);
      }
    } catch (e) {}
  }

  const rscMatches = html.match(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g) || [];
  if (rscMatches.length > 0) {
    let rscText = "";
    for (const match of rscMatches) {
      const content = match.replace(/^self\.__next_f\.push\(\[1,"/, "").replace(/"\]\)$/, "");
      const unescaped = content
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n")
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      
      const sentences = unescaped.match(/[A-Z0-9][A-Za-z0-9\s,.'’\-–—:;!?&()]{8,}/g) || [];
      rscText += " " + sentences.join(" ");
    }
    const cleanedRsc = rscText.replace(/\s+/g, " ").trim();
    if (cleanedRsc.length > 40) {
      chunks.push(cleanedRsc);
    }
  }

  // 5. Standard Visible HTML Body Content
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (bodyText.length > 0) {
    chunks.push(bodyText);
  }

  return chunks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Discovers canonical sub-pages via sitemap.xml and internal anchor links
async function discoverWebsitePages(initialUrl: string): Promise<string[]> {
  const rootUrl = new URL(initialUrl);
  const origin = rootUrl.origin;
  const discovered = new Set<string>();
  discovered.add(initialUrl);

  // 1. Check sitemap.xml
  try {
    const sitemapRes = await fetch(`${origin}/sitemap.xml`, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(5_000),
    });
    if (sitemapRes.ok) {
      const xml = await sitemapRes.text();
      const locRegex = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
      let match;
      while ((match = locRegex.exec(xml)) !== null && discovered.size < MAX_PAGES_TO_CRAWL) {
        const u = match[1].trim();
        try {
          const parsed = new URL(u);
          if (
            parsed.origin === origin &&
            !u.endsWith(".xml") &&
            !u.match(/\.(png|jpg|jpeg|svg|css|js|pdf|ico|woff2?)$/i)
          ) {
            discovered.add(parsed.href.replace(/\/$/, ""));
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  // 2. If sitemap had few pages, crawl internal links from the target page
  if (discovered.size < MAX_PAGES_TO_CRAWL) {
    try {
      const pageRes = await fetch(initialUrl, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(6_000),
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const linkRegex = /href=["']([^"'#?]+)["']/gi;
        let m;
        while ((m = linkRegex.exec(html)) !== null && discovered.size < MAX_PAGES_TO_CRAWL) {
          const link = m[1].trim();
          if (
            link.startsWith("/") &&
            !link.startsWith("//") &&
            !link.match(/\.(png|jpg|jpeg|svg|css|js|woff2?|ico|pdf|zip)$/i)
          ) {
            try {
              const full = new URL(link, origin).href.replace(/\/$/, "");
              discovered.add(full);
            } catch (e) {}
          } else if (link.startsWith(origin)) {
            discovered.add(link.replace(/\/$/, ""));
          }
        }
      }
    } catch (e) {}
  }

  return Array.from(discovered).slice(0, MAX_PAGES_TO_CRAWL);
}

// POST /api/forms/[id]/train — fetch an entire website (multi-page sitemap + links)
// and compile all pages into the form's knowledge base.
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    let userId: string | null = null;
    try {
      userId = auth()?.userId ?? null;
    } catch (e) {}
    if (!userId && process.env.DEMO_MODE !== "true") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const effectiveUserId = userId || "demo_user";

    const rateLimit = checkRateLimit(`train:${effectiveUserId}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many imports. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const { id } = params;
    const body = await req.json().catch(() => null);
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json({ error: "Please provide a website URL to import." }, { status: 400 });
    }

    const form = await prisma.form.findUnique({
      where: { id },
      select: { userId: true, knowledgeBase: true },
    });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    if (form.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    if (!(await isSafePublicUrl(normalizedUrl))) {
      return NextResponse.json(
        { error: "That URL can't be imported. Use a public https:// website address." },
        { status: 400 }
      );
    }

    // 1. Discover all canonical pages across the website
    const pagesToCrawl = await discoverWebsitePages(normalizedUrl);

    // 2. Concurrently fetch and extract clean content from all discovered pages
    const results = await Promise.allSettled(
      pagesToCrawl.map(async (pageUrl) => {
        const res = await fetch(pageUrl, {
          headers: BROWSER_HEADERS,
          redirect: "follow",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!res.ok) return null;
        const html = await res.text();
        const content = extractWebsiteContent(html).slice(0, MAX_PAGE_CHARS);
        if (content.length < 25) return null;
        return {
          url: pageUrl,
          content,
        };
      })
    );

    const crawledPages = results
      .filter((r): r is PromiseFulfilledResult<{ url: string; content: string } | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((v): v is { url: string; content: string } => v !== null);

    if (crawledPages.length === 0) {
      return NextResponse.json(
        { error: "Could not extract readable text from that website. Please check the address and try again." },
        { status: 422 }
      );
    }

    // 3. Compile all pages into a structured knowledge base block
    let combinedImportBlock = `\n\n### 🌐 Website Knowledge Base: ${normalizedUrl} (${new Date().toISOString().slice(0, 10)})\nCrawled ${crawledPages.length} canonical page${crawledPages.length > 1 ? "s" : ""}:\n`;
    
    for (const page of crawledPages) {
      combinedImportBlock += `\n---\n#### 📄 Page: ${page.url}\n${page.content}\n`;
    }

    const updatedKb = ((form.knowledgeBase || "") + combinedImportBlock).slice(-MAX_TOTAL_KB_CHARS);

    await prisma.form.update({
      where: { id },
      data: { knowledgeBase: updatedKb },
    });

    const totalImportedChars = crawledPages.reduce((sum, p) => sum + p.content.length, 0);

    return NextResponse.json({
      success: true,
      knowledgeBase: updatedKb,
      pagesCount: crawledPages.length,
      crawledUrls: crawledPages.map((p) => p.url),
      importedChars: totalImportedChars,
      sourceUrl: normalizedUrl,
    });
  } catch (error: any) {
    console.error("Error in /api/forms/[id]/train:", error);
    return NextResponse.json({ error: "Failed to import website content." }, { status: 500 });
  }
}
