import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatbot.dp.thesugu.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/f/*", "/c/*", "/sign-in", "/sign-up", "/embed/*"],
        disallow: ["/dashboard/*", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
