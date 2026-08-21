import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FormAI — Intelligent AI Form Builder SaaS",
  description: "Describe your form in plain English and let Claude generate, customize, publish, and collect responses seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const isRealClerkKey = pubKey.startsWith("pk_test_") && !pubKey.includes("example.com") && !pubKey.includes("placeholder");

  const content = (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased selection:bg-indigo-500 selection:text-white`}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );

  if (isRealClerkKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
