import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { FormEditor } from "@/components/editor/FormEditor";
import { FormFieldType } from "@/lib/validations/form";

interface FormEditPageProps {
  params: {
    id: string;
  };
}

export default async function FormEditPage({ params }: FormEditPageProps) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = params;

  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) {
    notFound();
  }

  if (form.userId !== userId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700">
        <h2 className="text-lg font-bold">Unauthorized</h2>
        <p className="text-xs text-red-600 mt-1">You do not have permission to edit this form.</p>
      </div>
    );
  }

  return (
    <FormEditor
      initialForm={{
        id: form.id,
        type: form.type,
        title: form.title,
        description: form.description,
        fieldsJson: (form.fieldsJson as unknown as FormFieldType[]) || [],
        status: form.status,
        botName: form.botName,
        botGreeting: form.botGreeting,
        botPersona: form.botPersona,
        botAvatar: form.botAvatar,
        knowledgeBase: form.knowledgeBase,
        webhookUrl: form.webhookUrl,
        customDomain: form.customDomain,
        removeBranding: form.removeBranding,
        isMultiStep: form.isMultiStep,
        themeColor: form.themeColor,
      }}
    />
  );
}
