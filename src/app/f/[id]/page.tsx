import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicFormRenderer } from "@/components/form/PublicFormRenderer";
import { FormFieldType } from "@/lib/validations/form";
import Link from "next/link";
import { Sparkles, AlertCircle } from "lucide-react";

interface PublicFormPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PublicFormPageProps) {
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    select: { title: true, description: true },
  });

  if (!form) {
    return { title: "Form Not Found — FormAI" };
  }

  return {
    title: `${form.title} — FormAI`,
    description: form.description || "Submit your response on FormAI.",
  };
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { id } = params;

  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) {
    notFound();
  }

  if (form.status !== "published") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Form is Unpublished</h1>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            This form is currently in draft mode and is not accepting responses.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
          >
            Go to FormAI Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-slate-50 to-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Form Renderer Component */}
        <PublicFormRenderer
          form={{
            id: form.id,
            title: form.title,
            description: form.description,
            fieldsJson: (form.fieldsJson as unknown as FormFieldType[]) || [],
          }}
        />

        {/* FormAI Brand Footer */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Powered by <span className="font-bold text-slate-700">FormAI</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
