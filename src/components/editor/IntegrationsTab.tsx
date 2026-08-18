"use client";

import { useState } from "react";
import { 
  Webhook, 
  Slack, 
  Globe, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Flame
} from "lucide-react";

interface IntegrationsTabProps {
  formId: string;
  formTitle: string;
  webhookUrl?: string | null;
  customDomain?: string | null;
  removeBranding?: boolean;
  onUpdateSettings: (settings: {
    webhookUrl?: string;
    customDomain?: string;
    removeBranding?: boolean;
  }) => void;
}

export function IntegrationsTab({
  formId,
  formTitle,
  webhookUrl: initialWebhook = "",
  customDomain: initialDomain = "",
  removeBranding: initialRemoveBranding = false,
  onUpdateSettings,
}: IntegrationsTabProps) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhook || "");
  const [customDomain, setCustomDomain] = useState(initialDomain || "");
  const [removeBranding, setRemoveBranding] = useState(initialRemoveBranding);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      webhookUrl: webhookUrl.trim(),
      customDomain: customDomain.trim() || undefined,
      removeBranding,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim() || !webhookUrl.startsWith("http")) {
      alert("Please enter a valid HTTP/HTTPS Webhook URL before testing.");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const payload = {
        event: "test.event",
        formId,
        formTitle,
        responseId: "test_resp_" + Date.now(),
        data: {
          test_name: "Sarah Connor",
          test_email: "sarah@cyberdyne.com",
          test_rating: 5,
          utm_source: "google",
          utm_campaign: "enterprise_launch",
        },
        sentiment: "positive",
        leadScore: "high",
        aiSummary: "Test submission triggered from FormAI Integrations Console.",
        submittedAt: new Date().toISOString(),
      };

      const isSlack = webhookUrl.includes("hooks.slack.com");
      const isDiscord = webhookUrl.includes("discord.com/api/webhooks");

      let bodyToSend: any = payload;
      if (isSlack) {
        bodyToSend = {
          text: `🧪 *FormAI Webhook Test* on *${formTitle}* — Everything is working!`,
        };
      } else if (isDiscord) {
        bodyToSend = {
          username: "FormAI Test",
          content: `🧪 **FormAI Webhook Test** on **${formTitle}** — Successfully verified!`,
        };
      }

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors", // Allow test dispatches without CORS failure
        body: JSON.stringify(bodyToSend),
      });

      setTestResult({
        success: true,
        message: "Test payload dispatched successfully to your webhook destination!",
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to deliver test webhook.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Enterprise Integrations & Automation</h3>
            <p className="text-xs text-slate-500">
              Deliver form submissions and chatbot leads in real-time to Slack, Zapier, Make, n8n, and custom webhooks.
            </p>
          </div>
        </div>
      </div>

      {/* Webhook & Alerts Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">Outbound Webhooks (Slack / Zapier / Make)</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            HMAC Signed
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Webhook Endpoint URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/... or https://hook.eu1.make.com/..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900"
            />
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTesting || !webhookUrl}
              className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition flex items-center gap-1.5 disabled:opacity-40"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Test Payload</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Paste any standard webhook URL, Slack Incoming Webhook, Discord Webhook, or Zapier Catch Hook.
          </p>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Custom Domains & White-labeling */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">Custom Domain & White-Labeling (CNAME)</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Enterprise
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Custom Domain (e.g. forms.yourcompany.com)
          </label>
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="forms.acme.com"
            className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900"
          />
          <p className="text-[11px] text-slate-500">
            Point a CNAME record from your DNS provider to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">cname.formai.app</code>.
          </p>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition">
            <input
              type="checkbox"
              checked={removeBranding}
              onChange={(e) => setRemoveBranding(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Remove &quot;Powered by FormAI&quot; Badge</span>
              <span className="text-[11px] text-slate-500">Present a 100% white-labeled experience to your respondents.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Save Settings Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Settings Saved!
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition"
        >
          Save Integrations
        </button>
      </div>
    </div>
  );
}
