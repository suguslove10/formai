import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { LayoutDashboard, Sparkles, ShieldCheck, Bot, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoBotId } from "@/lib/demo-bot";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {}

  const effectiveUserId = user?.id || "demo_user";
  const effectiveEmail = user?.emailAddresses?.[0]?.emailAddress || "demo@formai.app";

  const allowedAdminEmails = (process.env.ADMIN_EMAILS || "sugugalag@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const isAdmin = allowedAdminEmails.includes(effectiveEmail.toLowerCase()) || process.env.DEMO_MODE === "true";

  // Official Live Demo Chatbot
  const demoBotId = await getOrCreateDemoBotId();

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      {/* Sleek Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-200 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">FormAI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-wide border border-indigo-100">
                  v2.0
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 rounded-xl text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Dashboard</span>
              </Link>

              {demoBotId && (
                <Link
                  href={`/c/${demoBotId}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center gap-1.5"
                >
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>Live Demo Chatbot</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="px-3.5 py-2 rounded-xl text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition flex items-center gap-2 font-bold border border-indigo-100"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Admin Console</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Info & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-current" />
              <span className="text-[11px]">Dual AI Engine (Claude 3.7 & OpenAI)</span>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">
                  {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : "Creator Account"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-none">
                  {effectiveEmail}
                </p>
              </div>
              {user?.id ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {effectiveEmail.charAt(0).toUpperCase()}
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
