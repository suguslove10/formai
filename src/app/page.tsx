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
  Layers,
  Cpu,
  MousePointerClick,
  Sparkle,
} from "lucide-react";

export default function HomePage() {
  const samplePrompts = [
    { label: "SaaS Feedback Survey", icon: "⭐", type: "Classic Form", prompt: "A 4-question customer satisfaction survey with rating and suggestions" },
    { label: "Lead Capture Chatbot", icon: "💼", type: "AI Agent", prompt: "A high-converting B2B lead qualification bot that asks budget and email" },
    { label: "Event RSVP & Dietary", icon: "🎟️", type: "Classic Form", prompt: "Conference registration form with ticket type, meal preference and company" },
    { label: "Support & FAQ Bot", icon: "🤖", type: "AI Agent", prompt: "An interactive support assistant that answers FAQs and logs unresolved tickets" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* ── Ambient Background Glows ────────────────────────────── */}
      <div className="fixed top-[-10%] left-[20%] w-[550px] h-[550px] glow-blob glow-indigo -z-10" />
      <div className="fixed top-[15%] right-[-5%] w-[500px] h-[500px] glow-blob glow-violet -z-10" />
      <div className="fixed top-[45%] left-[-10%] w-[450px] h-[450px] glow-blob glow-pink -z-10" />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                FormAI
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                v2.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <a href="#products" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition">
              Products
            </a>
            <a href="#features" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition">
              Features
            </a>
            <a href="#how" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="relative group inline-flex items-center gap-2 px-4.5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-sm hover:shadow-md"
            >
              <span>Get started free</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative dot-grid pt-12 sm:pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="rise-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 shadow-sm shadow-indigo-100 text-indigo-700 text-xs font-semibold mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-First Form Builder & Conversational Agents</span>
          </div>

          {/* Heading */}
          <h1 className="rise-in rise-in-1 text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Forms that talk.
            <br />
            <span className="text-gradient">Chatbots that convert.</span>
          </h1>

          {/* Subheading */}
          <p className="rise-in rise-in-2 mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Turn a single sentence into a high-converting web form or an intelligent conversational agent — grounded in your business data, ready in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="rise-in rise-in-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 rounded-2xl hover:opacity-95 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <Sparkle className="w-4 h-4 text-indigo-200" />
              <span>Create with AI for Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#products"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-700 bg-white/90 border border-slate-200/90 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition shadow-sm backdrop-blur-sm"
            >
              Explore Live Demo
            </a>
          </div>

          <p className="mt-4 text-xs text-slate-400 font-medium">
            ⚡ No credit card required · Free instant deployment · Zero lock-in
          </p>

          {/* Interactive Prompt Inspiration Pills */}
          <div className="mt-10 max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Popular AI Prompts you can try
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {samplePrompts.map((item, idx) => (
                <Link
                  key={idx}
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 transition shadow-sm"
                >
                  <span>{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.type}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Hero product mockup: form + chat side by side with modern styling */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-12">
          <div className="rise-in rise-in-3 grid md:grid-cols-2 gap-6 items-start">
            {/* Mockup 1: Classic Form */}
            <div className="bg-white/95 rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/10 p-6 sm:p-7 text-left backdrop-blur-xl relative overflow-hidden group hover:border-indigo-300 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/80 rounded-bl-full pointer-events-none -z-0" />
              
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                  <span className="ml-2 text-[11px] text-slate-400 font-mono">formai.app/f/demo</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Form Mode
                </span>
              </div>

              <div className="relative z-10">
                <p className="font-bold text-slate-900 text-lg">Product Feedback Survey</p>
                <p className="text-xs text-slate-500 mb-5">Generated automatically in 4 seconds</p>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="h-9.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 flex items-center text-xs text-slate-700 font-medium">
                      Alex Johnson
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">How satisfied are you with our speed?</label>
                    <div className="flex gap-1.5 p-1 bg-slate-50/60 rounded-xl border border-slate-100 w-fit">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-5 h-5 ${i <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="h-10.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20">
                    <Send className="w-3.5 h-3.5" />
                    Submit Response
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Classic AI Web Form
                  </span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live Validation
                  </span>
                </div>
              </div>
            </div>

            {/* Mockup 2: Conversational Agent */}
            <div className="bg-white/95 rounded-3xl border border-slate-200/80 shadow-2xl shadow-indigo-900/15 overflow-hidden text-left md:mt-6 backdrop-blur-xl group hover:border-indigo-300 transition-colors">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-lg">
                      🤖
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold leading-none">Ava — FormAI Assistant</p>
                    <p className="text-indigo-200/70 text-[11px] mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Grounded in company FAQs
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                  Chatbot Mode
                </span>
              </div>

              <div className="p-5 space-y-3 bg-slate-50/70">
                <div className="max-w-[88%] bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-slate-700 shadow-sm leading-relaxed">
                  Hi! 👋 Ask me anything about our plans — and I can help sign you up!
                </div>
                <div className="max-w-[88%] ml-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-xs shadow-md shadow-indigo-500/20 leading-relaxed">
                  I&apos;m Sarah from Acme, email sarah@acme.com — do you support custom webhooks?
                </div>
                <div className="max-w-[88%] bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-slate-700 shadow-sm leading-relaxed">
                  Yes, Sarah! We send HMAC-signed webhooks to Slack, Zapier, or your API. 🚀 What team size are you planning for?
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> 2 fields captured
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    🔥 High lead priority
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 bg-white">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  Conversational AI Chatbot
                </span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Multi-Entity RAG
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────────── */}
      <section className="border-y border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["60 sec", "Prompt to live deployment", "⚡"],
            ["10+", "Field types & conditional rules", "🧩"],
            ["1 line", "Embeddable floating widget", "🌐"],
            ["100%", "Data privacy & zero lock-in", "🔒"],
          ].map(([num, label, icon]) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-xl mb-1">{icon}</span>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">{num}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two Products Section ────────────────────────────────── */}
      <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">Two products, one prompt</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Collect data your way
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            Choose the experience that fits your audience — structured forms for precision, or conversational bots for engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="lift rounded-3xl border border-slate-200 bg-white p-8 sm:p-9 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Classic AI Forms</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Structured multi-field pages with instant validation, conditional logic, multi-step wizards, and customizable brand accents.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "10+ smart field types (rating, files, select, date)",
                "Dynamic conditional show/hide rules",
                "Multi-step wizard pagination with progress",
                "UTM parameter tracking & RFC-4180 CSV export",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                Generate a Classic Form <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="lift rounded-3xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/70 via-white to-white p-8 sm:p-9 shadow-sm relative overflow-hidden">
            <div className="absolute top-6 right-6 text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-sm">
              MOST POPULAR
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Conversational AI Agents</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              An intelligent chatbot that answers visitor questions directly from your knowledge base while capturing form answers naturally.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Trained on your website URLs & FAQ documents",
                "Multi-entity smart extraction from natural sentences",
                "Full transcripts recorded — including abandoned chats",
                "1-line floating widget for Shopify, Webflow & HTML",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-indigo-600" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-indigo-100">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                Create an AI Chatbot <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ─────────────────────────────────── */}
      <section id="features" className="bg-slate-950 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">Beyond Standard Forms</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Every response, understood
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              FormAI analyzes every submission with LLMs so you act immediately on high-value signal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              [BarChart3, "AI Lead Priority Scoring", "Submissions are categorized into High, Medium, or Low lead score based on intent.", "from-indigo-500/20 to-blue-500/10"],
              [MessageSquare, "Sentiment Analysis", "Classifies respondent attitude (Positive, Neutral, Negative) for immediate customer service triage.", "from-violet-500/20 to-purple-500/10"],
              [BookOpen, "RAG Knowledge Grounding", "Train bots by typing FAQs or scraping your live website URL in a single click.", "from-pink-500/20 to-rose-500/10"],
              [Webhook, "Signed Enterprise Webhooks", "Trigger webhooks with HMAC SHA-256 signatures to Slack, Discord, Zapier, or your backend.", "from-emerald-500/20 to-teal-500/10"],
              [Globe, "1-Line Embed Widget", "Drop a single script tag into WordPress, Shopify, or Webflow to float a responsive chat bubble.", "from-amber-500/20 to-orange-500/10"],
              [ShieldCheck, "Zero Lock-In & Self-Hosted DB", "All answers and transcripts live in your own PostgreSQL instance with 1-click CSV export.", "from-cyan-500/20 to-blue-500/10"],
            ].map(([Icon, title, desc, grad]: any) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-gradient-to-b bg-white/[0.03] p-7 hover:bg-white/[0.06] hover:border-white/20 transition-all lift"
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} border border-white/10 flex items-center justify-center mb-5 text-indigo-400`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">{title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">Simple Workflow</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Three steps from prompt to live</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {[
            ["1. Describe in plain English", "Type what data you need — e.g., “a customer support intake bot that asks for order number and rating”.", Sparkles],
            ["2. Refine & Train", "Customize bot persona, upload your website URL for instant RAG answers, or tweak conditional rules.", Zap],
            ["3. Publish & Embed", "Share the direct link or copy a 1-line script tag to embed a floating chat bubble on your website.", Globe],
          ].map(([title, desc, Icon]: any, i) => (
            <div key={title} className="relative rounded-3xl border border-slate-200/80 bg-white p-8 lift shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-5xl font-black text-slate-100 select-none">{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Call to Action ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-8 py-16 sm:py-20 text-center text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-15" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to build smarter forms with AI?
            </h2>
            <p className="mt-4 text-indigo-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Describe your form in seconds and start capturing qualified leads right away.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition shadow-lg hover:scale-[1.02]"
              >
                Start building free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/80 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm">
              F
            </div>
            <span className="font-bold text-slate-900">FormAI</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FormAI · AI Forms & Conversational Chatbots
          </p>
        </div>
      </footer>
    </div>
  );
}

