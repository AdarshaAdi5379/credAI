# Tests

All tests are written with [Vitest](https://vitest.dev) and live alongside the source files they cover. Run the full suite with:

```bash
cd web && npm test
```

## Test Summary

| # | File | Tests | What it covers |
|---|------|-------|----------------|
| 1 | `src/services/audit/engine.test.ts` | 7 | Audit engine rules: same-vendor downgrade, optimal stack (no savings), high-savings Credex CTA tier, API+subscription redundancy, use-case observations, Credex credit opportunities |
| 2 | `src/services/aiSummary.test.ts` | 3 | AI summary fetch: network failure, valid payload structure, non-ok API status handling |
| 3 | `src/services/summaryFallback.test.ts` | 2 | Fallback summary generation: mentions savings when they exist, says stack looks efficient when savings are $0 |
| 4 | `src/services/publicAudit.test.ts` | 1 | Public audit view strips PII (email, company name, role not present in output) |
| 5 | `src/services/storage.test.ts` | 4 | Storage operations: save and retrieve public audit, null for non-existent audit, attach lead to existing audit, null for non-existent lead attachment |

**Total: 17 tests**

## Test Details

### 1. `src/services/audit/engine.test.ts`

Tests the deterministic audit engine (`runAudit`):

- **Downgrade Claude Team to Pro** — When a user has Claude Team with 2 seats ($25/seat = $50/mo), the engine recommends downgrading to Pro ($20/seat = $40/mo), saving $10/mo. Verifies `downgrade_same_vendor` recommendation kind.
- **Optimal stack returns no savings** — GitHub Copilot Business for 5 users at $19/seat = $95/mo is the correct plan fit. Verifies totals show $0 savings and CTA tier is `"none"`.
- **High savings triggers prominent Credex CTA** — Cursor Business for 2 seats at $3,000/mo triggers savings > $500/mo. Verifies `credexCtaTier` is `"prominent"`.
- **API + subscription redundancy** — When a user has both Claude Pro and Anthropic API direct, the engine detects the redundancy and recommends evaluating consolidating.
- **Use-case observation for coding** — When primary use case is coding but no coding-specific tool (Cursor, Copilot, Claude) is present, the engine flags the gap without inventing savings.
- **Credex credit opportunities** — When eligible tools (Cursor, Claude) are present, the engine surfaces Credex credit opportunities with relevant tool IDs.

### 2. `src/services/aiSummary.test.ts`

Tests the AI summary client (`fetchAiSummary`):

- **Network failure** — Mocks `fetch` rejection and verifies `ok: false` response.
- **Valid payload** — Mocks a successful API response and verifies the payload sent to `/api/summary` contains teamSize, useCase, tools array, findings, and totals.
- **Non-ok status** — Mocks a 503 response and verifies graceful error handling.

### 3. `src/services/summaryFallback.test.ts`

Tests the templated fallback summary (`buildFallbackSummary`):

- **Savings exist** — Generates a fallback summary that mentions the dollar savings amount.
- **No savings** — Generates a fallback summary that says the stack "looks efficient."

### 4. `src/services/publicAudit.test.ts`

Tests PII stripping in public audit views (`toPublicAuditView`):

- Verifies that `email`, `companyName`, and `role` fields are not present in the returned `PublicAuditView` object.

### 5. `src/services/storage.test.ts`

Tests the in-memory storage layer (`saveAudit`, `getPublicAudit`, `attachLead`):

- **Save and retrieve** — Saves an audit result and retrieves the public view, verifying ID format and data correctness.
- **Non-existent audit** — Verifies `null` return for unknown audit IDs.
- **Attach lead** — Saves an audit, attaches lead data, verifies linked data includes both audit and lead fields.
- **PII stripping through storage** — Saves an audit, attaches lead with PII, retrieves public view, and verifies email/company/role are absent.
