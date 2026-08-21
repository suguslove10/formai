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
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col overflow-x-hidden">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25">
              F
            </div>
            <span className="font-bold text-xl tracking-tight">FormAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <a href="#products" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              Products
            </a>
            <a href="#features" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              Features
            </a>
            <a href="#how" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-sm"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative dot-grid">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-indigo-50/80 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 text-center">
          <div className="rise-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-700 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Describe it in plain English — AI builds the rest
          </div>

          <h1 className="rise-in rise-in-1 text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Forms that talk.
            <br />
            <span className="text-gradient">Chatbots that listen.</span>
          </h1>

          <p className="rise-in rise-in-2 mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            One sentence becomes a polished web form or a conversational AI agent — trained on
            your business, embedded on your site, scoring every lead automatically.
          </p>

          <div className="rise-in rise-in-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl hover:opacity-95 shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:-translate-y-0.5"
            >
              Build yours free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#products"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition shadow-sm"
            >
              See it in action
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">No credit card · Live in under 60 seconds</p>
        </div>

        {/* Hero product mockup: form + chat side by side */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-24">
          <div className="rise-in rise-in-3 grid md:grid-cols-2 gap-6 items-start">
            {/* Mini form mockup */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-6 text-left">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-[11px] text-slate-400 font-mono">yoursite.com/f/…</span>
              </div>
              <p className="font-bold text-slate-900">Product Feedback Survey</p>
              <p className="text-xs text-slate-400 mb-4">Generated from one sentence</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </p>
                  <div className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 flex items-center text-xs text-slate-400">
                    Alex Johnson
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">How satisfied are you?</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                    ))}
                    <Star className="w-6 h-6 text-slate-200" />
                  </div>
                </div>
                <div className="h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  Submit
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Product 1 · Classic AI Forms
              </div>
            </div>

            {/* Mini chat mockup */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-900/15 overflow-hidden text-left md:mt-8">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-700 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-none">Ava — Support Agent</p>
                  <p className="text-white/60 text-[11px] mt-1">Online · answers instantly</p>
                </div>
              </div>
              <div className="p-5 space-y-3 bg-slate-50/60">
                <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-slate-700 shadow-sm">
                  Hi! 👋 Ask me anything about pricing — and I can get you set up.
                </div>
                <div className="max-w-[85%] ml-auto bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-xs shadow-md shadow-indigo-200">
                  I&apos;m Sarah, sarah@acme.com — do you have a team plan?
                </div>
                <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-slate-700 shadow-sm">
                  We do — from $29/seat. Saved your details, Sarah! What team size?
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    2 fields captured
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    🔥 High lead
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                Product 2 · Conversational AI Agents
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["60 sec", "prompt to published"],
            ["10+", "smart field types"],
            ["1 line", "to embed anywhere"],
            ["100%", "your data, your database"],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">{num}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two products ───────────────────────────────────────── */}
      <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">Two products, one prompt</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Collect data your way
          </h2>
          <p className="mt-4 text-slate-500 text-lg">
            The same AI engine powers a classic form and a conversational agent — switch between
            them whenever you like.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="lift rounded-3xl border border-slate-200 bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Classic AI Forms</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Structured multi-field pages with validation, conditional logic, multi-step wizards,
              and your brand color — generated, not dragged.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["10+ field types with smart validation", "Conditional show/hide logic", "Multi-step wizard with progress", "UTM capture & CSV export"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="lift rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white p-8 relative overflow-hidden">
            <div className="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
              MOST POPULAR
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Conversational AI Agents</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              A chat agent that answers questions from your knowledge base while quietly collecting
              the answers you need — on your site with one line of code.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["Trained on your website & FAQs", "Extracts multiple answers per message", "Every transcript recorded — even abandoned", "Floating widget for any website"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-indigo-600" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────── */}
      <section id="features" className="bg-slate-950 text-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">Beyond the form</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Every response, understood
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              AI reads what your builder collects — so you act on signal, not spreadsheets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              [BarChart3, "AI lead scoring", "Every submission is graded for intent, so hot leads surface first — not last."],
              [MessageSquare, "Sentiment analysis", "Positive, neutral, or negative — flagged automatically on every response."],
              [BookOpen, "Knowledge grounding", "Import your website or paste FAQs; the agent answers with your facts."],
              [Webhook, "Signed webhooks", "HMAC-signed delivery to Slack, Discord, Zapier, Make, or your own API."],
              [Globe, "White-label ready", "Your brand color everywhere, your badge-free pages when you want them."],
              [ShieldCheck, "Your data stays yours", "Everything lives in your own PostgreSQL — export or walk away anytime."],
            ].map(([Icon, title, desc]: any) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.07] hover:border-white/20 transition"
              >
                <Icon className="w-6 h-6 text-indigo-400 mb-4" />
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">How it works</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Three steps to live</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            ["Describe", "Type what you need — “a job application form with resume upload” — and watch the schema appear.", Sparkles],
            ["Refine", "Rename the agent, pick an avatar and brand color, import your website as its knowledge base.", Zap],
            ["Share", "Publish a link, or paste one line of code to float the agent on any website you own.", Globe],
          ].map(([title, desc, Icon]: any, i) => (
            <div key={title} className="relative rounded-3xl border border-slate-200 bg-white p-8 lift">
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-5xl font-extrabold text-slate-100 select-none">{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-8 py-16 text-center text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your first form is one sentence away
            </h2>
            <p className="mt-3 text-indigo-100 max-w-xl mx-auto">
              Describe it. Publish it. Watch the responses — and the leads — roll in.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition shadow-lg hover:scale-[1.02]"
            >
              Start building free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm">
              F
            </div>
            <span className="font-bold text-slate-900">FormAI</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FormAI · AI forms & conversational agents
          </p>
        </div>
      </footer>
    </div>
  );
}
