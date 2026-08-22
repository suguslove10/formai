import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PlanType } from "@prisma/client";

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => null);
    if (!body || !body.email || typeof body.email !== "string" || !body.email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid user email address." }, { status: 400 });
    }

    const targetEmail = body.email.trim().toLowerCase();
    const plan: PlanType = body.plan && ["FREE", "PRO", "AGENCY"].includes(body.plan) ? body.plan : "FREE";
    const planNotes = body.planNotes || null;
    const planExpiresAt = body.planExpiresAt ? new Date(body.planExpiresAt) : null;

    // Derived clerkId if user hasn't registered via Clerk yet
    const derivedClerkId = `user_${targetEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

    // Find if user exists by email or clerkId
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: targetEmail }, { clerkId: derivedClerkId }],
      },
    });

    let createdOrUpdatedUser;
    if (existingUser) {
      createdOrUpdatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: targetEmail,
          plan,
          planActivatedAt: plan !== "FREE" ? new Date() : existingUser.planActivatedAt,
          planExpiresAt,
          planNotes,
        },
      });
    } else {
      createdOrUpdatedUser = await prisma.user.create({
        data: {
          clerkId: derivedClerkId,
          email: targetEmail,
          plan,
          planActivatedAt: plan !== "FREE" ? new Date() : null,
          planExpiresAt,
          planNotes,
        },
      });
    }

    // Log audit action
    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: existingUser ? "USER_PLAN_UPDATED" : "USER_CREATED_BY_ADMIN",
          resource: createdOrUpdatedUser.id,
          details: {
            email: targetEmail,
            plan,
            planExpiresAt: planExpiresAt?.toISOString() || null,
            planNotes,
            adminEmail: adminEmail || "admin",
          },
        },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `User ${targetEmail} set to ${plan} plan successfully`,
      user: createdOrUpdatedUser,
    });
  } catch (error: any) {
    console.error("Error creating/updating user in admin API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process user creation" },
      { status: 500 }
    );
  }
}
