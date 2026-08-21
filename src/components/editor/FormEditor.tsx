"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Save, 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Globe, 
  Check, 
  ExternalLink, 
  Copy, 
  Sparkles, 
  AlertCircle,
  Settings2,
  ChevronLeft,
  Share2,
  Loader2,
  ListPlus,
  Bot,
  Code,
  BookOpen,
  MessageSquare,
  Smile,
  ShieldCheck,
  Zap,
  Split,
  Layers
} from "lucide-react";
import { FieldTypeEnum, FormFieldType, ConditionalRuleType } from "@/lib/validations/form";
import { generateId } from "@/lib/utils";
import { PublicFormRenderer } from "@/components/form/PublicFormRenderer";
import { ConversationalChatbot } from "@/components/chat/ConversationalChatbot";
import { IntegrationsTab } from "@/components/editor/IntegrationsTab";

const AVAILABLE_FIELD_TYPES: { type: FieldTypeEnum; label: string; description: string }[] = [
  { type: "text", label: "Single-line Text", description: "Short answers, names, titles" },
  { type: "email", label: "Email Address", description: "Email validation enabled" },
  { type: "number", label: "Number", description: "Numeric inputs, quantities" },
  { type: "textarea", label: "Multi-line Text", description: "Paragraphs, long descriptions" },
  { type: "select", label: "Dropdown Select", description: "Single choice from a dropdown menu" },
  { type: "radio", label: "Radio Choices", description: "Single choice with all options visible" },
  { type: "checkbox", label: "Checkboxes", description: "Multiple selections or confirmations" },
  { type: "rating", label: "1-5 Star Rating", description: "Satisfaction, review scores" },
  { type: "date", label: "Date Picker", description: "Calendar date selection" },
  { type: "file", label: "File Upload", description: "Document or image upload" },
];

interface FormEditorProps {
  initialForm: {
    id: string;
    type?: "form" | "chatbot";
    title: string;
    description?: string | null;
    fieldsJson: FormFieldType[];
    status: "draft" | "published";
    botName?: string;
    botGreeting?: string | null;
    botPersona?: string;
    botAvatar?: string;
    knowledgeBase?: string | null;
    webhookUrl?: string | null;
    customDomain?: string | null;
    removeBranding?: boolean;
    isMultiStep?: boolean;
    themeColor?: string;
  };
}

