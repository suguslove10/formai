"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  User as UserIcon, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Search, 
  Clock, 
  Sparkles,
  X,
  Bot
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  clerkId: string;
  email: string;
  plan: "FREE" | "PRO" | "AGENCY";
  effectivePlan: "FREE" | "PRO" | "AGENCY";
  isExpired: boolean;
  planActivatedAt: string | Date | null;
  planExpiresAt: string | Date | null;
  planNotes: string | null;
  createdAt: string | Date;
  formsCount: number;
}

interface AdminUsersTableProps {
  users: UserItem[];
  adminEmail: string;
}

export function AdminUsersTable({ users, adminEmail }: AdminUsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  
  // Form editing state
  const [editPlan, setEditPlan] = useState<"FREE" | "PRO" | "AGENCY">("FREE");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.clerkId.toLowerCase().includes(q) ||
      u.plan.toLowerCase().includes(q) ||
      (u.planNotes && u.planNotes.toLowerCase().includes(q))
    );
  });

  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setEditPlan(u.plan);
    setEditNotes(u.planNotes || "");
    setErrorMsg(null);
    setSuccessMsg(null);

    if (u.planExpiresAt) {
      const d = new Date(u.planExpiresAt);
      if (!isNaN(d.getTime())) {
        setEditExpiryDate(d.toISOString().substring(0, 10)); // YYYY-MM-DD
      } else {
        setEditExpiryDate("");
      }
    } else {
      setEditExpiryDate("");
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: editPlan,
          planExpiresAt: editExpiryDate ? new Date(editExpiryDate).toISOString() : null,
          planNotes: editNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update plan");
      }

      setSuccessMsg(`Successfully updated plan for ${selectedUser.email}`);
      setTimeout(() => {
        setSelectedUser(null);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">User Plan Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manual offline plan assignment & payment reference tracking · Logged in as <span className="text-indigo-300 font-semibold">{adminEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email, clerkId, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Current Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Activated / Expires</th>
                <th className="px-6 py-4">Notes (UTR / Ref)</th>
                <th className="px-6 py-4">Assets</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No users found matching your search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isExpired = u.isExpired;
                  const isFree = u.effectivePlan === "FREE";
                  const isPro = u.effectivePlan === "PRO";
                  const isAgency = u.effectivePlan === "AGENCY";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      {/* User email & clerk id */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{u.email}</p>
                            <p className="text-[10px] font-mono text-slate-400">{u.clerkId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Current Plan Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            isAgency
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : isPro
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isAgency ? "🚀 AGENCY" : isPro ? "⚡ PRO" : "🌱 FREE"}
                        </span>
                      </td>

                      {/* Plan Expiry Status */}
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Expired (Treated as Free)
                          </span>
                        ) : u.planExpiresAt ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No expiry</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 text-slate-600">
                        <div className="space-y-0.5">
                          <p className="text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {u.planActivatedAt ? formatDate(u.planActivatedAt) : "N/A"}
                          </p>
                          {u.planExpiresAt && (
                            <p className="text-[11px] flex items-center gap-1 text-slate-500 font-medium">
                              <Calendar className="w-3 h-3 text-indigo-500" />
                              Expires: {formatDate(u.planExpiresAt)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Payment Notes / UTR */}
                      <td className="px-6 py-4">
                        {u.planNotes ? (
                          <span className="inline-block max-w-[200px] truncate bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-mono" title={u.planNotes}>
                            {u.planNotes}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>

                      {/* Forms count */}
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                          <Bot className="w-3 h-3 text-slate-500" />
                          {u.formsCount} Bots/Forms
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Manage Plan
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Manage User Plan</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
                  {successMsg}
                </div>
              )}

              {/* Plan Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Select Plan Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "FREE", label: "🌱 FREE", desc: "1 bot, 50 responses" },
                    { id: "PRO", label: "⚡ PRO", desc: "5 bots, unlimited" },
                    { id: "AGENCY", label: "🚀 AGENCY", desc: "Unlimited everything" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEditPlan(p.id as any)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        editPlan === p.id
                          ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <p className="font-extrabold text-xs">{p.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Plan Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank for perpetual / non-expiring plan. If date passes, evaluation automatically defaults to FREE.
                </p>
              </div>

              {/* Notes / UTR / Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Payment Reference / UTR Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. UTR: 987654321012 | Bank Transfer on 22 Aug 2026 | Paid via UPI"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? "Saving..." : "Save Plan Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
