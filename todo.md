# AI Spend Audit - Project Todo

This file is the step-by-step build order for the full project.

## Agent Rules
- Work on one feature or one tightly related step at a time.
- Do not start the next feature until the current one is complete, tested, and reviewed.
- After each successful implementation step, create a git commit with a clear conventional commit message.
- Push every completed commit to GitHub immediately after the commit.
- Keep commits small and scoped to a single step.
- Do not mix documentation, UI, backend, and test changes in one commit unless they are the same step.
- If a step depends on research or pricing data, finish that research first and record the source.
- If a step fails validation, fix it before moving on.
- Never invent savings, pricing, user quotes, or interview data.

## Phase 1 - Project Foundation
- [ ] Confirm the final product name, repository name, and deployment target.
- [ ] Read `prd.md` and `instructions.md` end to end before coding.
- [ ] Choose the final stack and document the choice in `ARCHITECTURE.md`.
- [ ] Initialize the app scaffold if it does not already exist.
- [ ] Set up TypeScript, linting, formatting, and path aliases.
- [ ] Create the base folder structure: `app/`, `components/`, `lib/`, `services/`, `types/`, `hooks/`.
- [ ] Add the main layout, global styles, metadata defaults, and favicon/logo assets.
- [ ] Add environment variable handling and a checked-in example env file if needed.
- [ ] Create the first commit for the scaffold and push it.

## Phase 2 - Product Research and Content
- [ ] Write `PRICING_DATA.md` with official vendor pricing URLs for every supported tool and plan.
- [ ] Verify that each pricing number used in the audit engine is traceable to a source URL.
- [ ] Write the first version of `PROMPTS.md` for the AI summary prompt and fallback strategy.
- [ ] Draft `LANDING_COPY.md` with the homepage headline, CTA, social proof block, and FAQ.
- [ ] Draft `GTM.md` with target user, channels, first-100-user plan, and unfair advantage.
- [ ] Draft `ECONOMICS.md` with lead value, CAC assumptions, conversion math, and ARR scenario.
- [ ] Draft `METRICS.md` with the North Star metric, input metrics, instrumentation, and pivot threshold.
- [ ] Run and document three real user interviews in `USER_INTERVIEWS.md`.
- [ ] Add the first documentation commit and push it.

## Phase 3 - Audit Data Model
- [ ] Define the canonical tool list and supported plans in `types/`.
- [ ] Define form input types for spend, seats, team size, and use case.
- [ ] Define audit output types for recommendations, savings, and summary text.
- [ ] Define lead capture and public audit payload types.
- [ ] Define validation schemas for all user-facing inputs.
- [ ] Add a commit for the shared types and schemas.

## Phase 4 - Deterministic Audit Engine
- [ ] Create a standalone audit engine module.
- [ ] Encode same-vendor downgrade rules.
- [ ] Encode team-size and plan-fit rules.
- [ ] Encode low-volume API-vs-subscription rules.
- [ ] Encode use-case fit rules for coding, writing, data, research, and mixed use.
- [ ] Encode Credex-credit opportunity rules where applicable.
- [ ] Ensure the engine never invents savings and returns zero when uncertain.
- [ ] Add clear human-readable reasons for every recommendation.
- [ ] Add a helper that calculates monthly and annual savings totals.
- [ ] Add unit tests for each rule path.
- [ ] Add a commit for the audit engine and its tests.

## Phase 5 - Audit Engine Test Coverage
- [ ] Write at least five tests covering the audit engine behavior.
- [ ] Test that a team plan for two users downgrades correctly.
- [ ] Test that an already optimal stack returns no savings.
- [ ] Test that savings above the threshold triggers the Credex CTA state.
- [ ] Test that public audit payloads strip identifying information.
- [ ] Test that summary fallback logic works when the LLM request fails.
- [ ] Add any additional tests needed to cover edge cases and regressions.
- [ ] Commit the expanded test suite and push it.

## Phase 6 - Core User Flow UI
- [ ] Build the landing page with a strong hero and clear value proposition.
- [ ] Add an interactive entry path into the audit flow.
- [ ] Build the spend input form for all supported tools.
- [ ] Include plan, monthly spend, seats, team size, and use case fields.
- [ ] Add local storage persistence for form state.
- [ ] Add validation, error states, and loading states.
- [ ] Make the form fully responsive and mobile-friendly.
- [ ] Add a commit for the landing page and form work.

## Phase 7 - Audit Results Experience
- [ ] Build the audit results page with a large savings hero card.
- [ ] Show total monthly savings and annual savings prominently.
- [ ] Show per-tool current spend, recommendation, savings, and reason.
- [ ] Add honest messaging when the stack already looks efficient.
- [ ] Add the Credex consultation CTA for high-savings cases.
- [ ] Add visual polish such as charts, benchmark cards, counters, or before/after spend visuals.
- [ ] Add copy-link and share affordances for the public result.
- [ ] Commit the results-page implementation and push it.

