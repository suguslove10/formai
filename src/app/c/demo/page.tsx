import { redirect, notFound } from "next/navigation";
import { getOrCreateDemoBotId } from "@/lib/demo-bot";

export const dynamic = "force-dynamic";

export default async function DemoChatbotPage() {
  const demoBotId = await getOrCreateDemoBotId();
  if (!demoBotId) {
    notFound();
  }
  redirect(`/c/${demoBotId}`);
}
