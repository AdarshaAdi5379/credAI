import type { AuditResult } from "@/types";

export type AiSummaryResult =
  | { ok: true; summary: string }
  | { ok: false; error: string };

export async function fetchAiSummary(result: AuditResult): Promise<AiSummaryResult> {
  const { input, findings, totals } = result;

  const payload = {
    teamSize: input.teamSize,
    useCase: input.primaryUseCase,
    tools: input.items.map((item) => ({
      toolName: item.toolId,
      planName: item.planId,
      seats: item.seats,
      spend: item.monthlySpendUsd,
    })),
    findings: findings.map((f) => ({
      toolName: f.toolId,
      currentPlan: f.current.planId,
      currentMonthly: f.current.monthlySpendUsd,
      recommendation: f.recommendation.planId,
      monthlySavings: f.monthlySavingsUsd,
      reason: f.reason,
    })),
    totals: {
      currentMonthly: totals.currentMonthlyUsd,
      recommendedMonthly: totals.recommendedMonthlyUsd,
      monthlySavings: totals.monthlySavingsUsd,
      annualSavings: totals.annualSavingsUsd,
    },
  };

  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { ok: false, error: `API returned ${res.status}` };
    }

    const data = (await res.json()) as { summary?: string; error?: string };
    if (data.summary) {
      return { ok: true, summary: data.summary };
    }

    return { ok: false, error: data.error ?? "Unknown error" };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
