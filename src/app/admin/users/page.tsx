import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserEffectivePlan } from "@/lib/billing";
import { AdminUsersTable } from "@/app/admin/users/AdminUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {}

  const adminEmail = user?.emailAddresses?.[0]?.emailAddress;
  const allowedAdminEmails = (process.env.ADMIN_EMAILS || "sugugalag@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isDemoAdmin = process.env.DEMO_MODE === "true";

  if (
    !isDemoAdmin &&
    (!adminEmail || !allowedAdminEmails.includes(adminEmail.toLowerCase()))
  ) {
    redirect("/dashboard");
  }

  // Auto-sync logged-in Admin/User into PostgreSQL database
  const effectiveEmail = adminEmail || "sugugalag@gmail.com";
  const effectiveClerkId = user?.id || `user_${effectiveEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  try {
    await prisma.user.upsert({
      where: { clerkId: effectiveClerkId },
      update: { email: effectiveEmail },
      create: {
        clerkId: effectiveClerkId,
        email: effectiveEmail,
        plan: "PRO",
      },
    });
  } catch (syncErr) {
    console.warn("Admin user sync warning:", syncErr);
  }

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      include: {
        _count: {
          select: { forms: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Failed to query users for admin dashboard:", err);
  }

  const formattedUsers = users.map((u) => {
    const effectivePlan = getUserEffectivePlan(u);
    const isExpired =
      !!u.planExpiresAt && new Date(u.planExpiresAt).getTime() < Date.now();

    return {
      id: u.id,
      clerkId: u.clerkId,
      email: u.email,
      plan: u.plan,
      effectivePlan,
      isExpired,
      planActivatedAt: u.planActivatedAt ? u.planActivatedAt.toISOString() : null,
      planExpiresAt: u.planExpiresAt ? u.planExpiresAt.toISOString() : null,
      planNotes: u.planNotes,
      createdAt: u.createdAt.toISOString(),
      formsCount: u._count?.forms || 0,
    };
  });

  return (
    <div className="min-h-screen bg-slate-100/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminUsersTable
          users={formattedUsers}
          adminEmail={adminEmail || "sugugalag@gmail.com"}
        />
      </div>
    </div>
  );
}
