import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DashboardProductTabs } from "@/components/dashboard/DashboardProductTabs";

export default async function DashboardPage() {
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {}

  const activeUserId = user?.id || "demo_user";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "demo@formai.app";

  let forms: any[] = [];
  try {
    forms = await prisma.form.findMany({
      where: {
        OR: [
          { userId: activeUserId },
          { userId: "demo_user" },
        ],
      },
      include: {
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Could not query forms from DB:", err);
  }

  return (
    <DashboardProductTabs
      userEmail={userEmail}
      forms={forms.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        fieldsJson: f.fieldsJson,
        status: f.status,
        botName: f.botName,
        botPersona: f.botPersona,
        knowledgeBase: f.knowledgeBase,
        createdAt: f.createdAt,
        _count: f._count,
      }))}
    />
  );
}
