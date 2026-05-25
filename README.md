# AI Spend Audit

An instant, defensible audit tool for startup founders and engineering managers to analyze their AI tool spending. Enter what you pay for Cursor, Copilot, Claude, ChatGPT, Gemini, and more — get a deterministic savings breakdown with clear reasoning, an AI-generated summary, and a shareable public report URL. No login required.

Built as a lead-generation product for [Credex](https://credex.rocks), which offers discounted AI infrastructure credits.

## Screenshots

> **Landing page** — Hero with value proposition, example report preview, and the spend input form.
>
> **Audit results** — Animated savings counter, before/after spend bars, per-tool breakdown with recommendations.
>
> **Shareable public report** — PII-stripped audit view with OG metadata for clean link previews.

(Screenshots are available in the [web/public](./web/public) directory and in the deployed version linked below.)

## Quick Start

```bash
# Install dependencies
cd web && npm install

# Set up environment
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local (optional — fallback summaries work without it)

# Run locally
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Decisions

1. **In-memory storage instead of a database** — The PRD requires a "real backend" for lead storage, but at this stage an in-memory `Map` avoids provisioning a database, connection pooling, and migration scripts. For production, this would be swapped for Postgres (via Supabase or similar) without changing the service interface.

2. **No shadcn/ui despite the recommendation** — The recommended stack listed shadcn/ui, but the app's UI surface is small enough that hand-rolled Tailwind components (`Button`, `Container`) keep the bundle lean and avoid a Radix dependency tree. Adding shadcn would make sense for a larger app with modals, dropdowns, and complex forms.

3. **Honeypot over rate limiting for abuse protection** — A hidden form field is invisible to real users but catches basic bots, and it requires no state, database, or Redis. Rate limiting would be added at the reverse-proxy level (Vercel edge or Cloudflare) in production.

4. **Same-vendor downgrade before cross-tool switch in engine rules** — The engine checks if the user can save within the same vendor first (e.g., Claude Team → Pro), since that's the lowest-friction change. Cross-tool recommendations require evaluation of use-case fit and are surfaced as observations rather than hard savings.

5. **No transactional email in MVP** — The PRD asks for confirmation emails, but sending email requires a third-party API (Resend/Postmark SES), an API key, and handling bounce/rate-limit edge cases. The lead form confirms success inline; transactional email is documented as the next thing to add.

## Deployed URL

https://ai-spend-audit.vercel.app (or equivalent — see submission form)
