# Architecture

## System Diagram

```mermaid
flowchart LR
    User[User Browser] -->|HTTP| Next[Next.js App]
    Next -->|Static| Page[Landing / Audit Results / Public Report]
    Next -->|API Route| AI[Anthropic Claude API]
    Next -->|API Route| LeadAPI[Lead Capture Endpoint]
    LeadAPI --> Storage[In-Memory Map Store]
    AI -->|Summary Text| Next

    subgraph Client-Side
        Form[SpendAuditForm]
        Results[AuditResults]
        LocalStorage[(localStorage)]
    end

    subgraph Server-Side
        Engine[Deterministic Audit Engine]
        AI_API[/api/summary]
        Lead_API[/api/leads]
        PublicAPI[/audit/[id]]
    end

    Form -->|Parse + Validate| Engine
    Engine -->|AuditResult| Results
    Results -->|Fetch| AI_API
    Results -->|POST| Lead_API
    PublicAPI --> Storage
```

## Data Flow

1. **User enters spend data** in the `SpendAuditForm` component. Inputs are persisted to `localStorage` on every change via `useLocalStorageState`.
2. **Form submission** triggers Zod parsing (`parseSpendFormInput`) and then `runAudit()` from the deterministic engine.
3. **Engine processes each tool** through rule functions:
   - `applyDeterministicRules` — same-vendor downgrade checks (Claude Team→Pro for ≤2 seats, etc.)
   - `findApiSubRedundancies` — detects when a user pays for both a subscription and API access from the same vendor
   - `findUseCaseObservations` — flags mismatches between primary use case and tool selection
   - `findCredexOpportunities` — surfaces Credex credit eligibility for qualifying tools
4. **Results are stored** in an in-memory `Map<string, AuditRecord>` via `saveAudit()`, returning a unique `audit_xxx` ID.
5. **AI summary is fetched client-side** — `AuditResults` calls `fetchAiSummary()` → `POST /api/summary` → Anthropic Claude API. If the API fails, `buildFallbackSummary()` renders a templated fallback.
6. **Lead capture** — User submits email/company/role via a form. The `POST /api/leads` endpoint validates with Zod, checks a honeypot field, and attaches the lead to the stored audit record.
7. **Public report** — `/audit/[id]` is a server-rendered page that calls `getPublicAudit()`, which strips PII via `toPublicAuditView()` and returns only tools/savings/findings. OG and Twitter card metadata are generated server-side.

## Stack Choice

- **Next.js 16 + TypeScript + Tailwind CSS** — As recommended by the PRD. Provides SSR for public audit pages, API routes for the lead endpoint and AI proxy, and file-based routing for clean URL structure.
- **Zod** — Runtime validation for both form inputs and API payloads. Shares types between client and server.
- **Vitest** — Test runner that shares Vite/TypeScript config, faster than Jest for this scale.
- **Anthropic Claude API** — Used exclusively for the AI summary (the one feature that explicitly requires an LLM). Prompt is defined in `PROMPTS.md`.
- **In-memory Map** — Lead storage. Adequate for MVP; trivially replaceable with Supabase/Postgres.

## Scaling to 10k Audits/Day

1. **Replace in-memory storage with Postgres** (Supabase or similar) — the `storage.ts` interface (`saveAudit`, `attachLead`, `getPublicAudit`) would get a database adapter with no changes to callers.
2. **Add rate limiting** at the edge (Vercel KV or Cloudflare) to protect `/api/leads` and `/api/summary` from abuse.
3. **Cache AI summaries** — Store the generated summary alongside the audit result so repeat fetches don't re-query the Anthropic API.
4. **Move AI summary to server-initiated** — Instead of the client calling `/api/summary`, generate the summary server-side during `saveAudit()` and store it. This reduces client waterfalls and retry complexity.
5. **Add database indexing** on `auditId` and `createdAt` for the public URL lookup and lead management views.
6. **Static generation** for popular public audit pages via ISR or on-demand revalidation.
