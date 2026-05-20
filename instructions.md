# AI Spend Audit - Implementation Instructions

## Project Goal
Build a production-quality web app called **AI Spend Audit** for startup founders and engineering managers.

This is not a coding exercise. The product should feel like something Credex could ship on Product Hunt next month.

Core principle:
- Show value first
- Capture lead second
- No login wall
- No email before audit results

## Primary User
Target user:
- Startup founder
- CTO
- Engineering manager
- Team size: 2-50
- Already paying for multiple AI tools monthly
- Wants to reduce AI spend without losing capability

User journey:
1. Cold visitor lands from Twitter, Hacker News, blog, or direct share
2. User enters tools, plans, monthly spend, seats, team size, and primary use case
3. Instant audit result appears
4. Personalized AI summary is generated
5. User sees savings opportunities and recommendations
6. Email capture appears after value is delivered
7. User can share a public report URL

## Product Experience
Avoid anything that feels like a generic admin dashboard.

Landing page should include:
- Hero section
- Clear value proposition
- Interactive demo or entry path
- Trust indicators
- Example outputs or screenshots
- FAQ
- Mobile-first layout

Audit results page must be screenshot-worthy and shareable.

Key visual hierarchy:
- Large hero card showing monthly savings
- Annual savings directly below or beside it
- Clear current spend vs recommendation vs savings breakdown
- Strong callout for high-savings cases

The page should feel polished enough that a founder would share it publicly.

## MVP Features

### 1. Spend Form
Build a form that supports at minimum the following tools and plans:

- Cursor: Hobby, Pro, Business, Enterprise
- GitHub Copilot: Individual, Business, Enterprise
- Claude: Free, Pro, Max, Team, Enterprise, API
- ChatGPT: Plus, Team, Enterprise, API
- Anthropic API direct
- OpenAI API direct
- Gemini: Pro, Ultra, API
- One additional tool: choose either Windsurf or v0

For each tool entry capture:
- Selected tool
- Plan
- Monthly spend
- Seats
- Team size
- Primary use case: coding, writing, data, research, or mixed

Requirements:
- Persist form state with local storage
- Preserve inputs across reloads
- Keep the form usable on mobile
- Use clear validation and loading states

### 2. Audit Engine
Do **not** use AI for the audit logic.

Use deterministic rules only.

The engine must be explainable and defensible. A finance person should be able to read the output and agree with the reasoning.

The engine should evaluate:
- Whether the current plan matches usage and team size
- Whether a cheaper plan from the same vendor fits
- Whether a cheaper alternative tool is defensible for the use case
- Whether the user is paying retail when credits or direct API usage could reduce cost

Example reasoning style:
- Team plan for 2 users can be wasteful
- Enterprise for a small team may be overkill
- API usage may beat subscriptions at low volume
- Certain tools fit certain use cases better
- Credex credits can reduce costs

Rules:
- Never invent savings
- Never guess savings without a clear source or rule
- If the stack already looks efficient, say so plainly
- Keep recommendations specific and reasoned

Savings bands:
- Less than $100/month: show small-optimization messaging
- $100-$500/month: show normal recommendations
- More than $500/month: surface Credex consultation prominently

Result format should include:
- Current tool and plan
- Recommendation
- Monthly savings
- Reason in one sentence

### 3. Audit Results Page
The results page should clearly show:
- Per-tool breakdown
- Total monthly savings
- Total annual savings
- Strong recommendations for the best optimizations
- Credex callout for high-savings cases

If the audit shows little or no savings:
- Be honest
- Say the stack already looks efficient
- Still allow lead capture with a softer message

For high-savings cases:
- Promote Credex as a consultation option
- Make the CTA highly visible without being deceptive

### 4. AI Summary
Generate a ~100-word personalized summary paragraph using Anthropic or another LLM.

Requirements:
- Prompt must be based on audit findings
- The full prompt must be documented in `PROMPTS.md`
- Must fail gracefully
- If the API is unavailable, use a templated fallback summary
- The audit math itself stays deterministic

