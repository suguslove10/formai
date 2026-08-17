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

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      <ConversationalChatbot
        form={{
          id: form.id,
          title: form.title,
          description: form.description,
          fieldsJson: (form.fieldsJson as unknown as FormFieldType[]) || [],
        }}
        isEmbed={true}
      />
    </div>
  );
}
