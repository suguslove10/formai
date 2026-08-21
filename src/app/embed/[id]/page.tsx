import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConversationalChatbot } from "@/components/chat/ConversationalChatbot";
import { FormFieldType } from "@/lib/validations/form";

interface EmbedPageProps {
  params: {
    id: string;
  };
}

export default async function EmbedChatbotPage({ params }: EmbedPageProps) {
  const { id } = params;

  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) {
    notFound();
  }

  if (form.status !== "published") {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500">
          This assistant is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      <ConversationalChatbot
        form={{
          id: form.id,
          title: form.title,
          description: form.description,
          fieldsJson: (form.fieldsJson as unknown as FormFieldType[]) || [],
          themeColor: form.themeColor,
          botName: form.botName,
          botAvatar: form.botAvatar,
        }}
        isEmbed={true}
      />
    </div>
  );
}
