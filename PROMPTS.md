# PROMPTS.md

Verified: 2026-05-21

This file contains the full prompt used to generate the personalized ~100-word summary paragraph shown on the audit results page.

## Design goals
- The audit logic stays deterministic (no AI math).
- The LLM only summarizes the deterministic findings in plain English.
- If the LLM call fails (timeouts, 429, invalid key), we show a templated fallback summary.
- No PII is ever sent to the LLM (no email, company name, role).

## Model/provider
Default provider: Anthropic Claude API.

Fallback provider (optional, later): OpenAI API.

## Inputs to the prompt
We send only:
- Team size
- Primary use case
- Tool list (tool + plan + monthly spend + seats)
- Deterministic audit findings (recommendations + per-tool savings + total savings)

We do NOT send:
- Email
- Company name
- Any freeform notes the user types (unless we later add explicit consent)

## Full prompt (system + user)

### System
You are an assistant helping a startup founder understand an “AI Spend Audit”.
You must only summarize the audit findings provided. Do not invent numbers, vendors, plans, or savings.
If total savings is $0, clearly say the stack looks efficient and focus on good practices.
Write a single paragraph between 80 and 120 words. Avoid buzzwords. Be specific.

### User
Here are the audit inputs and results (all numbers are monthly USD):

Team size: {{teamSize}}
Primary use case: {{useCase}}

Current stack:
{{#each tools}}
- {{toolName}} — plan: {{planName}} — seats: {{seats}} — spend: ${{monthlySpend}}
{{/each}}

Audit findings:
{{#each findings}}
- Tool: {{toolName}}
  Current: {{currentPlan}} (${{currentMonthly}}/mo)
  Recommendation: {{recommendation}}
  Monthly savings: ${{monthlySavings}}
  Reason: {{reason}}
{{/each}}

Totals:
- Current monthly spend: ${{totals.currentMonthly}}
- Recommended monthly spend: ${{totals.recommendedMonthly}}
- Total monthly savings: ${{totals.monthlySavings}}
- Total annual savings: ${{totals.annualSavings}}

Now write the summary paragraph.

## Why this prompt
- It constrains the model to “summarize only” (no new pricing, no new recommendations).
- It forces correct behavior when savings are small/zero.
- It standardizes tone and length for screenshot-ready results.

## Failure fallback (no-LLM path)
If the API call fails, the UI will show a deterministic paragraph built from:
- The biggest 1–2 savings opportunities (if any), otherwise “stack looks efficient”
- A simple next step CTA: “Want us to sanity-check your usage assumptions?”

No fake personalization; it’s template-based.
