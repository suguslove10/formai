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

const FETCH_TIMEOUT_MS = 15_000;
const MAX_EXTRACT_CHARS = 8_000; // keep the KB prompt-sized
const MAX_KB_CHARS = 24_000;

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

// POST /api/forms/[id]/train — fetch a public web page and append its text
// content to the form's knowledge base ("train the bot on your website").
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

    let html = "";
    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (FormAI/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: `The website responded with status ${res.status}. Check the URL and try again.` },
          { status: 422 }
        );
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
        return NextResponse.json(
          { error: "That URL is not a web page. Point to an HTML page like your FAQ or pricing page." },
          { status: 422 }
        );
      }
      html = await res.text();
    } catch (fetchErr: any) {
      return NextResponse.json(
        { error: "Could not reach that website. Check the URL and try again." },
        { status: 422 }
      );
    }

    const text = extractWebsiteContent(html).slice(0, MAX_EXTRACT_CHARS);
    if (text.length < 25) {
      return NextResponse.json(
        { error: "No readable text found on that page. Try a content page like /faq or /pricing." },
        { status: 422 }
      );
    }

    const importBlock = `\n\n### Imported from ${normalizedUrl} (${new Date().toISOString().slice(0, 10)})\n${text}`;
    const updatedKb = ((form.knowledgeBase || "") + importBlock).slice(-MAX_KB_CHARS);

    await prisma.form.update({
      where: { id },
      data: { knowledgeBase: updatedKb },
    });

    return NextResponse.json({
      success: true,
      knowledgeBase: updatedKb,
      importedChars: text.length,
      sourceUrl: normalizedUrl,
    });
  } catch (error: any) {
    console.error("Error in /api/forms/[id]/train:", error);
    return NextResponse.json({ error: "Failed to import website content." }, { status: 500 });
  }
}
