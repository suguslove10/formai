import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Render every page at request time. The ClerkProvider decision depends on
// runtime env; a statically prerendered page would bake in the build-time
// answer and mismatch the live middleware (useSession-outside-provider crash).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FormAI — Intelligent AI Form Builder SaaS",
  description: "Describe your form in plain English and let Claude generate, customize, publish, and collect responses seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Runtime-first key resolution: CLERK_PUBLISHABLE_KEY works even when the
  // NEXT_PUBLIC_ variant wasn't available at build time (see middleware.ts).
  const pubKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "";
  const isRealClerkKey =
    /^pk_(test|live)_/.test(pubKey) &&
    !pubKey.includes("example.com") &&
    !pubKey.includes("placeholder");

  const content = (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased selection:bg-indigo-500 selection:text-white`}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );

  if (isRealClerkKey) {
    // Pass the key explicitly so the client gets it at request time instead
    // of relying on build-time env inlining
    return <ClerkProvider publishableKey={pubKey}>{content}</ClerkProvider>;
  }

  return content;
}
