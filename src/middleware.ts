import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// CLERK_PUBLISHABLE_KEY (no NEXT_PUBLIC_ prefix) is read at RUNTIME — the
// NEXT_PUBLIC_ variant gets inlined at build time and is empty when the
// platform doesn't pass build args (e.g. Dokploy). Set both in production.
const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "";
const isPlaceholderKey =
  !/^pk_(test|live)_/.test(publishableKey) ||
  publishableKey.includes("example.com") ||
  publishableKey.includes("placeholder");

// Only respondent-facing endpoints are public. Form CRUD (/api/forms,
// /api/forms/:id, /api/forms/generate) requires a signed-in session.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/f/(.*)",
  "/c/(.*)",
  "/embed/(.*)",
  "/api/forms/:id/submit",
  "/api/forms/:id/chat",
  "/api/forms/:id/widget-config",
]);

export default isPlaceholderKey
  ? function middleware() {
      return NextResponse.next();
    }
  : clerkMiddleware(
      (auth, req) => {
        if (!isPublicRoute(req)) {
          auth().protect();
        }
      },
      { publishableKey }
    );

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
