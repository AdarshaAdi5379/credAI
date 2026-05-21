import type {
  AuditFinding,
  AuditResult,
  AuditTotals,
  CredexCtaTier,
  SpendFormInput,
  SpendLineItemInput,
  ToolId,
} from "@/types";

import { getPlanUnitPriceUsd } from "@/services/pricing";

export const HIGH_SAVINGS_CTA_THRESHOLD_USD = 500;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

function calculateTotals(findings: AuditFinding[]): AuditTotals {
  const currentMonthlyUsd = sum(findings.map((f) => f.current.monthlySpendUsd));
  const recommendedMonthlyUsd = sum(findings.map((f) => f.recommendation.estimatedMonthlyUsd));
  const monthlySavingsUsd = round2(Math.max(0, currentMonthlyUsd - recommendedMonthlyUsd));
  return {
    currentMonthlyUsd: round2(currentMonthlyUsd),
    recommendedMonthlyUsd: round2(recommendedMonthlyUsd),
    monthlySavingsUsd,
    annualSavingsUsd: round2(monthlySavingsUsd * 12),
  };
}

function classifyCredexCtaTier(totals: AuditTotals): CredexCtaTier {
  if (totals.monthlySavingsUsd > HIGH_SAVINGS_CTA_THRESHOLD_USD) return "prominent";
  if (totals.monthlySavingsUsd > 0) return "soft";
  return "none";
}

function keepFinding(current: SpendLineItemInput): AuditFinding {
  return {
    toolId: current.toolId,
    current,
    recommendation: {
      kind: "keep",
      toolId: current.toolId,
      planId: current.planId,
      estimatedMonthlyUsd: current.monthlySpendUsd,
    },
    monthlySavingsUsd: 0,
    reason: "Your current plan looks reasonable for your inputs.",
  };
}

function recommendPlanPerSeat(
  current: SpendLineItemInput,
  recommendation: { toolId: ToolId; planId: string; kind: AuditFinding["recommendation"]["kind"] },
  unitPriceUsd: number,
  reason: string,
): AuditFinding {
  const estimatedMonthlyUsd = round2(unitPriceUsd * current.seats);
  const monthlySavingsUsd = round2(Math.max(0, current.monthlySpendUsd - estimatedMonthlyUsd));

  return {
    toolId: current.toolId,
    current,
    recommendation: {
      kind: recommendation.kind,
      toolId: recommendation.toolId,
      planId: recommendation.planId,
      estimatedMonthlyUsd,
    },
    monthlySavingsUsd,
    reason,
  };
}

function applyDeterministicRules(current: SpendLineItemInput, input: SpendFormInput): AuditFinding {
  const { toolId, planId, seats } = current;

  // Rule: "Team plan for 2 users is often wasteful" → suggest individual plans when safe.
  if (toolId === "claude" && planId === "team" && seats <= 2) {
    const unitPriceUsd = getPlanUnitPriceUsd("claude", "pro");
    if (unitPriceUsd != null) {
      return recommendPlanPerSeat(
        current,
        { toolId: "claude", planId: "pro", kind: "downgrade_same_vendor" },
        unitPriceUsd,
        "For small teams, individual Claude Pro seats are often cheaper than a Team subscription.",
      );
    }
  }

  if (toolId === "chatgpt" && planId === "team" && seats <= 2) {
    const unitPriceUsd = getPlanUnitPriceUsd("chatgpt", "plus");
    if (unitPriceUsd != null) {
      return recommendPlanPerSeat(
        current,
        { toolId: "chatgpt", planId: "plus", kind: "downgrade_same_vendor" },
        unitPriceUsd,
        "For 1–2 users, ChatGPT Plus can be cheaper than a Team/Business workspace.",
      );
    }
  }

  if (toolId === "cursor" && planId === "business" && seats <= 2) {
    const unitPriceUsd = getPlanUnitPriceUsd("cursor", "pro");
    if (unitPriceUsd != null) {
      return recommendPlanPerSeat(
        current,
        { toolId: "cursor", planId: "pro", kind: "downgrade_same_vendor" },
        unitPriceUsd,
        "If you’re not actively collaborating as a larger team, Cursor Pro seats may cover your needs at a lower cost.",
      );
    }
  }

  // Default: keep (we don’t guess).
  // Also, never recommend a plan we can’t price deterministically.
  void input;
  return keepFinding(current);
}

export function runAudit(input: SpendFormInput): AuditResult {
  const findings = input.items.map((item) => applyDeterministicRules(item, input));
  const totals = calculateTotals(findings);
  return {
    input,
    findings,
    totals,
    credexCtaTier: classifyCredexCtaTier(totals),
  };
}
