# FormAI — AI-First Forms & Conversational AI Chatbots Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-green?style=for-the-badge&logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Anthropic-Claude--3.7--Sonnet-orange?style=for-the-badge&logo=anthropic" alt="Claude" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql" alt="Postgres" />
  <img src="https://img.shields.io/badge/Prisma-5.22-teal?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge&logo=clerk" alt="Clerk" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</div>

<br />

**FormAI** is a dual-mode SaaS data collection and customer engagement platform combining the structured power of **Typeform/Google Forms** with the interactive intelligence of **Jotform AI Chatbots / Intercom Fin**.

Instead of manually dragging form components, creators simply **describe their form or chatbot in plain English**. FormAI leverages LLM tool calling to generate strict schemas, conversational personas, and RAG knowledge grounding with zero lock-in.

---

## 🚀 Two Products in One Unified Suite

```mermaid
flowchart LR
    Prompt[Natural Language Prompt] --> AI[AI Dual Engine: OpenAI / Claude]
    AI --> P1[📄 Product 1: Classic AI Web Forms]
    AI --> P2[🤖 Product 2: Conversational AI Chatbots]
    
    P1 --> LiveForm[Public URL /f/id]
    P2 --> LiveChat[Interactive Chat /c/id]
    P2 --> FloatingWidget[1-Line Floating Website Widget]
    
    LiveForm --> DB[(PostgreSQL Database)]
    LiveChat --> DB
    DB --> Analytics[📊 Responses Table + AI Sentiment + Lead Scoring + CSV Export]
```

### 📄 Product 1: Classic AI Web Forms
- **Natural Language Schema Generation**: Converts prompts into 10 distinct field types (`text`, `email`, `number`, `textarea`, `select`, `checkbox`, `radio`, `rating`, `file`, `date`).
- **Interactive Visual Editor**: Drag-and-drop reordering, inline constraint configuration (`Required`, `Placeholder`, `Options`), debounced autosave (800ms).
- **Public Form Engine (`/f/[id]`)**: Standalone, mobile-responsive, accessible web form with real-time validation and instant submission.

### 🤖 Product 2: Conversational AI Chatbots (Jotform Agent Style)
- **Interactive Chat Q&A (`/c/[id]`)**: WhatsApp/iMessage-style conversational experience with typing indicator, bot avatar, and in-chat interactive widgets (star ratings, quick-reply pills, date selector).
- **Knowledge Base Grounding (RAG)**: Train bots with company FAQs, return policies, and pricing tables so the bot answers visitor questions naturally during the conversation.
- **⚡ Multi-Entity Smart Extraction**: Extracts multiple answers from a single natural sentence (e.g. *"I'm Alex, email alex@work.com and I give 5 stars"* captures 3 fields simultaneously).
- **🌐 1-Line Embeddable Website Widget**:
  ```html
  <script src="https://your-domain.com/embed/formai.js" data-form-id="YOUR_FORM_ID"></script>
  ```
  Injects a floating chat bubble in the bottom-right corner of any Shopify, WordPress, Webflow, or HTML website.

### 📊 AI Analytics & Lead Scoring (Beyond Jotform)
- **🟢 AI Sentiment Analysis**: Automatically classifies submissions (*Positive*, *Neutral*, *Negative*).
- **🔥 Lead Priority Scoring**: Flags high-value leads (*High Lead*, *Medium*, *Standard*).
- **💡 AI Executive Summary**: Generates a 1-sentence distillation of the respondent's answers.
- **1-Click RFC-4180 CSV Export**: Instant download for analysis in Excel or Google Sheets.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & API**: Next.js Server Components, Edge/Node Route Handlers, Zod schema validation.
- **AI Dual Engine**: OpenAI API (`gpt-4o-mini`, `gpt-4o`) + Anthropic SDK (`claude-3-7-sonnet`) with forced function tool calling.
- **Database**: PostgreSQL 16 + Prisma ORM.
- **Authentication**: Clerk Auth (JWT session protection, UserButton, sign-in/sign-up routing).
- **DevOps**: Docker Compose dev environment + multi-stage production container.

---

## ⚡ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/suguslove10/formai.git
cd formai
```

### 2. Environment Setup
Copy the template and configure your keys:
```bash
cp .env.example .env
```

Fill in your variables inside `.env`:
```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5435/formai?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI Providers (OpenAI or Anthropic)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-7-sonnet-20250219

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3. Start with Docker Compose
```bash
docker compose up -d
```
This boots up:
- **PostgreSQL 16** on `localhost:5435` (`formai-db`)
- **Next.js Dev Server** on `http://localhost:3002` (`formai-app`)

### 4. Or Run Locally via Node
```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Visit **[http://localhost:3002](http://localhost:3002)** in your browser.

---

## 📁 Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── forms/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── chat/route.ts      # Conversational AI Chat API (RAG + Sentiment)
│   │   │   │   │   ├── submit/route.ts    # Public form submission handler
│   │   │   │   │   └── route.ts           # Form CRUD & settings updater
│   │   │   │   └── generate/route.ts      # Natural language AI Form generation
│   │   ├── c/[id]/page.tsx                # Standalone Conversational Chatbot page
│   │   ├── embed/[id]/page.tsx            # Iframe embed page for chat widgets
│   │   ├── f/[id]/page.tsx                # Public Classic Form view
│   │   ├── dashboard/
│   │   │   ├── forms/[id]/edit/page.tsx   # Form & Bot Editor route
│   │   │   ├── forms/[id]/responses/      # Analytics & CSV export route
│   │   │   └── page.tsx                   # Main 2-Product Dashboard
│   │   ├── layout.tsx                     # Root layout with Clerk Provider
│   │   └── page.tsx                       # Landing page with interactive hero
│   ├── components/
│   │   ├── chat/
│   │   │   └── ConversationalChatbot.tsx  # In-chat interactive ratings, options, progress
│   │   ├── dashboard/
│   │   │   ├── DashboardProductTabs.tsx   # Product switcher (Forms vs Chatbots)
│   │   │   └── PromptGenerator.tsx        # Dual-mode AI prompt generator
│   │   ├── editor/
│   │   │   └── FormEditor.tsx             # 4-tab visual editor with Bot & Knowledge base
│   │   ├── form/
│   │   │   └── PublicFormRenderer.tsx     # 10 field type public renderer
│   │   └── responses/
│   │       └── ResponsesTable.tsx         # Sentiment badges, lead scores, CSV export
│   └── lib/
│       ├── ai/
│       │   └── generate-form.ts           # OpenAI + Claude forced tool calling
│       ├── validations/
│       │   └── form.ts                    # Shared Zod schemas
│       ├── prisma.ts                      # Prisma client singleton
│       └── utils.ts                       # Helper utilities & date formatters
├── public/
│   └── embed/
│       └── formai.js                      # 1-line floating widget client loader
├── prisma/
│   └── schema.prisma                      # Users, Forms, and Responses models
├── docker-compose.yml                     # Multi-container orchestration
├── Dockerfile.dev                         # Hot-reloading development container
└── Dockerfile                             # Optimized multi-stage production build
```

---

## 🔒 Security & Privacy

- **Strict User Isolation**: All forms and collected respondent data are tied to Clerk user IDs.
- **Zero AI Data Retention Lock-in**: Data is stored in your own PostgreSQL instance.
- **Rate Limiting**: Built-in rate limiter protecting against prompt flooding.
- **Input Sanitization**: Client and server-side Zod validation on every input.

---

## 📄 License

MIT License © 2026 FormAI.
