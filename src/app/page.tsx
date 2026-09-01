import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Bot,
  FileText,
  Zap,
  BarChart3,
  ShieldCheck,
  Globe,
  MessageSquare,
  Star,
  Check,
  Webhook,
  BookOpen,
  Send,
  MessageCircle,
  Mail,
  Building2,
  Stethoscope,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UPGRADE_CONTACT, PLAN_LIMITS } from "@/lib/billing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Check if there is a published demo chatbot to link to
  let demoBotId: string | null = null;
  try {
    const demoBot = await prisma.form.findFirst({
      where: { status: "published", type: "chatbot" },
      select: { id: true },
    });
    if (demoBot) {
      demoBotId = demoBot.id;
    }
  } catch (e) {}

  const demoLink = demoBotId ? `/c/${demoBotId}` : "/sign-up";

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col overflow-x-hidden">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25">
              F
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">FormAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <a href="#problem" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              Why AI Chat
            </a>
            <a href="#how" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              How it works
            </a>
            <a href="#features" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              Features
            </a>
            <a href="#pricing" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              Pricing
            </a>
            <a href="#testimonials" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              Success Stories
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative pt-16 sm:pt-24 pb-20 overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Audience Target Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-bold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Lead Qualification for Clinics, Real Estate & Local Agencies</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] max-w-5xl mx-auto">
            Turn Website Visitors into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
              Qualified Leads 24/7
            </span>{" "}
            with AI Chat Agents
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Stop losing prospective clients to boring, abandoned contact forms. FormAI engages your website visitors, answers their questions using your custom FAQs, and captures qualified leads automatically.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-500/25 transition hover:scale-[1.02]"
            >
              Start free today
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href={demoLink}
              target={demoBotId ? "_blank" : undefined}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition shadow-sm"
            >
              <Bot className="w-5 h-5 text-indigo-600" />
              See a live demo
            </Link>
          </div>

          <p className="mt-4 text-xs font-medium text-slate-500">
            ✓ No credit card required · Live in 2 minutes · 1-line website embed
          </p>

          {/* Hero Visual Showcase Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-slate-900 p-3 sm:p-4 shadow-2xl border border-slate-800">
            <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 text-left border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-mono text-slate-400">your-website.com</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  FormAI Widget Active
                </span>
              </div>

              {/* Mock Chat Conversation */}
              <div className="space-y-3 max-w-2xl text-xs sm:text-sm font-sans pt-2">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    🤖
                  </div>
                  <div className="bg-slate-800 text-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-700/80">
                    Hello! Welcome to DentalCare Clinic. Are you looking to book an appointment or check our teeth whitening packages?
                  </div>
                </div>

                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none">
                    Hi! I need a consultation this Friday and want to know if you accept insurance?
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    🤖
                  </div>
                  <div className="bg-slate-800 text-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-700/80 space-y-2">
                    <p>Yes! We accept major insurance providers. I can lock in your Friday appointment right now. What's your name and phone number?</p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="px-2 py-1 bg-emerald-900/60 border border-emerald-700/80 text-emerald-300 text-[11px] rounded-lg font-mono">
                        🔥 High Lead Priority Detected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem vs Solution ─────────────────────────────────── */}
      <section id="problem" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2">
              The Conversion Gap
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Static Contact Forms Are Killing Your Conversions
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Local service clients expect instant responses. Traditional forms create friction and delay, causing high bounce rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <XCircle className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 mb-2">The Old Way: Static Contact Forms</h4>
              <p className="text-xs text-slate-500 mb-6">Cold, multi-field forms that visitors abandon before pressing submit.</p>

              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span><strong>80%+ drop-off rate</strong> on long static forms with required fields</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Slow response times</strong>: prospects wait hours for an email reply</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero lead scoring</strong>: sales teams waste time on unqualified leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span><strong>No FAQ support</strong>: visitors leave if they can't find instant answers</span>
                </li>
              </ul>
            </div>

            {/* The FormAI Way */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-indigo-700/50 shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-extrabold text-white mb-2">The FormAI Way: 24/7 AI Chat Agents</h4>
              <p className="text-xs text-indigo-200 mb-6">Interactive, human-like chat experience tailored to your exact business rules.</p>

              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>3x higher conversion rates</strong> with conversational multi-entity lead capture</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Instant RAG answers</strong> trained on your pricing, insurance, and FAQ guidelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Automated Sentiment & Lead Priority Scoring</strong> for immediate sales follow-up</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>1-Line Website Embed</strong> compatible with WordPress, Webflow, Shopify & custom sites</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works (3 Steps) ───────────────────────────────── */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2">
              Three-Step Setup
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Live on Your Site in 2 Minutes
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              No technical skills or complex workflow builders required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-indigo-300 transition relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-base mb-6 shadow-md shadow-indigo-200">
                1
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 mb-2">Describe Your Bot in Plain English</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Type what you need: <em>"Real estate assistant that qualifies home buyers by budget, location, and timeline."</em> FormAI automatically generates the conversational persona and structured fields.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-indigo-300 transition relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-base mb-6 shadow-md shadow-indigo-200">
                2
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 mb-2">Train on Your FAQs & Guidelines</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste your business FAQs, clinic return policies, consultation fees, or service details into the RAG Knowledge Base. Your bot answers visitor questions accurately without hallucinating.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-indigo-300 transition relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-base mb-6 shadow-md shadow-indigo-200">
                3
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 mb-2">Embed 1 Line of Code</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Copy the single-line JavaScript snippet and paste it onto your site. A floating, interactive chat bubble appears in the bottom-right corner immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Grid ────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-2">
              Built for Lead Generation
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Features Designed to Convert Visitors into Clients
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              Everything local clinics, firms, and agencies need to manage inquiries seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white mb-1.5">RAG Knowledge Base</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Train your chatbot with business FAQs, consultation terms, and pricing so it answers visitor inquiries accurately before asking for contact info.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white mb-1.5">Multi-Entity Extraction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visitors don't need to answer one by one. If they say <em>"I'm Dr. Shah, email shah@clinic.com and budget is ₹50k"</em>, all 3 fields are captured at once.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white mb-1.5">AI Sentiment & Lead Scoring</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every conversation is scored (High Lead, Medium, Standard) and analyzed for sentiment (Positive, Neutral, Negative) so sales prioritizes hot prospects.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white mb-1.5">1-Line Floating Website Widget</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single script tag loads a fast, mobile-responsive chat widget in the bottom-right corner of WordPress, Webflow, Shopify, or HTML sites.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white mb-1.5">1-Click RFC-4180 CSV Export</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download collected respondent data, AI sentiment, and lead priority scores cleanly into Excel, Google Sheets, or CRM systems.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                <Webhook className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white mb-1.5">Outbound Webhooks</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trigger real-time webhooks on new form submissions or high-priority lead events directly to Zapier, Make, or custom API endpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section (Sync'd with PLAN_LIMITS in billing.ts) ── */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2">
              Simple, Transparent Pricing
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Plans for Local Businesses & Reseller Agencies
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Start free today. Upgrade anytime for higher bot limits, custom branding, and white-label agency capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* FREE PLAN */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                  🌱 {PLAN_LIMITS.FREE.name}
                </span>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">Perfect for testing and small single-page websites.</p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>1 Active Bot / Form</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>50 Responses</strong> / month</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span>Standard Lead Capture</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium text-slate-400">
                    <span className="w-4 text-center">✕</span>
                    <span>FormAI Branding Shown</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/sign-up"
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl text-center transition"
              >
                Start free
              </Link>
            </div>

            {/* PRO PLAN */}
            <div className="bg-white rounded-3xl p-8 border-2 border-indigo-600 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold tracking-wider uppercase shadow-md">
                MOST POPULAR FOR CLINICS & FIRMS
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 block mb-2">
                  ⚡ {PLAN_LIMITS.PRO.name}
                </span>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-extrabold text-slate-900">₹1,999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">Ideal for active clinics, real estate teams, & service firms.</p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>5 Active Bots / Forms</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>Unlimited Responses</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>Remove Branding</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span>RAG Knowledge Base FAQ Training</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span>AI Sentiment & Lead Scoring</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <a
                  href={UPGRADE_CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact to Upgrade (WhatsApp)
                </a>
                <a
                  href={`mailto:${UPGRADE_CONTACT.email}?subject=Pro%20Plan%20Upgrade%20Inquiry`}
                  className="block text-center text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                >
                  Or email {UPGRADE_CONTACT.email}
                </a>
              </div>
            </div>

            {/* AGENCY PLAN */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 block mb-2">
                  🚀 {PLAN_LIMITS.AGENCY.name}
                </span>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-extrabold text-slate-900">₹9,999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">For digital agencies reselling AI chatbots to multiple clients.</p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>Unlimited Bots & Forms</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>Unlimited Responses</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span><strong>White-label Branding</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span>Multi-Workspace Management</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span>Priority Onboarding & Support</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <a
                  href={UPGRADE_CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact to Upgrade (WhatsApp)
                </a>
                <a
                  href={`mailto:${UPGRADE_CONTACT.email}?subject=Agency%20Plan%20Upgrade%20Inquiry`}
                  className="block text-center text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                >
                  Or email {UPGRADE_CONTACT.email}
                </a>
              </div>
            </div>
          </div>

          {/* Personal Activation Notice */}
          <div className="mt-12 bg-indigo-50/80 border border-indigo-100 rounded-2xl p-6 text-center max-w-3xl mx-auto">
            <h4 className="text-sm font-extrabold text-indigo-950 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Personal Onboarding & Direct Activation
            </h4>
            <p className="text-xs text-indigo-900/80 mt-1.5 leading-relaxed">
              Paid plans are activated directly by our founding team upon confirmation of bank transfer or UPI payment. Enjoy 1-on-1 personal onboarding support with zero recurring subscription surprises.
            </p>
          </div>
        </div>
      </section>

      {/* ── Social Proof & Testimonials ──────────────────────────── */}
      {/* TODO: Replace with real testimonials once we have client case studies */}
      <section id="testimonials" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2">
              Success Stories
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Growing Local Businesses
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Here is how clinics, agencies, and firms qualify prospects on autopilot.
            </p>
          </div>

          {/* TODO: Placeholder testimonial cards - swap before final launch */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "We captured 42 qualified home buyer leads in our first week using the floating widget. It answers pricing questions and schedules site visits even at midnight."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  SM
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sarah M.</p>
                  <p className="text-[10px] text-slate-500">Principal Broker · Urban Living Real Estate</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "Patients get instant answers about insurance coverage and consultation fees after hours. Our front-desk team receives pre-qualified lead summaries every morning."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  AV
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Dr. Aris V.</p>
                  <p className="text-[10px] text-slate-500">Clinical Director · SmileCare Dental</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "We resell white-labeled FormAI chatbots to 15 local agency clients as an add-on service. The lead priority scoring makes our clients jump for joy."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  MT
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Marcus T.</p>
                  <p className="text-[10px] text-slate-500">Growth Director · Apex Marketing Agency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="w-14 h-14 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
            <Bot className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Turn Website Visitors into Clients?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto">
            Join local clinics, firms, and agencies capturing 3x more qualified leads today. Build your first AI chat agent in under 2 minutes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-indigo-950 bg-white hover:bg-slate-100 rounded-2xl shadow-xl transition hover:scale-[1.02]"
            >
              Build your AI Agent free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="mt-4 text-xs font-medium text-indigo-300">
            Free forever tier · No credit card required · Instant setup
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              F
            </div>
            <span className="font-bold text-white tracking-tight text-sm">FormAI</span>
            <span className="text-xs text-slate-500">© 2026 FormAI. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium">
            <Link href="/sign-in" className="hover:text-white transition">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-white transition">
              Create Account
            </Link>
            <a href={`mailto:${UPGRADE_CONTACT.email}`} className="hover:text-white transition">
              Support ({UPGRADE_CONTACT.email})
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
