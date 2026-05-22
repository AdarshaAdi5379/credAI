import type { AuditFinding, AuditResult } from "@/types";

function round0(n: number): number {
  return Math.round(n);
}

function formatUsd(n: number): string {
  const whole = round0(n);
  return whole.toLocaleString("en-US");
}

function topSavings(findings: AuditFinding[], limit: number): AuditFinding[] {
  return findings
    .filter((f) => f.monthlySavingsUsd > 0)
    .sort((a, b) => b.monthlySavingsUsd - a.monthlySavingsUsd)
    .slice(0, limit);
}

export function buildFallbackSummary(result: AuditResult): string {
  const currentMonthly = result.totals.currentMonthlyUsd;
  const monthlySavings = result.totals.monthlySavingsUsd;
  const annualSavings = result.totals.annualSavingsUsd;
  const toolCount = result.input.items.length;

  const winners = topSavings(result.findings, 2);
  if (winners.length === 0 || monthlySavings <= 0) {
    return [
      `Your current stack looks efficient for the inputs provided. You’re spending about $${formatUsd(currentMonthly)}/mo across ${toolCount} tool${toolCount === 1 ? "" : "s"}, and the audit didn’t find a defensible downgrade using verified pricing.`,
      "As your team and usage change, re-check seat counts and plan renewals to avoid accidental upgrades.",
      "Want us to sanity-check your usage assumptions?",
    ].join(" ");
  }

  const bullets = winners
    .map((f) => `${f.toolId}: save ~$${formatUsd(f.monthlySavingsUsd)}/mo by switching to ${f.recommendation.planId}`)
    .join("; ");

  return [
    `You’re currently spending about $${formatUsd(currentMonthly)}/mo across ${toolCount} tool${toolCount === 1 ? "" : "s"}. Based on plan-fit checks, you could save roughly $${formatUsd(monthlySavings)}/mo (~$${formatUsd(annualSavings)}/yr).`,
    `Top opportunities: ${bullets}.`,
    "If these changes match your workflow, trial them for a week and track usage.",
    "Want us to sanity-check your usage assumptions?",
  ].join(" ");
}

