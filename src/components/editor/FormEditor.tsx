"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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
  ShieldCheck
} from "lucide-react";
import { FieldTypeEnum, FormFieldType } from "@/lib/validations/form";
import { generateId } from "@/lib/utils";
import { PublicFormRenderer } from "@/components/form/PublicFormRenderer";
import { ConversationalChatbot } from "@/components/chat/ConversationalChatbot";

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
    title: string;
    description?: string | null;
    fieldsJson: FormFieldType[];
    status: "draft" | "published";
    botName?: string;
    botGreeting?: string | null;
    botPersona?: string;
    knowledgeBase?: string | null;
  };
}

export function FormEditor({ initialForm }: FormEditorProps) {
  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description || "");
  const [fields, setFields] = useState<FormFieldType[]>(initialForm.fieldsJson || []);
  const [status, setStatus] = useState<"draft" | "published">(initialForm.status);
  
  // Bot Persona & Knowledge Base Settings
  const [botName, setBotName] = useState(initialForm.botName || "FormAI Assistant");
  const [botGreeting, setBotGreeting] = useState(initialForm.botGreeting || "");
  const [botPersona, setBotPersona] = useState(initialForm.botPersona || "friendly");
  const [knowledgeBase, setKnowledgeBase] = useState(initialForm.knowledgeBase || "");

  const [activeTab, setActiveTab] = useState<"editor" | "knowledge" | "preview" | "chatbot">("editor");
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
  const triggerSave = useCallback(
    async (
      updatedTitle: string,
      updatedDescription: string,
      updatedFields: FormFieldType[],
      updatedStatus: "draft" | "published",
      updatedBotName: string,
      updatedBotGreeting: string,
      updatedBotPersona: string,
      updatedKnowledgeBase: string
    ) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/forms/${initialForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: updatedTitle,
            description: updatedDescription,
            fields: updatedFields,
            status: updatedStatus,
            botName: updatedBotName,
            botGreeting: updatedBotGreeting,
            botPersona: updatedBotPersona,
            knowledgeBase: updatedKnowledgeBase,
          }),
        });

        if (!res.ok) {
          throw new Error("Save request failed");
        }
        setSaveStatus("saved");
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("error");
      }
    },
    [initialForm.id]
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
      triggerSave(
        title, 
        description, 
        fields, 
        status, 
        botName, 
        botGreeting, 
        botPersona, 
        knowledgeBase
      );
    }, 800);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [title, description, fields, status, botName, botGreeting, botPersona, knowledgeBase, triggerSave]);

  const handleTogglePublish = async () => {
    const nextStatus = status === "published" ? "draft" : "published";
    setStatus(nextStatus);
    await triggerSave(
      title, 
      description, 
      fields, 
      nextStatus, 
      botName, 
      botGreeting, 
      botPersona, 
      knowledgeBase
    );
  };

  const handleUpdateField = (id: string, updates: Partial<FormFieldType>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleDeleteField = (id: string) => {
    if (fields.length <= 1) {
      alert("A form must have at least one question.");
      return;
    }
    const filtered = fields.filter((f) => f.id !== id);
    setFields(filtered);
    if (selectedFieldId === id) {
      setSelectedFieldId(filtered[0]?.id || null);
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

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="space-y-6">
      {/* Editor Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg line-clamp-1">{title || "Untitled Form"}</span>
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
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "editor"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              Questions
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "knowledge"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Bot & Knowledge
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "preview"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Form
            </button>
            <button
              onClick={() => setActiveTab("chatbot")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "chatbot"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AI Chatbot
            </button>
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
            {status === "published" ? "Unpublish Form" : "Publish Form"}
          </button>
        </div>
      </div>

      {/* Mode View Switcher */}
      {activeTab === "knowledge" ? (
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
            {/* Bot Name */}
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

            {/* Bot Persona / Tone */}
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

          {/* Custom Welcome Greeting */}
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

          {/* Knowledge Base & FAQs Textarea */}
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
              Paste your company background, pricing, FAQs, return policies, or instructions below. If respondents ask questions during the chat, the bot will answer accurately!
            </p>
            <textarea
              rows={8}
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              placeholder={`Example:
- Business Name: Artisan Bakery Co.
- Hours: Mon-Sat 7am to 6pm, Sunday 8am to 2pm.
- Catering: We offer gluten-free sourdough and pastries for orders over 10 people.
- Return policy: If you are unsatisfied with your order, we provide full refunds within 24 hours.`}
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
                Live interactive Jotform-style AI Chatbot preview. Fill it out conversationally!
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
                Live interactive preview of your classic web form.
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
            </div>

            {/* Fields List Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-indigo-600" />
                  Form Questions ({fields.length})
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
                            </div>

                            {field.placeholder && (
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                Placeholder: &quot;{field.placeholder}&quot;
                              </p>
                            )}

                            {field.options && field.options.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {field.options.map((opt, i) => (
                                  <span
                                    key={i}
                                    className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </div>
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

                  {["text", "email", "number", "textarea"].includes(selectedField.type) && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ""}
                        onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                        placeholder="e.g. Type your answer here..."
                        className="w-full text-sm text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  )}

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
                <h3 className="text-lg font-bold text-slate-900">Share & Embed FormAI</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: AI Chatbot Link */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    Interactive AI Chatbot Link
                  </span>
                  <Link
                    href={`/c/${initialForm.id}`}
                    target="_blank"
                    className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={chatbotUrl}
                    className="flex-1 text-xs text-slate-700 px-3 py-2 bg-white border border-indigo-200 rounded-xl font-mono select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(chatbotUrl, setCopiedChatbotLink)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
                  >
                    {copiedChatbotLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedChatbotLink ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Option 2: Classic Web Form Link */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-600" />
                    Classic Web Form Link
                  </span>
                  <Link
                    href={`/f/${initialForm.id}`}
                    target="_blank"
                    className="text-[11px] font-semibold text-slate-600 hover:underline flex items-center gap-1"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicFormUrl}
                    className="flex-1 text-xs text-slate-700 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(publicFormUrl, setCopiedLink)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Option 3: Embed Widget Snippet */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-400" />
                    Embed Floating Website Widget (1-Line Code)
                  </span>
                  <button
                    onClick={() => copyToClipboard(embedSnippet, setCopiedEmbedSnippet)}
                    className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1"
                  >
                    {copiedEmbedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedEmbedSnippet ? "Snippet Copied!" : "Copy Code"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Paste this before &lt;/body&gt; in your HTML, Shopify, WordPress, or Webflow site to display the floating AI chat bubble:
                </p>
                <textarea
                  readOnly
                  rows={2}
                  value={embedSnippet}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-800 text-indigo-200 p-2.5 rounded-xl select-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Choose Field Type</h3>
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {AVAILABLE_FIELD_TYPES.map((fType) => (
                <button
                  key={fType.type}
                  onClick={() => handleAddNewField(fType.type)}
                  className="p-3 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
                >
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600">
                    {fType.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{fType.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
