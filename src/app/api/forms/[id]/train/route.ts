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

// Very small HTML → text extractor: drop non-content tags, strip markup,
// collapse whitespace. Good enough for FAQ/marketing pages.
function htmlToText(html: string): string {
  return html
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
          "User-Agent": "FormAI-KnowledgeImporter/1.0 (+https://formai.app)",
          Accept: "text/html,application/xhtml+xml",
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

    const text = htmlToText(html).slice(0, MAX_EXTRACT_CHARS);
    if (text.length < 100) {
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