export function FormEditor({ initialForm }: FormEditorProps) {
  const isChatbot = initialForm.type === "chatbot";
  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description || "");
  const [fields, setFields] = useState<FormFieldType[]>(initialForm.fieldsJson || []);
  const [status, setStatus] = useState<"draft" | "published">(initialForm.status);
  
  // Bot Persona & Knowledge Base Settings
  const [botName, setBotName] = useState(initialForm.botName || "FormAI Assistant");
  const [botGreeting, setBotGreeting] = useState(initialForm.botGreeting || "");
  const [botPersona, setBotPersona] = useState(initialForm.botPersona || "friendly");
  const [botAvatar, setBotAvatar] = useState(initialForm.botAvatar || "🤖");
  const [knowledgeBase, setKnowledgeBase] = useState(initialForm.knowledgeBase || "");
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Enterprise Settings
  const [webhookUrl, setWebhookUrl] = useState(initialForm.webhookUrl || "");
  const [customDomain, setCustomDomain] = useState(initialForm.customDomain || "");
  const [removeBranding, setRemoveBranding] = useState(initialForm.removeBranding || false);
  const [isMultiStep, setIsMultiStep] = useState(initialForm.isMultiStep || false);
  const [themeColor, setThemeColor] = useState(initialForm.themeColor || "#4f46e5");

  // Chatbots open on their live chat preview so it's immediately clear you
  // built a chatbot; classic forms open on the question editor.
  const [activeTab, setActiveTab] = useState<"editor" | "knowledge" | "integrations" | "preview" | "chatbot">(
    isChatbot ? "chatbot" : "editor"
  );
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedChatbotLink, setCopiedChatbotLink] = useState(false);
  const [copiedEmbedSnippet, setCopiedEmbedSnippet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(fields[0]?.id || null);

  const isInitialMount = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Autosave to PATCH /api/forms/[id]
  const saveAbortRef = useRef<AbortController | null>(null);

  const triggerSave = useCallback(
    async (overrides: Partial<Record<string, any>> = {}) => {
      setSaveStatus("saving");

      // Cancel any in-flight save so an older request can't overwrite a newer one
      saveAbortRef.current?.abort();
      const controller = new AbortController();
      saveAbortRef.current = controller;

      const payload = {
        title,
        description,
        fields,
        status,
        botName,
        botGreeting,
        botPersona,
        botAvatar,
        knowledgeBase,
        webhookUrl,
        customDomain: customDomain || undefined,
        removeBranding,
        isMultiStep,
        themeColor,
        ...overrides,
      };

      try {
        const res = await fetch(`/api/forms/${initialForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Save request failed");
        }
        setSaveStatus("saved");
      } catch (err: any) {
        if (err?.name === "AbortError") return; // superseded by a newer save
        console.error("Autosave error:", err);
        setSaveStatus("error");
        toast.error("Autosave failed", {
          description: "Your latest changes are not saved. Check your connection and keep editing to retry.",
        });
      }
    },
    [
      initialForm.id,
      title,
      description,
      fields,
      status,
      botName,
      botGreeting,
      botPersona,
      botAvatar,
      knowledgeBase,
      webhookUrl,
      customDomain,
      removeBranding,
      isMultiStep,
      themeColor,
    ]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus("unsaved");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerSave();
    }, 800);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [triggerSave]);

  // Warn before leaving with unsaved changes still in the debounce window
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved" || saveStatus === "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveStatus]);

  const handleTogglePublish = async () => {
    const nextStatus = status === "published" ? "draft" : "published";
    setStatus(nextStatus);
    await triggerSave({ status: nextStatus });
    toast.success(nextStatus === "published" ? "Form published" : "Form unpublished", {
      description:
        nextStatus === "published"
          ? "Your form is live and accepting responses."
          : "Your form is back in draft mode and no longer accepting responses.",
    });
  };

  const handleUpdateField = (id: string, updates: Partial<FormFieldType>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleDeleteField = (id: string) => {
    if (fields.length <= 1) {
      toast.warning("A form must have at least one question.");
      return;
    }

    // Remove the field and clear any conditional rules that referenced it —
    // a dangling rule would silently stop working
    let clearedRules = 0;
    const filtered = fields
      .filter((f) => f.id !== id)
      .map((f) => {
        if (f.conditionalRule?.fieldId === id) {
          clearedRules++;
          return { ...f, conditionalRule: undefined };
        }
        return f;
      });

    setFields(filtered);
    if (selectedFieldId === id) {
      setSelectedFieldId(filtered[0]?.id || null);
    }
    if (clearedRules > 0) {
      toast.info(
        `Question deleted. ${clearedRules} conditional rule${clearedRules === 1 ? "" : "s"} that depended on it ${clearedRules === 1 ? "was" : "were"} removed.`
      );
    }
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(newIndex, 0, moved);
    setFields(newFields);
  };

  const handleAddNewField = (type: FieldTypeEnum) => {
    const newField: FormFieldType = {
      id: generateId("field"),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      required: false,
      page: 1,
      options: ["select", "radio", "checkbox"].includes(type)
        ? ["Option 1", "Option 2", "Option 3"]
        : undefined,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setShowAddFieldModal(false);
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
  const publicFormUrl = `${originUrl}/f/${initialForm.id}`;
  const chatbotUrl = `${originUrl}/c/${initialForm.id}`;
  const embedSnippet = `<script src="${originUrl}/embed/formai.js" data-form-id="${initialForm.id}"></script>`;

  // Jotform-style "train with your website": server fetches the page,
  // extracts readable text, and appends it to the knowledge base.
  const handleImportWebsite = async () => {
    if (!importUrl.trim() || isImporting) return;
    setIsImporting(true);
    try {
      const res = await fetch(`/api/forms/${initialForm.id}/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setKnowledgeBase(data.knowledgeBase);
      setImportUrl("");
      toast.success("Website imported into the knowledge base", {
        description: `${data.importedChars.toLocaleString()} characters of content added from ${data.sourceUrl}. Your bot can answer questions about it now.`,
      });
    } catch (err: any) {
      toast.error("Website import failed", { description: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const otherFields = fields.filter((f) => f.id !== selectedFieldId);

  return (
    <div className="space-y-6">
      {/* Editor Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard?view=${isChatbot ? "chatbots" : "forms"}`}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg line-clamp-1">{title || "Untitled Form"}</span>
              {isChatbot && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 whitespace-nowrap">
                  <Bot className="w-3 h-3" /> AI Chatbot
                </span>
              )}
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  status === "published"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1 text-indigo-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Autosaving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="text-slate-400">Unsaved changes...</span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  Save failed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Switcher — each product shows only its own workspace.
              Chatbots: chat-first (preview, persona, data to collect).
              Forms: form-first (questions, preview). */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {(isChatbot
              ? ([
                  { id: "chatbot", label: "Chat Preview", Icon: Bot },
                  { id: "knowledge", label: "Persona & Knowledge", Icon: BookOpen },
                  { id: "editor", label: "Data to Collect", Icon: ListPlus },
                  { id: "integrations", label: "Integrations", Icon: Zap },
                ] as const)
              : ([
                  { id: "editor", label: "Questions", Icon: Edit },
                  { id: "preview", label: "Preview", Icon: Eye },
                  { id: "integrations", label: "Integrations", Icon: Zap },
                ] as const)
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === id
                    ? isChatbot
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Share & Embed Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share & Embed
          </button>

          {/* Publish / Unpublish Button */}
          <button
            onClick={handleTogglePublish}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-sm transition ${
              status === "published"
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Mode View Switcher */}
      {activeTab === "integrations" ? (
        <IntegrationsTab
          formId={initialForm.id}
          formTitle={title}
          webhookUrl={webhookUrl}
          customDomain={customDomain}
          removeBranding={removeBranding}
          onUpdateSettings={(newSettings) => {
            if (newSettings.webhookUrl !== undefined) setWebhookUrl(newSettings.webhookUrl);
            if (newSettings.customDomain !== undefined) setCustomDomain(newSettings.customDomain);
            if (newSettings.removeBranding !== undefined) setRemoveBranding(newSettings.removeBranding);
          }}
        />
      ) : activeTab === "knowledge" ? (
        /* Knowledge Base & Persona Settings Tab */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Chatbot Persona & Knowledge Base</h3>
              <p className="text-xs text-slate-500">
                Train your AI bot on your business information, FAQs, and persona to answer questions seamlessly during form completion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Bot Name
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. Sarah from Support, FormAI Assistant"
                className="w-full text-sm text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                AI Tone & Persona
              </label>
              <select
                value={botPersona}
                onChange={(e) => setBotPersona(e.target.value)}
                className="w-full text-sm text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="friendly">Friendly & Welcoming (Recommended)</option>
                <option value="professional">Professional & Direct</option>
                <option value="casual">Casual & Conversational</option>
                <option value="formal">Formal & Corporate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Bot Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {["🤖", "💬", "👩‍💼", "🧑‍💻", "🎧", "🦉", "⚡", "💡", "🌟", "🛎️"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setBotAvatar(emoji)}
                  aria-label={`Use ${emoji} as bot avatar`}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border transition ${
                    botAvatar === emoji
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Custom Opening Welcome Greeting (Optional)
            </label>
            <input
              type="text"
              value={botGreeting}
              onChange={(e) => setBotGreeting(e.target.value)}
              placeholder="e.g. Hi there! 👋 I can help you register for our event in under 60 seconds. What is your name?"
              className="w-full text-sm text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Company Knowledge Base & FAQs (RAG Training Context)
              </label>
              <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Live AI Grounding
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Paste your company background, pricing, FAQs, return policies, or instructions below — or import a page from your website.
            </p>

            {/* Train from website URL */}
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleImportWebsite();
                  }
                }}
                placeholder="https://yourcompany.com/faq — import a page from your website"
                className="flex-1 text-xs text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
              />
              <button
                type="button"
                onClick={handleImportWebsite}
                disabled={!importUrl.trim() || isImporting}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-40"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Import Website</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={8}
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              placeholder={`Example:
- Business Name: Artisan Bakery Co.
- Hours: Mon-Sat 7am to 6pm, Sunday 8am to 2pm.
- Pricing: Subscription starts at $29/month with 14-day free trial.
- Return policy: Full refunds within 24 hours.`}
              className="w-full text-sm font-mono text-slate-800 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y leading-relaxed"
            />
          </div>
        </div>
      ) : activeTab === "chatbot" ? (
        /* AI Chatbot Preview Mode */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Bot className="w-4 h-4 text-indigo-400" />
                Live interactive Jotform-style AI Chatbot preview.
              </span>
              <Link
                href={`/c/${initialForm.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline flex items-center gap-1 text-xs font-bold"
              >
                Open Fullscreen
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <ConversationalChatbot
              form={{
                id: initialForm.id,
                title,
                description,
                fieldsJson: fields,
                themeColor,
                botName,
                botAvatar,
              }}
            />
          </div>
        </div>
      ) : activeTab === "preview" ? (
        /* Classic Live Form Preview */
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 sm:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Eye className="w-4 h-4" />
                Live interactive preview with conditional logic & multi-step wizard.
              </span>
              <Link
                href={`/f/${initialForm.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-1 text-xs font-bold"
              >
                Open Fullscreen
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <PublicFormRenderer
              form={{
                id: initialForm.id,
                title,
                description,
                fieldsJson: fields,
                isMultiStep,
                themeColor,
              }}
              isPreview={true}
            />
          </div>
        </div>
      ) : (
        /* Visual Form Editor Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Meta & Reorderable Field List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Form Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl font-bold text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Enter form title..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Form Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full text-sm text-slate-700 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                  placeholder="Provide instructions or background for respondents..."
                />
              </div>

              {/* Brand Theme Color */}
              <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Brand Color</span>
                  <span className="text-[11px] text-slate-500">Used for buttons and accents on your public form and chatbot.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{themeColor}</span>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    aria-label="Brand color"
                    className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer bg-white p-0.5"
                  />
                </div>
              </div>

              {/* Multi-Step Wizard Toggle — forms only; chatbots are already one question at a time */}
              {!isChatbot && (
                <div className="pt-2 flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Multi-Step Wizard Form</span>
                      <span className="text-[11px] text-slate-500">Break questions across progressive pages with a progress bar.</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMultiStep}
                      onChange={(e) => setIsMultiStep(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}
            </div>

            {/* Fields List Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-indigo-600" />
                  {isChatbot ? `Data the Bot Collects (${fields.length})` : `Form Questions (${fields.length})`}
                </h3>

                <button
                  onClick={() => setShowAddFieldModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => {
                  const isSelected = field.id === selectedFieldId;

                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-slate-900 text-sm truncate">
                                {field.label || "Untitled Question"}
                              </h4>
                              {field.required && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {field.type}
                              </span>
                              {isMultiStep && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Layers className="w-2.5 h-2.5" /> Page {field.page || 1}
                                </span>
                              )}
                              {field.conditionalRule?.fieldId && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Split className="w-2.5 h-2.5" /> Conditional
                                </span>
                              )}
                            </div>

                            {field.placeholder && (
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                Placeholder: &quot;{field.placeholder}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveField(idx, "up")}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === fields.length - 1}
                            onClick={() => handleMoveField(idx, "down")}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Question Settings (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-600" />
                  Question Settings
                </h3>
                {selectedField && (
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedField.id}</span>
                )}
              </div>

              {selectedField ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Question Label
                    </label>
                    <input
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                      className="w-full text-sm text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Input Type
                    </label>
                    <select
                      value={selectedField.type}
                      onChange={(e) => {
                        const newType = e.target.value as FieldTypeEnum;
                        const needsOptions = ["select", "radio", "checkbox"].includes(newType);
                        handleUpdateField(selectedField.id, {
                          type: newType,
                          options: needsOptions ? selectedField.options || ["Option 1", "Option 2"] : undefined,
                        });
                      }}
                      className="w-full text-sm text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      {AVAILABLE_FIELD_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label} ({t.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {!["select", "radio", "checkbox", "rating", "date", "file"].includes(selectedField.type) && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ""}
                        onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value || undefined })}
                        placeholder="e.g. Jane Doe"
                        className="w-full text-sm text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Help Text
                    </label>
                    <input
                      type="text"
                      value={selectedField.helpText || ""}
                      onChange={(e) => handleUpdateField(selectedField.id, { helpText: e.target.value || undefined })}
                      placeholder="Short guidance shown below the question"
                      className="w-full text-sm text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {isMultiStep && (
                    <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">Wizard Page</span>
                        <span className="text-[11px] text-slate-500">Which step this question appears on</span>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={selectedField.page || 1}
                        onChange={(e) => {
                          const page = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                          handleUpdateField(selectedField.id, { page });
                        }}
                        aria-label="Wizard page number"
                        className="w-20 text-sm text-slate-900 text-center px-2 py-1.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Required</span>
                      <span className="text-[11px] text-slate-500">Mandatory to submit</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Conditional Logic Rule Section */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Split className="w-3.5 h-3.5 text-indigo-600" />
                        Conditional Show/Hide Logic
                      </span>
                      {selectedField.conditionalRule?.fieldId && (
                        <button
                          type="button"
                          onClick={() => handleUpdateField(selectedField.id, { conditionalRule: undefined })}
                          className="text-[10px] font-bold text-red-600 hover:underline"
                        >
                          Clear Rule
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] text-slate-600 font-medium">
                        Show this question only when:
                      </label>
                      <select
                        value={selectedField.conditionalRule?.fieldId || ""}
                        onChange={(e) => {
                          const targetFieldId = e.target.value;
                          if (!targetFieldId) {
                            handleUpdateField(selectedField.id, { conditionalRule: undefined });
                          } else {
                            handleUpdateField(selectedField.id, {
                              conditionalRule: {
                                fieldId: targetFieldId,
                                operator: selectedField.conditionalRule?.operator || "equals",
                                value: selectedField.conditionalRule?.value || "",
                              },
                            });
                          }
                        }}
                        className="w-full text-xs text-slate-900 px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Always show (No condition) --</option>
                        {otherFields.map((f) => (
                          <option key={f.id} value={f.id}>
                            Question: {f.label}
                          </option>
                        ))}
                      </select>

                      {selectedField.conditionalRule?.fieldId && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <select
                            value={selectedField.conditionalRule.operator}
                            onChange={(e) => {
                              handleUpdateField(selectedField.id, {
                                conditionalRule: {
                                  ...selectedField.conditionalRule!,
                                  operator: e.target.value as any,
                                },
                              });
                            }}
                            className="text-xs text-slate-900 px-2 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Does Not Equal</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                            <option value="is_not_empty">Is Answered</option>
                          </select>

                          {selectedField.conditionalRule.operator !== "is_not_empty" && (
                            <input
                              type="text"
                              value={selectedField.conditionalRule.value || ""}
                              onChange={(e) => {
                                handleUpdateField(selectedField.id, {
                                  conditionalRule: {
                                    ...selectedField.conditionalRule!,
                                    value: e.target.value,
                                  },
                                });
                              }}
                              placeholder="Target Answer..."
                              className="text-xs text-slate-900 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {["select", "radio", "checkbox"].includes(selectedField.type) && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-xs font-semibold text-slate-700">
                        Choices / Options
                      </label>

                      <div className="space-y-2">
                        {(selectedField.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(selectedField.options || [])];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateField(selectedField.id, { options: newOpts });
                              }}
                              className="flex-1 text-xs text-slate-900 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = (selectedField.options || []).filter((_, i) => i !== optIdx);
                                handleUpdateField(selectedField.id, { options: newOpts });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Remove Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = [...(selectedField.options || []), `Option ${(selectedField.options || []).length + 1}`];
                          handleUpdateField(selectedField.id, { options: newOpts });
                        }}
                        className="w-full mt-2 py-1.5 px-3 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition border border-indigo-100 flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Another Option
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Select a question on the left to customize its details.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share & Embed Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isChatbot ? "Share & Embed Your Chatbot" : "Share Your Form"}
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Chatbot sharing: standalone chat link + website widget */}
            {isChatbot && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  Standalone Chatbot Link
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  Recommended
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={chatbotUrl}
                  className="flex-1 text-xs text-slate-700 bg-white border border-indigo-200 rounded-xl px-3 py-2 font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(chatbotUrl, setCopiedChatbotLink)}
                  className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition flex items-center gap-1"
                >
                  {copiedChatbotLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedChatbotLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
            )}

            {/* Chatbot sharing: 1-line floating website widget */}
            {isChatbot && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-400" />
                  1-Line Floating Website Widget
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  Shopify & Webflow
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={embedSnippet}
                  className="flex-1 text-xs text-indigo-200 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(embedSnippet, setCopiedEmbedSnippet)}
                  className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition flex items-center gap-1"
                >
                  {copiedEmbedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmbedSnippet ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
            )}

            {/* Form sharing: public web form URL */}
            {!isChatbot && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-600" />
                Public Web Form URL
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicFormUrl}
                  className="flex-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(publicFormUrl, setCopiedLink)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Question</h3>
                <p className="text-xs text-slate-500">Choose a question type to add to your form.</p>
              </div>
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {AVAILABLE_FIELD_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => handleAddNewField(t.type)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition group"
                >
                  <p className="font-semibold text-slate-900 text-xs group-hover:text-indigo-600 transition">
                    {t.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
