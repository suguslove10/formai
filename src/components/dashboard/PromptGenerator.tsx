"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Wand2, Lightbulb, AlertCircle, FileText, Bot } from "lucide-react";

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
    </div>
    </div>
  );
}
