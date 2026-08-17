"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Download, 
  ChevronLeft, 
  Calendar, 
  Inbox, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  X, 
  FileSpreadsheet,
  CheckCircle2,
  Flame,
  Zap,
  Moon,
  Bot
} from "lucide-react";
import { FormFieldType } from "@/lib/validations/form";
import { formatDate } from "@/lib/utils";

interface ResponseRecord {
  id: string;
  dataJson: Record<string, any>;
  createdAt: string | Date;
  sentiment?: string | null;
  leadScore?: string | null;
  aiSummary?: string | null;
}

interface ResponsesTableProps {
  form: {
    id: string;
    title: string;
    description?: string | null;
    fieldsJson: FormFieldType[];
    status: "draft" | "published";
  };
  responses: ResponseRecord[];
}

export function ResponsesTable({ form, responses }: ResponsesTableProps) {
  const fields = form.fieldsJson || [];
  const [selectedResponse, setSelectedResponse] = useState<ResponseRecord | null>(null);

  // Client-Side CSV Export (RFC-4180 compliant)
  const handleExportCSV = () => {
    if (responses.length === 0) {
      alert("No responses available to export.");
      return;
    }

    // CSV Headers: Submission ID, Timestamp, Sentiment, Lead Score, AI Summary, followed by Field Labels
    const headers = [
      "Submission ID",
      "Submitted At",
      "AI Sentiment",
      "Lead Priority",
      "AI Summary",
      ...fields.map((f) => f.label.replace(/"/g, '""')),
    ];

    // CSV Rows
    const rows = responses.map((resp) => {
      const rowData = [
        resp.id,
        new Date(resp.createdAt).toISOString(),
        resp.sentiment || "N/A",
        resp.leadScore || "N/A",
        resp.aiSummary || "",
        ...fields.map((field) => {
          const val = resp.dataJson[field.id];
          if (val === undefined || val === null) return "";
          if (Array.isArray(val)) return val.join("; ");
          return String(val);
        }),
      ];

      // Escape quotes and wrap each cell in quotes
      return rowData.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedTitle = form.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `${sanitizedTitle}_responses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSentimentBadge = (sentiment?: string | null) => {
    if (!sentiment) return null;
    switch (sentiment.toLowerCase()) {
      case "positive":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            🟢 Positive
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            🔴 Negative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            🟡 Neutral
          </span>
        );
    }
  };

  const getLeadBadge = (leadScore?: string | null) => {
    if (!leadScore) return null;
    switch (leadScore.toLowerCase()) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Flame className="w-3 h-3 text-purple-600" /> High Lead
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Zap className="w-3 h-3 text-indigo-600" /> Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            <Moon className="w-3 h-3 text-slate-500" /> Standard
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <h1 className="font-bold text-slate-900 text-lg sm:text-xl">{form.title}</h1>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  form.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {form.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Collected <span className="font-semibold text-slate-900">{responses.length}</span> response{responses.length === 1 ? "" : "s"} • AI Sentiment & Lead Scoring Enabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/dashboard/forms/${form.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            Edit Form
          </Link>

          {form.status === "published" && (
            <Link
              href={`/c/${form.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              AI Chatbot
            </Link>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Responses Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {responses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No responses recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Share your Chatbot or public form link to start collecting responses from users.
            </p>
            {form.status === "published" ? (
              <div className="flex items-center justify-center gap-3">
                <Link
                  href={`/c/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Test AI Chatbot
                </Link>
                <Link
                  href={`/f/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Public Form
                </Link>
              </div>
            ) : (
              <Link
                href={`/dashboard/forms/${form.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                Publish Form Now
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Submitted At</th>
                  <th className="py-3.5 px-4 min-w-[120px]">AI Sentiment</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Lead Score</th>
                  {fields.map((field) => (
                    <th key={field.id} className="py-3.5 px-4 min-w-[160px] max-w-[240px] truncate">
                      {field.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {responses.map((resp, index) => (
                  <tr
                    key={resp.id}
                    className="hover:bg-indigo-50/30 transition group cursor-pointer"
                    onClick={() => setSelectedResponse(resp)}
                  >
                    <td className="py-3 px-4 text-xs font-medium text-slate-400 text-center">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(resp.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {getSentimentBadge(resp.sentiment)}
                    </td>
                    <td className="py-3 px-4">
                      {getLeadBadge(resp.leadScore)}
                    </td>
                    {fields.map((field) => {
                      const val = resp.dataJson[field.id];
                      let displayVal = "-";

                      if (val !== undefined && val !== null && val !== "") {
                        if (Array.isArray(val)) {
                          displayVal = val.join(", ");
                        } else if (typeof val === "boolean") {
                          displayVal = val ? "Yes" : "No";
                        } else {
                          displayVal = String(val);
                        }
                      }

                      return (
                        <td key={field.id} className="py-3 px-4 text-xs text-slate-800 max-w-[240px] truncate">
                          {displayVal}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResponse(resp);
                        }}
                        className="p-1.5 text-slate-400 group-hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View Full Response"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Response Detail Modal Drawer */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submission Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted on {formatDate(selectedResponse.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Summary & Lead Box */}
            {(selectedResponse.sentiment || selectedResponse.aiSummary) && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Executive Analysis
                  </span>
                  <div className="flex items-center gap-2">
                    {getSentimentBadge(selectedResponse.sentiment)}
                    {getLeadBadge(selectedResponse.leadScore)}
                  </div>
                </div>
                {selectedResponse.aiSummary && (
                  <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                    &ldquo;{selectedResponse.aiSummary}&rdquo;
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field) => {
                const answer = selectedResponse.dataJson[field.id];
                return (
                  <div key={field.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {field.label}
                    </p>
                    <p className="text-sm font-medium text-slate-900 break-words">
                      {answer !== undefined && answer !== null && answer !== ""
                        ? Array.isArray(answer)
                          ? answer.join(", ")
                          : String(answer)
                        : <span className="text-slate-400 italic">No answer provided</span>}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
