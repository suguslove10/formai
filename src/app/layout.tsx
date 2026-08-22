import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const dynamic = "force-dynamic";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatbot.dp.thesugu.com";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FormAI — Conversational AI Chatbots & AI Lead Qualification Platform",
    template: "%s | FormAI",
  },
  description:
    "Turn website visitors into qualified leads 24/7. FormAI empowers clinics, real estate firms, coaching practices, and agencies to deploy AI receptionist chatbots with Knowledge Base RAG FAQ training and 1-line website widgets.",
  keywords: [
    "FormAI",
    "AI Chatbot",
    "AI Lead Qualification",
    "AI Form Builder",
    "Conversational AI",
    "Dental Clinic AI Receptionist",
    "Real Estate Lead Generation",
    "Website Embed Chat Widget",
    "RAG Knowledge Base Chatbot",
    "Jotform AI alternative",
    "Typeform AI alternative",
    "Lead Scoring Automation",
  ],
  authors: [{ name: "FormAI Team", url: appUrl }],
  creator: "FormAI",
  publisher: "FormAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "FormAI — Conversational AI Chatbots & AI Lead Qualification Platform",
    description:
      "Turn website visitors into qualified leads 24/7. Deploy intelligent AI chat agents trained on your custom FAQs in under 2 minutes.",
    siteName: "FormAI",
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "FormAI — Conversational AI Chatbots Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FormAI — Conversational AI Chatbots & AI Lead Qualification",
    description:
      "Turn website visitors into qualified leads 24/7. Deploy AI chat agents with custom Knowledge Base FAQ training in 2 minutes.",
    images: [`${appUrl}/og-image.png`],
    creator: "@formai",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// JSON-LD Structured Data for Google Rich Snippets
const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${appUrl}/#software`,
      "name": "FormAI",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "url": appUrl,
      "description":
        "Conversational AI Chatbots & AI Lead Qualification SaaS platform for clinics, real estate practices, and marketing reseller agencies.",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": "0",
        "highPrice": "9999",
        "offerCount": "3",
      },
    },
    {
      "@type": "Organization",
      "@id": `${appUrl}/#organization`,
      "name": "FormAI",
      "url": appUrl,
      "logo": `${appUrl}/og-image.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8660844123",
        "contactType": "customer service",
        "email": "sugugalag@gmail.com",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pubKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "";
  const isRealClerkKey =
    /^pk_(test|live)_/.test(pubKey) &&
    !pubKey.includes("example.com") &&
    !pubKey.includes("placeholder");

  const content = (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased selection:bg-indigo-500 selection:text-white`}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );

  if (isRealClerkKey) {
    return <ClerkProvider publishableKey={pubKey}>{content}</ClerkProvider>;
  }

  return content;
}
