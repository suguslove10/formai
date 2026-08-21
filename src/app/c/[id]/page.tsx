import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConversationalChatbot } from "@/components/chat/ConversationalChatbot";
import { FormFieldType } from "@/lib/validations/form";
import Link from "next/link";
import { Sparkles, Bot, AlertCircle } from "lucide-react";

interface ChatbotPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ChatbotPageProps) {
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    select: { title: true, description: true },
  });

  if (!form) {
    return { title: "Chatbot Not Found — FormAI" };
  }

  return {
    title: `${form.title} — AI Assistant | FormAI`,
    description: form.description || "Chat with AI to complete this form.",
  };
}

export default async function ChatbotPage({ params }: ChatbotPageProps) {
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
          <h1 className="text-xl font-bold text-slate-900">Chatbot is in Draft Mode</h1>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            This AI assistant is currently unpublished and not accepting responses.
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
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col justify-between py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center">
        <ConversationalChatbot
          form={{
            id: form.id,
            title: form.title,
            description: form.description,
            fieldsJson: (form.fieldsJson as unknown as FormFieldType[]) || [],
            themeColor: form.themeColor,
            botName: form.botName,
            botAvatar: form.botAvatar,
            botAvatarUrl: form.botAvatarUrl,
          }}
        />

        {/* Footer Branding (hidden for white-labeled bots) */}
        {!form.removeBranding && (
          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300/60 hover:text-white font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Powered by <span className="font-bold text-white">FormAI Chatbot</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
