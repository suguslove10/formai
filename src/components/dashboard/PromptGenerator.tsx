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
  // The dashboard's product tab is the single source of truth for what
  // gets created — no second switcher inside the generator.
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
    <div className="rounded-[26px] p-[1.5px] bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50 shadow-lg shadow-indigo-500/10">
    <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Product Selection Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition shadow-sm ${
            productType === "chatbot"
              ? "bg-indigo-600 text-white shadow-indigo-200"
              : "bg-slate-900 text-white shadow-slate-200"
          }`}>
            {productType === "chatbot" ? <Bot className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {productType === "chatbot" ? "Build an AI Chatbot Assistant" : "Create an AI Web Form"}
            </h2>
            <p className="text-xs text-slate-500">
              {productType === "chatbot"
                ? "Jotform-style conversational agent with Knowledge Base & floating website widget."
                : "Classic structured web form with validations and responsive inputs."}
            </p>
          </div>
        </div>

        <span
          className={`self-start sm:self-auto text-[11px] font-bold px-3 py-1.5 rounded-full border ${
            productType === "chatbot"
              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {productType === "chatbot" ? "Creates an AI Chatbot" : "Creates a Web Form"}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
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
                ? "e.g. Create a 24/7 Customer Support FAQ Chatbot that answers shipping questions and collects user emails..."
                : "e.g. Create a 360-degree employee performance review form with leadership ratings and improvement areas..."
            }
            className="w-full px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Dual Engine: OpenAI & Anthropic Claude</span>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 text-white font-semibold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition hover:shadow ${
              productType === "chatbot"
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{productType === "chatbot" ? "Generate AI Chatbot" : "Generate Form"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Starter Prompts */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Starter Prompts for {productType === "chatbot" ? "AI Chatbots" : "Forms"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {activePrompts.map((exPrompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => setPrompt(exPrompt)}
              className="text-xs text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition text-left disabled:opacity-50"
            >
              {exPrompt}
            </button>
          ))}
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
                className="block text-center text-[11px] text-slate-500 hover:text-slate-800 font-medium"
              >
                Or email sugugalag@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
