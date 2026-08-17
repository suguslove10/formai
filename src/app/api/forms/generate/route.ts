import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateFormFromPrompt } from "@/lib/ai/generate-form";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const authObj = auth();
      userId = authObj?.userId;
    } catch (e) {}

    const effectiveUserId = userId || "demo_user";

    // Rate limit check
    const rateLimit = checkRateLimit(effectiveUserId, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. You can generate up to 10 forms per minute. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return NextResponse.json({ error: "Please provide a valid prompt describing your form." }, { status: 400 });
    }

    const userPrompt = body.prompt.trim();

    // Ensure User record exists in Postgres before saving form
    try {
      await prisma.user.upsert({
        where: { clerkId: effectiveUserId },
        update: {},
        create: {
          clerkId: effectiveUserId,
          email: `${effectiveUserId}@user.formai`,
        },
      });
    } catch (userSyncErr) {
      console.warn("User upsert warning:", userSyncErr);
    }

    // Call Anthropic Claude with tool use & 1-retry fallback
    const formSchema = await generateFormFromPrompt(userPrompt);

    // Save as draft in PostgreSQL
    const createdForm = await prisma.form.create({
      data: {
        userId: effectiveUserId,
        title: formSchema.title,
        description: formSchema.description || null,
        fieldsJson: formSchema.fields as any,
        status: "draft",
      },
    });

    return NextResponse.json({
      success: true,
      formId: createdForm.id,
      form: createdForm,
    });
  } catch (error: any) {
    console.error("Error in /api/forms/generate:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate form schema. Please try again or refine your prompt.",
      },
      { status: 500 }
    );
  }
}
