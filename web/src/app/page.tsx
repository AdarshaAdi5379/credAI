import Link from "next/link";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SpendAuditForm } from "@/components/SpendAuditForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/60 dark:bg-black/50">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black" />
              <div className="text-sm font-semibold tracking-tight">AI Spend Audit</div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="#audit"
                className="hidden text-sm text-zinc-600 hover:text-zinc-900 md:inline dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Run audit
              </Link>
              <a href="#audit" className="inline-flex">
                <Button type="button" variant="secondary">
                  Start
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </header>

      <main>
        <section className="py-14 md:py-20">
          <Container>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  Deterministic math | No login | Shareable results
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                  Find hidden savings in your AI tool stack.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  Enter what you pay for Cursor, Copilot, Claude, ChatGPT, Gemini, and more. Get an
                  instant, defensible spend audit and a clear savings plan - no login.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href="#audit">
                    <Button type="button">Run my audit</Button>
                  </a>
                  <a href="#example">
                    <Button type="button" variant="secondary">
                      See what you get
                    </Button>
                  </a>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs font-medium text-zinc-500">Typical output</div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">$0 to $500+/mo</div>
                    <div className="mt-1 text-xs">Savings estimate with reasons</div>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs font-medium text-zinc-500">Designed for</div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">2 to 50 dev teams</div>
                    <div className="mt-1 text-xs">Founders and engineering leads</div>
                  </div>
                </div>
              </div>

              <div
                id="example"
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Example report</div>
                  <div className="text-xs text-zinc-500">Preview</div>
                </div>
                <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/20">
                  <div className="text-xs font-medium text-zinc-500">Estimated savings</div>
                  <div className="mt-1 text-3xl font-semibold tracking-tight">$210/mo</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">$2,520/yr</div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      title: "Claude Team -> Pro",
                      body: "For 1-2 users, individual seats are often cheaper.",
                    },
                    {
                      title: "Cursor Business -> Pro",
                      body: "If you are not collaborating heavily, you may not need Teams.",
                    },
                  ].map((row) => (
                    <div
                      key={row.title}
                      className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="font-medium">{row.title}</div>
                      <div className="mt-1 text-zinc-600 dark:text-zinc-400">{row.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="audit" className="pb-16">
          <Container>
            <SpendAuditForm />
            <div className="mt-6 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Inputs are stored in your browser for convenience. Public sharing and lead capture will be
              added after the core flow is complete.
            </div>
          </Container>
        </section>

        <section className="border-t border-zinc-200/60 py-14 dark:border-zinc-800/60">
          <Container>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  title: "Defensible",
                  body: "Deterministic rules with clear reasons. No AI math.",
                },
                {
                  title: "Fast",
                  body: "Instant results with local form persistence.",
                },
                {
                  title: "Shareable",
                  body: "Designed to become a public report URL with strong OG previews.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="text-sm font-semibold">{card.title}</div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{card.body}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-zinc-200/60 py-14 dark:border-zinc-800/60">
          <Container>
            <h2 className="text-xl font-semibold tracking-tight">FAQ</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              {[
                {
                  q: "Is this free?",
                  a: "Yes. You can run the audit without creating an account.",
                },
                {
                  q: "Do you store my data?",
                  a: "Your inputs stay in your browser by default. If you choose to save/share a report, we store a sanitized version and never expose email or company on the public link.",
                },
                {
                  q: "How do you calculate savings?",
                  a: "With deterministic, explainable rules based on public pricing. No AI decides the math.",
                },
                {
                  q: "What if my stack is already optimal?",
                  a: "We will tell you. No made-up savings. You can still opt in to get updates when new optimizations apply.",
                },
                {
                  q: "Why is Credex mentioned?",
                  a: "If your savings opportunity is large, Credex can help capture it through discounted credits and a quick consultation.",
                },
              ].map((faq) => (
                <div key={faq.q}>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{faq.q}</div>
                  <div className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{faq.a}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-zinc-200/60 py-10 text-sm text-zinc-500 dark:border-zinc-800/60 dark:text-zinc-400">
        <Container>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>Built for Credex AI Spend Audit.</div>
            <div className="text-xs">No user data is transmitted to an LLM in this MVP.</div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
