"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AuditResult } from "@/types";
import { TOOL_LABELS } from "@/types/tools";
import { fetchAiSummary } from "@/services/aiSummary";
import { buildFallbackSummary } from "@/services/summaryFallback";
import { Button } from "@/components/Button";

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);

  return <span>${formatUsd(display)}{suffix}</span>;
}

function SpendBar({
  label,
  amount,
  color,
}: {
  label: string;
  amount: number;
  color: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="relative h-4 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(amount, 100)}%` }}
        />
      </div>
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        ${formatUsd(amount)}/mo
      </div>
    </div>
  );
}

function CredexCtaSection({ tier, monthlySavings }: { tier: string; monthlySavings: number }) {
  if (tier === "none") return null;

  if (tier === "prominent") {
    return (
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-700 dark:bg-emerald-950/40">
        <div className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
          You could save ${formatUsd(monthlySavings)}/mo or more
        </div>
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
          Credex offers discounted credits for Cursor, Claude, ChatGPT, and GitHub Copilot.
          A quick consultation can confirm what applies to your stack.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button type="button" variant="primary">
            Talk to Credex
          </Button>
          <Button type="button" variant="secondary">
            Learn more
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Want to capture more of this savings?
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Credex credits can reduce costs on Cursor, Claude, ChatGPT, and more.
      </p>
      <Button type="button" variant="secondary" className="mt-3">
        Check with Credex
      </Button>
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <Button type="button" variant="secondary" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy link"}
    </Button>
  );
}

export function AuditResults({ result, onReset }: { result: AuditResult; onReset?: () => void }) {
  const { totals, findings, opportunities, credexCtaTier } = result;
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setAiSummaryLoading(true);
    fetchAiSummary(result).then((res) => {
      setAiSummaryLoading(false);
      if (res.ok) {
        setAiSummary(res.summary);
      } else {
        setAiSummaryError(true);
      }
    });
  }, [result]);

  const totalCurrent = totals.currentMonthlyUsd;
  const totalRecommended = totals.recommendedMonthlyUsd;
  const maxAmount = Math.max(totalCurrent, totalRecommended, 1);

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Estimated savings
            </div>
            <div className="mt-2 text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 md:text-5xl">
              <AnimatedCounter target={totals.monthlySavingsUsd} suffix="/mo" />
            </div>
            <div className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              ~${formatUsd(totals.annualSavingsUsd)}/yr
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyLinkButton />
              <Button type="button" variant="secondary">
                Share on X
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="flex gap-4">
              <SpendBar label="Current" amount={(totalCurrent / maxAmount) * 100} color="bg-zinc-600 dark:bg-zinc-400" />
              <SpendBar label="Recommended" amount={(totalRecommended / maxAmount) * 100} color="bg-emerald-500" />
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              <span>Savings gap: ${formatUsd(totals.monthlySavingsUsd)}/mo</span>
              <span>{result.input.primaryUseCase} · {result.input.teamSize} dev{result.input.teamSize !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Per-tool breakdown
        </div>
        {findings.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {TOOL_LABELS[f.toolId]?.[0] ?? "?"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {TOOL_LABELS[f.toolId] ?? f.toolId}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {f.current.planId} &rarr; {f.recommendation.planId}
                  </div>
                </div>
              </div>
              {f.monthlySavingsUsd > 0 ? (
                <div className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                  -${formatUsd(f.monthlySavingsUsd)}/mo
                </div>
              ) : (
                <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  No change
                </div>
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{f.reason}</p>
          </div>
        ))}
      </div>

      <CredexCtaSection tier={credexCtaTier} monthlySavings={totals.monthlySavingsUsd} />

      {opportunities.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Opportunities
          </div>
          {opportunities.map((opp, i) => (
            <div
              key={i}
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
            >
              {opp.description}
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {aiSummary ? "AI Summary" : "Summary"}
        </div>
        {aiSummaryLoading ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            <span className="text-zinc-500">Generating AI summary...</span>
          </div>
        ) : null}
        <p className="mt-2 leading-6">
          {aiSummary ?? buildFallbackSummary(result)}
        </p>
        {aiSummaryError && !aiSummary ? (
          <p className="mt-1 text-xs text-zinc-500">
            AI summary unavailable. Showing a templated version instead.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <CopyLinkButton />
        <Button type="button" variant="secondary">
          Share on X
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Run another audit
        </Button>
      </div>
    </div>
  );
}
