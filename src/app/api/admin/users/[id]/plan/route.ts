import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PlanType } from "@prisma/client";

interface RouteParams {
  params: {
    id: string; // User DB id or clerkId
  };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await currentUser();
    const adminEmail = user?.emailAddresses?.[0]?.emailAddress;

    const allowedAdminEmails = (process.env.ADMIN_EMAILS || "sugugalag@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDemoAdmin = process.env.DEMO_MODE === "true";

    if (
      !isDemoAdmin &&
      (!adminEmail || !allowedAdminEmails.includes(adminEmail.toLowerCase()))
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { plan, planExpiresAt, planNotes } = body;

    if (!plan || !["FREE", "PRO", "AGENCY"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan type. Must be FREE, PRO, or AGENCY." }, { status: 400 });
    }

    // Find target user by DB id or clerkId
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { clerkId: id }],
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const parsedExpiry = planExpiresAt ? new Date(planExpiresAt) : null;
    if (planExpiresAt && isNaN(parsedExpiry!.getTime())) {
      return NextResponse.json({ error: "Invalid planExpiresAt date format" }, { status: 400 });
    }

    const isUpgrading = plan !== "FREE" && targetUser.plan === "FREE";

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        plan: plan as PlanType,
        planActivatedAt: isUpgrading ? new Date() : targetUser.planActivatedAt || new Date(),
        planExpiresAt: parsedExpiry,
        planNotes: planNotes !== undefined ? planNotes : targetUser.planNotes,
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: "USER_PLAN_UPDATED",
          resource: targetUser.id,
          details: {
            previousPlan: targetUser.plan,
            newPlan: plan,
            planExpiresAt: parsedExpiry?.toISOString() || null,
            planNotes: planNotes || null,
            adminEmail: adminEmail || "demo_admin",
          },
        },
      });
    } catch (auditErr) {
      console.warn("Audit log write warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `User plan successfully updated to ${plan}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user plan" },
      { status: 500 }
    );
  }
}
