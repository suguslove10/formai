import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { PlusCircle, LayoutDashboard, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {
    // Clerk not configured yet
  }

  const effectiveUserId = user?.id || "demo_user";
  const effectiveEmail = user?.emailAddresses?.[0]?.emailAddress || "demo@formai.app";

  // Sync user record to Postgres if possible (skip the demo identity
  // unless DEMO_MODE is explicitly enabled)
  if (user || process.env.DEMO_MODE === "true") {
    try {
      await prisma.user.upsert({
        where: { clerkId: effectiveUserId },
        update: { email: effectiveEmail },
        create: {
          clerkId: effectiveUserId,
          email: effectiveEmail,
        },
      });
    } catch (err) {
      console.warn("DB user sync skipped:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm transition">
                F
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">FormAI</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-900 bg-slate-100 font-semibold transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Dashboard
              </Link>
              <Link
                href="/dashboard?view=forms"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                Forms
              </Link>
              <Link
                href="/dashboard?view=chatbots"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI Chatbots
              </Link>
              <Link
                href="/dashboard/settings"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                Workspace & Security
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-medium text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Dual Engine Enabled</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-900 leading-none">
                  {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : "Demo Account"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-none">
                  {effectiveEmail}
                </p>
              </div>
              {user?.id ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  D
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
