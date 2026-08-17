# Build brief: AI form builder SaaS (working name "FormAI")

## What we're building
A SaaS where a user describes a form in plain English, an LLM generates a
structured form (fields, types, validation), the user can visually edit it,
publish it to a public URL, and collect + export responses.

This is v1 / MVP. Explicitly OUT of scope for this build: payments on forms,
conditional branching logic, teams/permissions, templates marketplace,
white-labeling, workflow automation. Do not add these even if they seem easy —
flag them as "future" in comments instead.

## Tech stack (use exactly this, don't substitute)
- Docker + Docker Compose for local dev (app container + Postgres container)
- Next.js 14+ (App Router), TypeScript
- Postgres via Prisma ORM (assume a `DATABASE_URL` env var will be provided —
  use Neon/Supabase-compatible connection string format)
- Auth: Clerk (assume `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` env vars)
- LLM: Anthropic SDK (`@anthropic-ai/sdk`), model `claude-sonnet-4-6`, using
  tool use / forced tool_choice for structured form generation (assume
  `ANTHROPIC_API_KEY` env var)
- Styling: Tailwind CSS
- Validation: Zod (shared schema for both client and server validation)
- File uploads: defer to a stubbed S3-compatible interface — implement the
  interface but don't wire real credentials yet

## Data model (Prisma schema)
Build these models:
- `User` (id, clerkId, email, createdAt) — synced from Clerk via webhook
- `Form` (id, userId, title, description, fieldsJson [Json], status
  [draft/published], createdAt, updatedAt)
- `Response` (id, formId, dataJson [Json], createdAt)

Keep `fieldsJson` as a JSON blob matching the Zod `FormSchema` below rather
than normalizing fields into their own table — this will change shape often
early on.

## Core Zod schema (define this first, reuse everywhere)
```typescript
const FieldType = z.enum([
  "text", "email", "number", "textarea", "select",
  "checkbox", "radio", "rating", "file", "date"
]);

const FormField = z.object({
  id: z.string(),
  type: FieldType,
  label: z.string(),
  required: z.boolean(),
  options: z.array(z.string()).optional(), // for select/radio/checkbox
});

const FormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormField).min(1).max(15),
});
```

## Feature build order (build and verify each phase before moving to the next)

### Phase 0 — Docker & local dev environment
- `docker-compose.yml` with two services:
  - `db`: `postgres:16`, persisted volume, exposes 5432, env vars for
    user/password/db name matching `DATABASE_URL` used elsewhere
  - `app`: builds from a `Dockerfile.dev`, mounts the project directory as a
    volume for hot reload, runs `next dev`, exposes 3000, depends_on `db`
- `Dockerfile.dev`: Node 20 slim base, installs deps, does NOT copy source
  (source comes from the bind mount) so rebuilds are fast
- `Dockerfile` (separate, production): multi-stage build — install deps,
  `next build`, copy only the `.next` standalone output into a slim final
  image. This is for later deployment, not local dev, but scaffold it now.
- `.env.example` should work as-is with `docker-compose up` pointing
  `DATABASE_URL` at the `db` service hostname, not `localhost`
- Add npm scripts: `docker:up` (`docker compose up --build`), `docker:down`,
  `docker:migrate` (runs `prisma migrate dev` inside the running app
  container via `docker compose exec app ...`)
- Document in README: `docker compose up`, then in a second terminal
  `npm run docker:migrate` to set up the DB schema, then open localhost:3000
- Verify: after `docker compose up`, the app container should be able to
  reach the db container and Prisma should connect successfully — confirm
  this before moving to Phase 1

### Phase 1 — Project setup
- Next.js + TypeScript + Tailwind scaffold
- Prisma schema + migration for the 3 models above
- Clerk auth wired into the App Router (middleware, sign-in/sign-up pages)
- Basic authenticated `/dashboard` route that just says "logged in as {email}"

### Phase 2 — AI form generation
- `POST /api/forms/generate` route:
  - Input: `{ prompt: string }`
  - Calls Anthropic API with forced tool use against the `FormSchema` shape
    (translate the Zod schema to a JSON schema for the tool definition)
  - System prompt must include: field-type judgment rules (emails →
    `email` type, yes/no → `radio`, 2-5 known options → `select`, open-ended
    → `textarea` vs `text` by expected length), a field count cap of 4-10
    unless the user's prompt implies otherwise, and 2-3 few-shot examples of
    (prompt → good form JSON)
  - Validate the LLM's output against `FormSchema` with Zod server-side
  - On validation failure: retry once with the validation error appended to
    the prompt; if it fails again, return a clear error to the client rather
    than 500ing
  - Save as a new `Form` row with `status: draft`, return the form id

### Phase 3 — Form editor
- `/dashboard/forms/[id]/edit` page
- Renders the AI-generated fields in an editable list: reorder (drag and
  drop), edit label/type/required/options inline, add field, delete field
- Autosave `fieldsJson` on change (debounced), no explicit save button needed
- "Publish" button flips `status` to `published`

### Phase 4 — Public form + submission
- `/f/[id]` public route (no auth) — renders the form from `fieldsJson`
  using the field types to pick the right input component
- Client + server-side validation using the same `FormSchema`-derived rules
  (required fields, type checks)
- `POST /api/forms/[id]/submit` — validates and writes a `Response` row
- Simple thank-you state after submit

### Phase 5 — Responses view
- `/dashboard/forms/[id]/responses` — table of responses, columns derived
  from the form's field labels
- CSV export button (generate client-side from the loaded response data,
  no need for a backend export job at this scale)

## Non-functional requirements
- Every LLM call and DB mutation needs try/catch with a sensible user-facing
  error state — no unhandled promise rejections reaching the UI
- Rate-limit `/api/forms/generate` per user (simple in-memory or DB-backed
  counter is fine for MVP — flag if you'd want Redis at scale but don't add
  Redis now)
- Write a `.env.example` listing every env var this project needs
- Write a short `README.md`: setup steps, env vars, the Docker Compose
  workflow (up / migrate / down), and how to run locally without Docker as
  a fallback

## How I want you to work
- Build phase by phase in the order above. After each phase, tell me what
  you built, how to test it, and stop for me to confirm before continuing.
- Prefer boring, well-known patterns over clever ones — this needs to be
  maintainable by one person (me).
- If a decision genuinely could go two reasonable ways (e.g. exact Tailwind
  component structure), just pick one and note it briefly rather than asking.
- If something in this brief is ambiguous or you think it's a bad idea, say
  so before building it, don't silently change scope.
