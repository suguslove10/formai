import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { FormFieldType, UpdateFormSchema } from "@/lib/validations/form";
import { logAuditEvent } from "@/lib/audit-logger";

interface RouteParams {
  params: {
    id: string;
  };
}

// Resolve the authenticated user. Falls back to "demo_user" only when
// DEMO_MODE=true is set explicitly (Clerk-less local development).
function resolveUserId(): string | null {
  let userId: string | null = null;
  try {
    userId = auth()?.userId ?? null;
  } catch (e) {}
  if (userId) return userId;
  return process.env.DEMO_MODE === "true" ? "demo_user" : null;
}

// Fields safe to expose to someone who is not the form's owner.
const PUBLIC_FORM_FIELDS = {
  id: true,
  title: true,
  description: true,
  fieldsJson: true,
  status: true,
  botName: true,
  botGreeting: true,
  botPersona: true,
  botAvatar: true,
  botAvatarUrl: true,
  isMultiStep: true,
  themeColor: true,
  removeBranding: true,
  createdAt: true,
  updatedAt: true,
} as const;

// GET /api/forms/[id] - Fetch form details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = resolveUserId();
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

    const isOwner = userId !== null && form.userId === userId;

    // If not owner, only allow if published — and never expose private
    // config (webhookUrl, knowledgeBase, customDomain, userId).
    if (!isOwner) {
      if (form.status !== "published") {
        return NextResponse.json({ error: "Unauthorized access to unpublished form" }, { status: 403 });
      }
      const publicForm = Object.fromEntries(
        Object.keys(PUBLIC_FORM_FIELDS).map((k) => [k, (form as any)[k]])
      );
      return NextResponse.json({ form: publicForm });
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
    const effectiveUserId = resolveUserId();
    if (!effectiveUserId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

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
    if (parsed.data.botAvatar !== undefined) updateData.botAvatar = parsed.data.botAvatar;
    if (parsed.data.botAvatarUrl !== undefined) updateData.botAvatarUrl = parsed.data.botAvatarUrl.trim() || null;
    if (parsed.data.knowledgeBase !== undefined) updateData.knowledgeBase = parsed.data.knowledgeBase;
    
    // Enterprise fields
    if (parsed.data.customDomain !== undefined) updateData.customDomain = parsed.data.customDomain;
    if (parsed.data.removeBranding !== undefined) updateData.removeBranding = parsed.data.removeBranding;
    if (parsed.data.isMultiStep !== undefined) updateData.isMultiStep = parsed.data.isMultiStep;
    if (parsed.data.themeColor !== undefined) updateData.themeColor = parsed.data.themeColor;
    if (parsed.data.webhookUrl !== undefined) updateData.webhookUrl = parsed.data.webhookUrl;

    const updated = await prisma.form.update({
      where: { id },
      data: updateData,
    });

    // Record audit event
    logAuditEvent({
      userId: effectiveUserId,
      action: parsed.data.status === "published" ? "FORM_PUBLISHED" : "FORM_UPDATED",
      resource: id,
      details: { title: updated.title, status: updated.status },
    }).catch(() => {});

    return NextResponse.json({ success: true, form: updated });
  } catch (error: any) {
    console.error("Error updating form:", error);
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
  }
}

// DELETE /api/forms/[id] - Delete form
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const effectiveUserId = resolveUserId();
    if (!effectiveUserId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

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
