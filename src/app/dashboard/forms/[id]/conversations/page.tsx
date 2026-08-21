import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ConversationsList } from "@/components/responses/ConversationsList";

interface ConversationsPageProps {
  params: {
    id: string;
  };
}

export default async function ConversationsPage({ params }: ConversationsPageProps) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      conversations: {
        orderBy: { updatedAt: "desc" },
        take: 100,
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
        <p className="text-xs text-red-600 mt-1">You do not have permission to view conversations for this form.</p>
      </div>
    );
  }

  return (
    <ConversationsList
      form={{
        id: form.id,
        title: form.title,
        botName: form.botName,
        botAvatar: form.botAvatar,
        status: form.status,
      }}
      conversations={form.conversations.map((c) => ({
        id: c.id,
        messages: (c.messagesJson as { role: string; content: string }[]) || [],
        collected: (c.collectedJson as Record<string, any>) || {},
        isComplete: c.isComplete,
        responseId: c.responseId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))}
    />
  );
}
