import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/forms/[id]/widget-config — public, display-only settings the
// embed widget needs to render its launcher (avatar, color, teaser text).
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        botName: true,
        botAvatar: true,
        botAvatarUrl: true,
        botGreeting: true,
        themeColor: true,
        removeBranding: true,
      },
    });

    if (!form || form.status !== "published") {
      return NextResponse.json({ error: "Not available" }, { status: 404 });
    }

    return NextResponse.json(
      {
        botName: form.botName,
        botAvatar: form.botAvatar,
        botAvatarUrl: form.botAvatarUrl,
        greeting: form.botGreeting || `Hi! 👋 How can I help you today?`,
        themeColor: form.themeColor,
        removeBranding: form.removeBranding,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("widget-config error:", error);
    return NextResponse.json({ error: "Failed to load config" }, { status: 500 });
  }
}
