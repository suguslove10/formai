"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MessageSquare,
  CheckCircle2,
  Clock,
  X,
  BarChart3,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ConversationRecord {
  id: string;
  messages: { role: string; content: string }[];
  collected: Record<string, any>;
  isComplete: boolean;
  responseId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ConversationsListProps {
  form: {
    id: string;
    title: string;
    botName?: string;
    botAvatar?: string;
    botAvatarUrl?: string | null;
    status: "draft" | "published";
  };
  conversations: ConversationRecord[];
}

function AvatarThumb({ url, emoji, className }: { url?: string | null; emoji: string; className: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        className={`${className} object-cover`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <span className={className} aria-hidden="true">
      {emoji}
    </span>
  );
}

export function ConversationsList({ form, conversations }: ConversationsListProps) {
  const [selected, setSelected] = useState<ConversationRecord | null>(null);
  const botAvatar = form.botAvatar || "🤖";
  const botAvatarUrl = form.botAvatarUrl || null;

  const completedCount = conversations.filter((c) => c.isComplete).length;
  const abandonedCount = conversations.length - completedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard?view=chatbots"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                <AvatarThumb url={botAvatarUrl} emoji={botAvatar} className="w-full h-full text-xl rounded-lg" />
              </div>
              <h1 className="font-bold text-slate-900 text-lg sm:text-xl">
                {form.botName || "FormAI Assistant"} — Conversations
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {form.title} • {conversations.length} conversation{conversations.length === 1 ? "" : "s"} •{" "}
              <span className="text-emerald-600 font-semibold">{completedCount} completed</span> •{" "}
              <span className="text-amber-600 font-semibold">{abandonedCount} in progress / abandoned</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/dashboard/forms/${form.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            Edit Chatbot
          </Link>
          <Link
            href={`/dashboard/forms/${form.id}/responses`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Responses
          </Link>
        </div>
      </div>

      {/* Conversation list */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No conversations yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Every chat session with your bot — completed or abandoned — will be recorded here for you to review.
            </p>
            {form.status === "published" && (
              <Link
                href={`/c/${form.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                Open Live Chatbot
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {conversations.map((conv) => {
              const lastUserMsg = [...conv.messages].reverse().find((m) => m.role === "user");
              const answeredCount = Object.keys(conv.collected).filter(
                (k) => conv.collected[k] !== undefined && conv.collected[k] !== null && conv.collected[k] !== ""
              ).length;

              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(conv)}
                    className="w-full text-left p-4 sm:px-6 hover:bg-indigo-50/30 transition flex items-center gap-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                      <AvatarThumb url={botAvatarUrl} emoji={botAvatar} className="w-full h-full rounded-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {conv.isComplete ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> In progress
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">{formatDate(conv.updatedAt)}</span>
                        <span className="text-[11px] text-slate-400">
                          {conv.messages.length} messages • {answeredCount} answers captured
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        {lastUserMsg ? `Visitor: "${lastUserMsg.content}"` : "No visitor messages yet"}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Transcript modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Conversation Transcript</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Started {formatDate(selected.createdAt)} •{" "}
                  {selected.isComplete ? "Completed and submitted" : "Not completed"}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close transcript"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
              {selected.messages.map((msg, i) => {
                const isBot = msg.role === "assistant";
                return (
                  <div key={i} className={`flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
                    {isBot && (
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                        <AvatarThumb url={botAvatarUrl} emoji={botAvatar} className="w-full h-full rounded-lg" />
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                          : "bg-indigo-600 text-white rounded-br-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {!isBot && (
                      <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {Object.keys(selected.collected).length > 0 && (
              <div className="p-6 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Captured Answers</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selected.collected).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900"
                    >
                      <span className="font-semibold">{key}:</span> {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
