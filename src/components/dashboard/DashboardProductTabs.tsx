"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  Bot, 
  Layers, 
  BarChart3, 
  ExternalLink, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Inbox, 
  Code, 
  Copy, 
  Check,
  BookOpen,
  MessageSquareQuote,
  Share2
} from "lucide-react";
import { PromptGenerator } from "@/components/dashboard/PromptGenerator";
import { formatDate } from "@/lib/utils";

interface FormItem {
  id: string;
  title: string;
  description?: string | null;
  fieldsJson: any;
  status: "draft" | "published";
  type?: "form" | "chatbot";
  botName?: string;
  botPersona?: string;
  knowledgeBase?: string | null;
  createdAt: string | Date;
  _count?: {
    responses: number;
  };
}

interface DashboardProductTabsProps {
  forms: FormItem[];
  userEmail: string;
  initialTab?: "forms" | "chatbots";
}

export function DashboardProductTabs({ forms, userEmail, initialTab = "forms" }: DashboardProductTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"forms" | "chatbots">(initialTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const switchTab = (tab: "forms" | "chatbots") => {
    setActiveTab(tab);
    router.replace(`/dashboard?view=${tab}`, { scroll: false });
  };

  // Each product tab only shows its own assets
  const classicForms = forms.filter((f) => (f.type || "form") === "form");
  const chatbots = forms.filter((f) => f.type === "chatbot");

  const totalItems = forms.length;
  const publishedItems = forms.filter((f) => f.status === "published").length;
  const totalResponses = forms.reduce((sum, f) => sum + (f._count?.responses || 0), 0);
  const publishedForms = classicForms.filter((f) => f.status === "published").length;
  const publishedBots = chatbots.filter((f) => f.status === "published").length;

  const handleCopyEmbed = (formId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const snippet = `<script src="${origin}/embed/formai.js" data-form-id="${formId}"></script>`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopiedId(formId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 mb-2">
            Workspace
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            <span className="font-semibold text-slate-800">{userEmail}</span> · everything you build lives here
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Assets", value: totalItems, Icon: Layers, tone: "text-slate-900 bg-slate-100" },
            { label: "Live", value: publishedItems, Icon: CheckCircle2, tone: "text-indigo-600 bg-indigo-50" },
            { label: "Responses", value: totalResponses, Icon: Inbox, tone: "text-emerald-600 bg-emerald-50" },
          ].map(({ label, value, Icon, tone }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-3 min-w-[120px]"
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone}`}>
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-slate-900 leading-none tabular-nums">{value}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Product Switcher Tabs */}
      <div className="bg-slate-100 border border-slate-200 p-1.5 rounded-2xl flex items-center max-w-lg">
        <button
          type="button"
          onClick={() => switchTab("forms")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === "forms"
              ? "bg-white text-slate-900 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4 text-slate-700" />
          <span>Product 1: Classic Forms</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded-full font-mono">{classicForms.length}</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("chatbots")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === "chatbots"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-300"
              : "text-indigo-700 hover:text-indigo-900"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Product 2: AI Chatbots</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === "chatbots" ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-700"
          }`}>{chatbots.length}</span>
        </button>
      </div>

      {/* Unified AI Generator configured to current mode */}
      <PromptGenerator
        key={activeTab}
        defaultProductType={activeTab === "chatbots" ? "chatbot" : "form"}
      />

      {/* Product Content Sections */}
      {activeTab === "forms" ? (
        /* PRODUCT 1: CLASSIC FORMS VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                Your Web Forms ({classicForms.length})
              </h2>
              <p className="text-xs text-slate-500">Traditional multi-field web pages for desktop & mobile.</p>
            </div>
            <span className="text-xs text-slate-500">{publishedForms} Published</span>
          </div>

          {classicForms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No forms generated yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Use the AI prompt generator above to create your first web form in seconds.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classicForms.map((form) => {
                const fieldCount = Array.isArray(form.fieldsJson) ? form.fieldsJson.length : 0;
                const isPublished = form.status === "published";

                return (
                  <div
                    key={form.id}
                    className="lift bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isPublished ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Draft
                            </>
                          )}
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(form.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">
                        {form.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                        {form.description || "No description provided."}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-600 py-2 px-3 bg-slate-50 rounded-xl mb-4">
                        <span className="flex items-center gap-1 font-medium">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {fieldCount} Questions
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Inbox className="w-3.5 h-3.5 text-slate-400" />
                          {form._count?.responses || 0} Submissions
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/forms/${form.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editor
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/forms/${form.id}/responses`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                          title="View Responses"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Responses</span>
                        </Link>

                        {isPublished && (
                          <Link
                            href={`/f/${form.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                            title="Open Public Web Form"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Form URL</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* PRODUCT 2: AI CHATBOTS VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                Your AI Chatbot Assistants ({chatbots.length})
              </h2>
              <p className="text-xs text-slate-500">Conversational Q&A agents with Knowledge Base and embeddable website widgets.</p>
            </div>
            <span className="text-xs text-indigo-600 font-semibold">{publishedBots} Active Bots</span>
          </div>

          {chatbots.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-indigo-200 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No AI Chatbots created yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Use the AI Chatbot generator above to design an intelligent conversational assistant with FAQs and lead capture.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.map((bot) => {
                const isPublished = bot.status === "published";
                const isCopied = copiedId === bot.id;
                const hasKnowledge = !!bot.knowledgeBase;

                return (
                  <div
                    key={bot.id}
                    className="lift bg-white rounded-3xl border border-indigo-100 hover:border-indigo-300 p-5 flex flex-col justify-between relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-indigo-500 before:to-violet-500"
                  >
                    {/* Bot Top Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              {bot.botName || "FormAI Assistant"}
                            </span>
                            <span className="text-[10px] text-indigo-600 font-semibold capitalize">
                              {bot.botPersona || "Friendly"} Persona
                            </span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isPublished ? "Online" : "Draft"}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">
                        {bot.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-3">
                        {bot.description || "Conversational AI assistant for collecting responses and answering FAQs."}
                      </p>

                      {/* Knowledge Base Status Pill */}
                      <div className="flex items-center justify-between text-xs py-2 px-3 bg-indigo-50/60 border border-indigo-100 rounded-xl mb-4">
                        <span className="flex items-center gap-1.5 font-semibold text-indigo-950 text-[11px]">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          {hasKnowledge ? "Knowledge Base Active" : "Default Instructions"}
                        </span>
                        <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                          {bot._count?.responses || 0} Chats
                        </span>
                      </div>
                    </div>

                    {/* Bot Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyEmbed(bot.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                        title="Copy 1-Line Website Embed Code"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code className="w-3.5 h-3.5" />}
                        <span>{isCopied ? "Copied!" : "Embed"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/forms/${bot.id}/conversations`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                          title="View Conversation Transcripts"
                        >
                          <MessageSquareQuote className="w-3.5 h-3.5" />
                          <span>Chats</span>
                        </Link>
                        <Link
                          href={`/dashboard/forms/${bot.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </Link>

                        {isPublished && (
                          <Link
                            href={`/c/${bot.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200"
                            title="Open Live Chatbot"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
