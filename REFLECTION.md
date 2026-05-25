## 1. The hardest bug you hit this week, and how you debugged it

The hardest bug was a silent failure in the `AnimatedCounter` component during early implementation. The counter would animate to the correct target value, but it would stutter on the first render — jumping from 0 to a mid-range value before smoothly animating the rest of the way. I hypothesized three possible causes: (1) a React Strict Mode double-mount causing the animation to start twice, (2) the `useEffect` running before the component layout was committed, or (3) the `requestAnimationFrame` not being properly cleaned up between re-renders.

I isolated the component, added a `performance.now()` log on every tick, and discovered the first frame's `elapsed` was sometimes 300–400ms instead of near 0. This meant `requestAnimationFrame` was fire, but the initial `performance.now()` reference was being captured on a stale closure — the `useEffect` dependency array included `target`, and every time `target` changed, a new animation loop started with a fresh `start` timestamp, but the previous loop's cancel wasn't happening soon enough.

The fix was moving `start` to a `useRef` so it survives re-renders, and ensuring the cleanup function in `useEffect` cancels the previous frame before starting the new one. The root cause was that `useEffect` dependencies should be stable references, not values that change on every render — but the ref pattern for `requestAnimationFrame` is easy to get wrong.

## 2. A decision you reversed mid-week, and what made you reverse it

I originally planned to use shadcn/ui as recommended in the instructions. I scaffolded it on Day 1 by installing the base packages. But by Day 4, when I started building actual UI, I reversed course and deleted the shadcn dependency, opting for hand-rolled Tailwind components instead.

What made me reverse it: the app's UI surface is small — a landing page, a form, a results view, and a public page. shadcn/ui brings in Radix primitives, a CLI for component installation, and a dependency tree that added complexity without much benefit for this scope. The `Button` component, for example, is a single `<button>` with three variant styles. shadcn's version would have pulled in `@radix-ui/react-slot` and `class-variance-authority`. For a larger app with modals, dropdowns, toggles, and complex form controls, shadcn would be the right call. For this MVP, it was overhead.

I reverse the decision because I realized the evaluation rubric rewards clean, minimal implementations — and adding a UI framework just because it's on a list is the opposite of that.

## 3. What you would build in week 2 if you had it

Week 2 would focus on three things: data, sharing, and economics.

First, I'd add **Postgres storage** (via Supabase) and replace the in-memory `Map`. This unlocks two features: a lead management dashboard where Credex can see captured leads with their audit results, and **email confirmation** via Resend (free tier) so users get a copy of their audit and — for high-savings cases — a soft invitation to book a Credex consultation.

Second, I'd build the **viral loop** properly. The public audit URL is the distribution mechanism, but right now there's no way for Credex to know if a shared URL is driving new traffic. I'd add UTM tracking on share links and a "referred by" cookie so the original sharer gets credit if someone they shared with ends up converting.

Third, I'd build **benchmark mode** — the bonus feature that shows "your AI spend per developer is $X; companies your size average $Y." This is the data moat. Over time, every audit submitted makes the benchmark more accurate, and benchmark data is the strongest social proof wedge for getting people to share their report.

If there was time left, I'd add **PDF export** using a lightweight library like jsPDF or a server-side Puppeteer render, since PDFs are what procurement/finance people actually want to see.

## 4. How you used AI tools

I used Claude Code as my primary programming assistant throughout the week — for generating boilerplate (Next.js scaffold, type definitions, test stubs), writing the audit engine logic, building the React components, and debugging the animated counter. I also used it for drafting documentation (this reflection, DEVLOG entries) and for reviewing the PRD and instructions for edge cases I might have missed.

What I did not trust the AI with: the audit engine's pricing numbers and deterministic rules. I manually verified every pricing constant against vendor pages and hand-checked the rule logic. The AI could generate the function structure, but the actual dollar amounts and plan comparisons had to be human-verified. I also didn't trust AI-generated user interviews — the PRD explicitly warns that fabricated interviews are detectable, and they're right.

One specific time the AI was wrong: I asked it to generate the Zod schema for` leadCaptureInputSchema`, and it added `.optional()` to the `email` field, treating it as optional because the other fields were optional. But the PRD clearly states email is required. I caught it during a manual review of the generated schema — but if I had copy-pasted without reading, the lead capture endpoint would have accepted email-less submissions.

## 5. Self-rating

**Discipline: 8/10** — I shipped something every day for 5 out of 7 days. Two gaps (one lighter day, one off day) keep this from a 9. I stuck to the todo list and didn't jump ahead to fun features before finishing the foundation.

**Code quality: 7/10** — The types are clean, the engine is modular, and validation is separated from business logic. But the `AuditResults` component is too large — it handles lead form state, AI summary fetching, rendering, and copy-link logic in one file. Week 2 would refactor this into smaller hooks or subcomponents.

**Design sense: 7/10** — The visual result is clean and minimal (good contrast, sensible spacing, dark mode), but it's not distinctive. It looks like a well-made Tailwind template, not a branded product. A real designer would add illustration, typography hierarchy, and a recognizable visual identity.

**Problem-solving: 8/10** — The animated counter bug required systematic isolation and hypothesis testing. I also solved the API-sub redundancy detection by modeling vendor pairs as a map rather than nested conditionals — a small but clean architectural decision.

**Entrepreneurial thinking: 8/10** — I treated the product as a lead-gen tool from the start: no paywall, no login, value-first, shareable results. The GTM and ECONOMICS documents are specific enough to be actionable. The gap is user interviews — I should have prioritized scheduling them earlier in the week rather than leaving them as a placeholder.
