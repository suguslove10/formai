import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ResponsesTable } from "@/components/responses/ResponsesTable";
import { FormFieldType } from "@/lib/validations/form";

interface FormResponsesPageProps {
  params: {
    id: string;
  };
}

export default async function FormResponsesPage({ params }: FormResponsesPageProps) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      responses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!form) {
    notFound();
  }

  if (form.userId !== userId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700">
        <h2 className="text-lg font-bold">Unauthorized</h2>
        <p className="text-xs text-red-600 mt-1">You do not have permission to view responses for this form.</p>
      </div>
    );
  }

  return (
    <ResponsesTable
      form={{
        id: form.id,
        title: form.title,
        description: form.description,
        fieldsJson: (form.fieldsJson as unknown as FormFieldType[]) || [],
        status: form.status,
        type: form.type,
      }}
      responses={form.responses.map((r) => ({
        id: r.id,
        dataJson: (r.dataJson as Record<string, any>) || {},
        createdAt: r.createdAt,
        sentiment: r.sentiment,
        leadScore: r.leadScore,
        aiSummary: r.aiSummary,
      }))}
    />
  );
}
