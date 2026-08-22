import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatbot.dp.thesugu.com";

  // Core static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Dynamically include published forms and chatbots
  try {
    const publishedForms = await prisma.form.findMany({
      where: { status: "published" },
      select: { id: true, type: true, updatedAt: true },
      take: 100,
    });

    publishedForms.forEach((form) => {
      const pathPrefix = form.type === "chatbot" ? "/c/" : "/f/";
      routes.push({
        url: `${baseUrl}${pathPrefix}${form.id}`,
        lastModified: form.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  } catch (e) {
    console.warn("Sitemap dynamic generation warning:", e);
  }

  return routes;
}