## Phase 8 - AI Summary
- [ ] Integrate an LLM call for the personalized summary paragraph.
- [ ] Use the deterministic audit result as the only input to the prompt.
- [ ] Keep the prompt definition in `PROMPTS.md`.
- [ ] Add graceful failure handling for API timeouts and errors.
- [ ] Build a templated fallback summary for LLM failures.
- [ ] Add tests for prompt construction and fallback behavior.
- [ ] Commit the summary feature and tests.

## Phase 9 - Lead Capture and Storage
- [ ] Choose the backend for lead storage.
- [ ] Create the lead capture form shown after the audit result.
- [ ] Capture email, company name, role, and team size.
- [ ] Store leads in the backend with the public/private separation required by the PRD.
- [ ] Add transactional email sending for confirmation.
- [ ] Add abuse protection using rate limiting, honeypot, or hCaptcha.
- [ ] Document the abuse protection choice in the docs.
- [ ] Add tests for lead payload validation and public-data filtering.
- [ ] Commit the lead capture and storage work.

## Phase 10 - Shareable Public URLs
- [ ] Implement unique public audit URLs such as `/audit/[id]`.
- [ ] Ensure the public page excludes email and company fields.
- [ ] Keep tools, recommendations, and savings visible on the public version.
- [ ] Add Open Graph tags and Twitter card metadata.
- [ ] Ensure the public page renders cleanly when shared.
- [ ] Add tests for public payload sanitization and metadata presence.
- [ ] Commit the shareable URL feature.

## Phase 11 - Required Documentation
- [ ] Write `README.md` with summary, screenshots or recording, quick start, decisions, and deployed URL.
- [ ] Write `ARCHITECTURE.md` with system diagram, data flow, stack choice, and scaling notes.
- [ ] Write `DEVLOG.md` with seven dated entries matching the required format.
- [ ] Write `REFLECTION.md` with all five required answers.
- [ ] Write `TESTS.md` with every automated test, what it covers, and how to run it.
- [ ] Write or update `PRICING_DATA.md` with source URLs and verification dates.
- [ ] Write or update `PROMPTS.md` with the full LLM prompt and rationale.
- [ ] Write `GTM.md`, `ECONOMICS.md`, `USER_INTERVIEWS.md`, `LANDING_COPY.md`, and `METRICS.md`.
- [ ] Review all docs for consistency with the actual implementation.
- [ ] Commit the documentation bundle and push it.

## Phase 12 - CI and Quality Gates
- [ ] Add `.github/workflows/ci.yml`.
- [ ] Run lint in CI.
- [ ] Run tests in CI.
- [ ] Make sure the workflow passes on `main`.
- [ ] Verify the repository shows green checks on the latest commit.
- [ ] Add any missing scripts needed for local and CI execution.
- [ ] Commit the CI setup and push it.

## Phase 13 - Accessibility and Performance
- [ ] Audit semantic HTML across all screens.
- [ ] Check keyboard navigation and focus states.
- [ ] Ensure color contrast is strong enough for accessibility.
- [ ] Optimize loading for images, fonts, and bundle size.
- [ ] Add skeletons or loading states where users wait for data.
- [ ] Verify mobile layout quality on small screens.
- [ ] Run Lighthouse and fix issues until targets are met.
- [ ] Commit performance and accessibility improvements.

## Phase 14 - Deployment
- [ ] Configure production environment variables.
- [ ] Deploy the app to the chosen hosting platform.
- [ ] Verify the live URL works from a clean browser session.
- [ ] Verify the public audit URL works in production.
- [ ] Verify transaction email and lead storage in production.
- [ ] Verify Open Graph previews on the deployed URL.
- [ ] Commit any deployment-specific config and push it.

## Phase 15 - Final Review
- [ ] Run the full test suite.
- [ ] Review git history to confirm multiple meaningful commits across the work.
- [ ] Confirm all required PRD files exist at the repository root.
- [ ] Confirm the repo name is correct everywhere it matters.
- [ ] Confirm no secrets are committed.
- [ ] Confirm the final product matches the PRD and instructions.
- [ ] Write any final cleanup commit and push it.

## Optional Bonus Work
- [ ] Add PDF export for the full report.
- [ ] Add an embeddable widget version.
- [ ] Add benchmark mode for spend comparison.
- [ ] Add referral codes if the core product is already complete.
- [ ] Draft a launch post or Twitter thread for the product.

## Commit Discipline
- [ ] One feature, one commit.
- [ ] One documentation bundle, one commit.
- [ ] One test expansion, one commit.
- [ ] Push after every successful commit.
- [ ] Never leave a completed step uncommitted.
- [ ] Never start the next step until the current commit is on GitHub.

