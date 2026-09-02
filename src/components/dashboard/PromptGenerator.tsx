"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  Lightbulb, 
  AlertCircle, 
  FileText, 
  Bot, 
  ArrowRight, 
  Zap,
  MessageCircle,
  Mail,
  X,
  CheckCircle2
} from "lucide-react";

const FORM_STARTER_PROMPTS = [
  "Customer satisfaction survey for our SaaS product with a 1-5 rating and open feedback",
  "Job application form for a Senior Software Engineer with resume upload and tech stack select",
  "Tech conference event registration form with workshop selection and dietary restrictions",
  "Client onboarding questionnaire for a digital marketing agency",
];

const CHATBOT_STARTER_PROMPTS = [
  "Customer Support FAQ Chatbot that answers questions about pricing and captures lead emails",
  "Interactive Restaurant Reservation Assistant with table size, date, and dietary preferences",
  "HR Employee Onboarding Chatbot with document submission and team selection",
  "Product Recommendation Assistant with interactive ratings and preferences",
];

export function PromptGenerator({
  defaultProductType = "form",
}: {
  defaultProductType?: "form" | "chatbot";
}) {
  const router = useRouter();
  const productType = defaultProductType;
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const fullPrompt = productType === "chatbot" 
        ? `Create an interactive conversational AI Chatbot: ${prompt.trim()}`
        : prompt.trim();

      const res = await fetch("/api/forms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, productType }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "PLAN_LIMIT_REACHED" || res.status === 403) {
          setUpgradeMsg(
            data.error ||
              "You've reached your plan limit for bots/forms. Upgrade to Pro to create up to 5 bots with unlimited responses!"
          );
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(data.error || "Failed to generate. Please try again.");
      }

      if (data.formId) {
        router.push(`/dashboard/forms/${data.formId}/edit`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const activePrompts = productType === "chatbot" ? CHATBOT_STARTER_PROMPTS : FORM_STARTER_PROMPTS;

  return (
    <div className="relative group rounded-3xl p-[1.5px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 shadow-xl shadow-indigo-500/10">
      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Product Selection Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-transform shadow-md ${
              productType === "chatbot"
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-200"
                : "bg-slate-900 text-white shadow-slate-200"
            }`}>
              {productType === "chatbot" ? <Bot className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {productType === "chatbot" ? "Build an AI Chatbot Assistant" : "Create a Web Form with AI"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {productType === "chatbot"
                  ? "Conversational agent with RAG Knowledge Base & 1-line website widget."
                  : "Structured multi-field form with instant validation and conditional rules."}
              </p>
            </div>
          </div>

          <span
            className={`self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              productType === "chatbot"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200/80"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
            aria-label={`Active Mode: ${productType === "chatbot" ? "AI Chatbot" : "Classic Form"}`}
          >
            <span className={`w-2 h-2 rounded-full ${productType === "chatbot" ? "bg-indigo-600 animate-pulse" : "bg-slate-500"}`} aria-hidden="true" />
            {productType === "chatbot" ? "Mode: AI Chatbot" : "Mode: Classic Form"}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 rise-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              rows={4}
              placeholder={
                productType === "chatbot"
                  ? "Describe your chatbot (e.g. 'A 24/7 customer support chatbot that answers questions about pricing, returns, and collects visitor email...')"
                  : "Describe your form (e.g. 'A high-converting product feedback survey with star rating, NPS score, and feature requests...')"
              }
              className="w-full px-4.5 py-4 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition resize-none disabled:opacity-60 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                Dual Engine
              </span>
              <span>OpenAI GPT-4o & Claude 3.7 Sonnet</span>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 text-white font-semibold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] ${
                productType === "chatbot"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 shadow-indigo-500/20"
                  : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Schema with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-indigo-200" />
                  <span>{productType === "chatbot" ? "Generate AI Chatbot" : "Generate Web Form"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Starter Prompts */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span>Click any example to auto-fill</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {activePrompts.map((exPrompt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => setPrompt(exPrompt)}
                className="text-xs text-slate-600 hover:text-indigo-700 bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 px-3 py-2 rounded-xl transition text-left disabled:opacity-50 flex items-start gap-2 group"
              >
                <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{exPrompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Required Modal Dialog */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-current" />
                Plan Limit Reached
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Unlock More AI Chatbots
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {upgradeMsg || "You've reached your Free plan limit of 1 bot. Upgrade to Pro to create up to 5 bots with unlimited responses and custom Knowledge Base training!"}
              </p>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-indigo-950">Pro Plan Highlights (₹1,999/mo):</p>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span><strong>5 Active Bots & Forms</strong></span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span><strong>Unlimited Monthly Responses</strong></span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span><strong>Remove FormAI Branding</strong></span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>RAG Knowledge Base FAQ Training</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="https://wa.me/918660844123?text=Hi!%20I%20reached%20my%20bot%20limit%20on%20FormAI%20and%20want%20to%20upgrade%20to%20Pro."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-200"
              >
                <MessageCircle className="w-4 h-4" />
                Upgrade via WhatsApp (8660844123)
              </a>

              <a
                href="mailto:sugugalag@gmail.com?subject=FormAI%20Pro%20Upgrade%20Request"
                className="block text-center text-xs text-slate-600 hover:text-slate-900 font-medium hover:underline py-1 transition-colors"
              >
                Or email <span className="font-semibold text-slate-800">sugugalag@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

