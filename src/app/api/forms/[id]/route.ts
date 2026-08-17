import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UpdateFormSchema } from "@/lib/validations/form";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/forms/[id] - Fetch form details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    const { id } = params;

    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // If not owner, only allow if published
    if (form.userId !== userId && form.status !== "published") {
      return NextResponse.json({ error: "Unauthorized access to unpublished form" }, { status: 403 });
    }

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error("Error fetching form:", error);
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}

// PATCH /api/forms/[id] - Update form details (fields, title, status, etc.)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    let userId: string | null = null;
    try {
      userId = auth()?.userId;
    } catch (e) {}
    const effectiveUserId = userId || "demo_user";

    const { id } = params;
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.form.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (existing.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden: You do not own this form" }, { status: 403 });
    }

    // Validate payload
    const parsed = UpdateFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const updateData: any = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.fields !== undefined) updateData.fieldsJson = parsed.data.fields;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.botName !== undefined) updateData.botName = parsed.data.botName;
    if (parsed.data.botGreeting !== undefined) updateData.botGreeting = parsed.data.botGreeting;
    if (parsed.data.botPersona !== undefined) updateData.botPersona = parsed.data.botPersona;
    if (parsed.data.knowledgeBase !== undefined) updateData.knowledgeBase = parsed.data.knowledgeBase;

    const updated = await prisma.form.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, form: updated });
  } catch (error: any) {
    console.error("Error updating form:", error);
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
  }
}

// DELETE /api/forms/[id] - Delete form
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    let userId: string | null = null;
    try {
      userId = auth()?.userId;
    } catch (e) {}
    const effectiveUserId = userId || "demo_user";

    const { id } = params;

    const existing = await prisma.form.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (existing.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.form.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting form:", error);
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}
