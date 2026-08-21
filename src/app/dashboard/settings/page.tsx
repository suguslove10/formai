import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Clock, 
  Globe, 
  Key, 
  Lock, 
  History,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {}

  const activeUserId = user?.id || "demo_user";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "demo@formai.app";

  // Fetch (or create) the workspace this user belongs to. Never fall back
  // to another tenant's workspace.
  let workspace: any = null;
  let auditLogs: any[] = [];
  try {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: activeUserId },
      include: {
        workspace: {
          include: {
            members: { include: { user: true } },
          },
        },
      },
    });

    if (membership) {
      workspace = membership.workspace;
    } else {
      // First visit: create a personal workspace with this user as OWNER
      await prisma.user.upsert({
        where: { clerkId: activeUserId },
        update: {},
        create: { clerkId: activeUserId, email: userEmail },
      });
      workspace = await prisma.workspace.create({
        data: {
          name: "My Workspace",
          members: {
            create: { userId: activeUserId, role: "OWNER" },
          },
        },
        include: {
          members: { include: { user: true } },
        },
      });
    }

    // Audit trail scoped to this workspace and this user's own actions
    auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [{ workspaceId: workspace.id }, { userId: activeUserId }],
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Settings DB query skipped:", err);
  }

  const members: any[] = workspace?.members || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Enterprise Workspace & Security
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              RBAC & Audit
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Manage organization members, role-based access control, and security audit logs.
          </p>
        </div>
      </div>

      {/* Workspace Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{workspace?.name || "My Workspace"}</h3>
              <p className="text-xs text-slate-500 font-mono">Workspace ID: {workspace?.id || "—"}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Enterprise Plan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-500 uppercase tracking-wider block">Organization Slug</span>
            <span className="font-mono text-slate-900 font-bold">{workspace?.slug || "—"}.formai.app</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-500 uppercase tracking-wider block">Primary Owner</span>
            <span className="font-medium text-slate-900">{userEmail}</span>
          </div>
        </div>
      </div>

      {/* Team Members & RBAC Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Team Members & Permissions</h3>
              <p className="text-xs text-slate-500">Assign roles to restrict form editing and response exports.</p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {members.map((member: any) => {
                const memberEmail = member.user?.email || member.userId;
                const isYou = member.userId === activeUserId;
                const isOwner = member.role === "OWNER";

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                        {memberEmail.charAt(0).toUpperCase()}
                      </div>
                      <span>
                        {memberEmail.split("@")[0]}
                        {isYou ? " (You)" : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{memberEmail}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isOwner
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {isOwner && <ShieldCheck className="w-3 h-3" />}
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security Audit Logs</h3>
              <p className="text-xs text-slate-500">Immutable record of all administrative actions and data access events.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">Showing last 20 events</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <History className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Audit logs are active</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Events such as form updates, publishes, and exports will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 text-[11px] truncate max-w-[140px]">
                      {log.userId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] truncate max-w-[160px]">
                      {log.resource}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
