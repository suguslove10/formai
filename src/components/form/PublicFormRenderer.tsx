"use client";

import { useState } from "react";
import { FormFieldType } from "@/lib/validations/form";
import { 
  Star, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Send,
  Calendar,
  FileCheck
} from "lucide-react";

interface PublicFormRendererProps {
  form: {
    id: string;
    title: string;
    description?: string | null;
    fieldsJson: FormFieldType[];
  };
  isPreview?: boolean;
}

export function PublicFormRenderer({ form, isPreview = false }: PublicFormRendererProps) {
  const fields = form.fieldsJson || [];
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field when changed
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxChange = (fieldId: string, optionValue: string, checked: boolean) => {
    const currentList: string[] = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    let updated: string[];
    if (checked) {
      updated = [...currentList, optionValue];
    } else {
      updated = currentList.filter((item) => item !== optionValue);
    }
    handleInputChange(fieldId, updated);
  };

  const validateClient = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const val = formData[field.id];

      if (field.required) {
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = "This question is required";
          continue;
        }
      }

      if (val !== undefined && val !== null && val !== "") {
        if (field.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof val !== "string" || !emailRegex.test(val)) {
            newErrors[field.id] = "Please enter a valid email address";
          }
        } else if (field.type === "number") {
          if (isNaN(Number(val))) {
            newErrors[field.id] = "Please enter a valid number";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      alert("This is a live preview. In production, this form will submit directly to FormAI database.");
      return;
    }

    if (!validateClient()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
          throw new Error("Please correct the errors indicated below.");
        }
        throw new Error(data.error || "Failed to submit response.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank you!
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 mb-8">
          Your response for <span className="font-semibold text-slate-800">&quot;{form.title}&quot;</span> has been recorded.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormData({});
            setIsSubmitted(false);
          }}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="border-b border-slate-100 pb-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {form.title || "Untitled Form"}
        </h1>
        {form.description && (
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {form.description}
          </p>
        )}
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Error</p>
            <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field, idx) => {
          const hasError = !!errors[field.id];

          return (
            <div
              key={field.id || idx}
              className="space-y-2 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition"
            >
              <label className="block text-sm font-semibold text-slate-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
              </label>

              {field.helpText && (
                <p className="text-xs text-slate-500 mb-1">{field.helpText}</p>
              )}

              {/* Render by field.type */}
              {field.type === "text" && (
                <input
                  type="text"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder || "Your answer"}
                  className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    hasError ? "border-red-400 focus:ring-red-400" : "border-slate-300"
                  }`}
                />
              )}

              {field.type === "email" && (
                <input
                  type="email"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder || "name@example.com"}
                  className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    hasError ? "border-red-400 focus:ring-red-400" : "border-slate-300"
                  }`}
                />
              )}

              {field.type === "number" && (
                <input
                  type="number"
                  value={formData[field.id] !== undefined ? formData[field.id] : ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder || "0"}
                  className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    hasError ? "border-red-400 focus:ring-red-400" : "border-slate-300"
                  }`}
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  rows={3}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder || "Type your detailed answer here..."}
                  className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none ${
                    hasError ? "border-red-400 focus:ring-red-400" : "border-slate-300"
                  }`}
                />
              )}

              {field.type === "select" && (
                <select
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    hasError ? "border-red-400 focus:ring-red-400" : "border-slate-300"
                  }`}
                >
                  <option value="">-- Select an option --</option>
                  {(field.options || []).map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "radio" && (
                <div className="space-y-2 pt-1">
                  {(field.options || []).map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={formData[field.id] === opt}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-800">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "checkbox" && (
                <div className="space-y-2 pt-1">
                  {(field.options || ["Yes, I agree"]).map((opt, i) => {
                    const isChecked = Array.isArray(formData[field.id])
                      ? formData[field.id].includes(opt)
                      : Boolean(formData[field.id]);

                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          value={opt}
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-800">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === "rating" && (
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentRating = Number(formData[field.id]) || 0;
                      const isFilled = star <= currentRating;

                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleInputChange(field.id, star)}
                          className="p-1.5 rounded-lg hover:scale-110 transition focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              isFilled
                                ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                                : "text-slate-300 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    {formData[field.id] && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md ml-2">
                        {formData[field.id]} / 5
                      </span>
                    )}
                  </div>
                </div>
              )}

              {field.type === "date" && (
                <div className="relative">
                  <input
                    type="date"
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                      hasError ? "border-red-400 focus:ring-red-400" : "border-slate-300"
                    }`}
                  />
                </div>
              )}

              {field.type === "file" && (
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-white transition cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to select or drag and drop a file
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports PDF, DOCX, PNG, JPG (S3 interface stubbed)
                  </p>
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleInputChange(field.id, `stub_upload://${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
                      }
                    }}
                    className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {formData[field.id] && (
                    <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center justify-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      Attached: {formData[field.id]}
                    </div>
                  )}
                </div>
              )}

              {hasError && (
                <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors[field.id]}
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting Response...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Form</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