### 5. Lead Capture and Storage
After the result is shown, capture:
- Email
- Company name
- Role
- Team size

Requirements:
- Store leads in a real backend
- Acceptable backend options: Supabase, Firebase, Postgres, Cloudflare D1
- Send a confirmation email
- For high-savings cases, mention that Credex may reach out

Abuse protection:
- Add rate limiting, honeypot, or hCaptcha
- Document the choice and why it was selected

### 6. Shareable Public URL
Each audit should have a unique public URL such as `/audit/[id]`.

Public version requirements:
- Remove identifying information like email and company
- Keep tools, recommendations, and savings numbers
- Add Open Graph metadata
- Add Twitter card metadata

This URL is part of the viral loop, so design it for sharing.

## Technical Stack
Recommended stack:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel

Use this stack if possible because it gives fast shipping, good SEO, and clean OG support.

If you choose a different stack, document the reason clearly in `ARCHITECTURE.md`.

## Code Quality Requirements
Structure the project so it is easy to maintain and extend.

Use:
- TypeScript types
- Reusable components
- A separate audit engine abstraction
- Loading states
- Skeleton states
- Error boundaries
- Clear folder structure

Suggested folders:
- `app/`
- `components/`
- `lib/`
- `services/`
- `types/`
- `hooks/`

Avoid giant files and tangled logic.

## Testing Requirements
Write at least 5 automated tests focused on the audit engine.

Minimum cases to cover:
- Team plan for 2 users downgrades correctly
- An optimal stack returns no savings
- Savings over $500/month triggers Credex CTA
- Summary fallback works when the API fails
- Public URLs strip PII

Tests must run for real.

## CI Requirements
Add GitHub Actions in `.github/workflows/ci.yml`.

CI must run:
- Lint
- Tests

CI should pass on the main branch and stay green on the latest commit.

## Performance and Accessibility
Target Lighthouse scores on the deployed app:
- Performance > 85
- Accessibility > 90
- Best Practices > 90

Implementation expectations:
- Use semantic HTML
- Optimize loading
- Keep the UI responsive
- Make the experience work well on mobile

## Business Thinking
Treat the app like a lead-generation product, not a CRUD app.

Every major screen should answer:
- Would a founder share this?
- Does this feel credible to a finance-minded user?
- Does the output make Credex feel like the obvious next step for high-savings cases?

## Polish Ideas
Add these if time allows:
- Animated savings counter
- Before/after spend visuals
- Benchmark cards
- Audit score
- Copy link button
- Loading animation
- Empty states
- Chart or breakdown visualization
- Mobile optimization polish

## Avoid
Do not build:
- A login wall
- Fake savings
- Generic dashboard templates
- Placeholder content
- Ugly forms
- Random AI-generated recommendations
- Hardcoded secrets
- Poor mobile design
- Giant unstructured files

## Submission Files
Make sure the final repo includes the required documentation files from the PRD:
- `README.md`
- `ARCHITECTURE.md`
- `DEVLOG.md`
- `REFLECTION.md`
- `TESTS.md`
- `.github/workflows/ci.yml`
- `PRICING_DATA.md`
- `PROMPTS.md`
- `GTM.md`
- `ECONOMICS.md`
- `USER_INTERVIEWS.md`
- `LANDING_COPY.md`
- `METRICS.md`

## Delivery Standard
Ship something that is:
- Working end to end
- Honest about savings
- Easy to understand
- Strong enough to be shared publicly
- Defensible in its logic
- Clean in its implementation

## Git Workflow
- Initialize the project as a git repository before making changes if `.git` is missing.
- After each successful implementation step, create a clear commit with a meaningful message.
- Use conventional commit style when possible, such as `feat:`, `fix:`, `docs:`, `refactor:`, or `test:`.
- Push committed changes to the GitHub repository named `credex` as you go.
- Keep commits small and tied to one completed step so the history shows real progress.
- Do not batch unrelated changes into one commit.
