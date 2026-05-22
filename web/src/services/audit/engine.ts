import type {
  AuditFinding,
  AuditOpportunity,
  AuditResult,
  AuditTotals,
  CredexCtaTier,
  SpendFormInput,
  SpendLineItemInput,
  ToolId,
} from "@/types";

import { getPlanUnitPriceUsd } from "@/services/pricing";

export const HIGH_SAVINGS_CTA_THRESHOLD_USD = 500;
const CREDEX_ELIGIBLE_TOOLS: ToolId[] = ["cursor", "claude", "chatgpt", "github_copilot"];
const API_TOOLS: ToolId[] = ["anthropic_api", "openai_api", "gemini_api"];
const VENDOR_API_MAP: Record<string, { api: ToolId; sub: ToolId }> = {
  anthropic: { api: "anthropic_api", sub: "claude" },
  openai: { api: "openai_api", sub: "chatgpt" },
  google: { api: "gemini_api", sub: "gemini" },
};

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

  return keepFinding(current);
}

function findApiSubRedundancies(input: SpendFormInput): AuditFinding[] {
  const redundancies: AuditFinding[] = [];

  for (const [, pair] of Object.entries(VENDOR_API_MAP)) {
    const hasApi = input.items.some((i) => i.toolId === pair.api);
    const hasSub = input.items.some((i) => i.toolId === pair.sub);
    if (hasApi && hasSub) {
      const subItem = input.items.find((i) => i.toolId === pair.sub);
      const apiItem = input.items.find((i) => i.toolId === pair.api);
      if (subItem) {
        redundancies.push({
          toolId: pair.sub,
          current: subItem,
          recommendation: {
            kind: "switch_tool",
            toolId: pair.sub,
            planId: subItem.planId,
            estimatedMonthlyUsd: subItem.monthlySpendUsd,
          },
          monthlySavingsUsd: apiItem ? round2(subItem.monthlySpendUsd + apiItem.monthlySpendUsd - subItem.monthlySpendUsd) : 0,
          reason: `You're paying for both ${pair.sub} subscription and ${pair.api} access. Evaluate if one channel covers your needs — using both often means unused quota on one side.`,
        });
      }
    }
  }

  return redundancies;
}

function findUseCaseObservations(input: SpendFormInput): AuditFinding[] {
  const { primaryUseCase, items } = input;
  const observations: AuditFinding[] = [];

  const codingTools = new Set<ToolId>(["cursor", "github_copilot", "claude"]);
  const writingTools = new Set<ToolId>(["claude", "chatgpt"]);

  if (primaryUseCase === "coding") {
    const hasCodingTool = items.some((i) => codingTools.has(i.toolId));
    if (!hasCodingTool && items.length > 0) {
      observations.push({
        toolId: items[0].toolId,
        current: items[0],
        recommendation: {
          kind: "keep",
          toolId: items[0].toolId,
          planId: items[0].planId,
          estimatedMonthlyUsd: items[0].monthlySpendUsd,
        },
        monthlySavingsUsd: 0,
        reason: "Your primary use case is coding, but your current stack may lack a purpose-built coding assistant like Cursor or GitHub Copilot — these often pay for themselves in productivity gains.",
      });
    }
  }

  if (primaryUseCase === "writing") {
    const hasWritingTool = items.some((i) => writingTools.has(i.toolId));
    if (!hasWritingTool && items.length > 0) {
      observations.push({
        toolId: items[0].toolId,
        current: items[0],
        recommendation: {
          kind: "keep",
          toolId: items[0].toolId,
          planId: items[0].planId,
          estimatedMonthlyUsd: items[0].monthlySpendUsd,
        },
        monthlySavingsUsd: 0,
        reason: "Your primary use case is writing, and Claude or ChatGPT are strong options for long-form content and editing.",
      });
    }
  }

  return observations;
}

function findCredexOpportunities(input: SpendFormInput, findings: AuditFinding[]): AuditOpportunity[] {
  const opportunities: AuditOpportunity[] = [];
  const totalMonthlySpend = sum(input.items.filter((i) => CREDEX_ELIGIBLE_TOOLS.includes(i.toolId)).map((i) => i.monthlySpendUsd));

  if (totalMonthlySpend > 0) {
    opportunities.push({
      kind: "credex_credits",
      description: `You're spending ~$${round2(totalMonthlySpend)}/mo on tools where Credex offers discounted credits (Cursor, Claude, ChatGPT, GitHub Copilot). Explore whether credits can lower your effective rate.`,
      relevantToolIds: CREDEX_ELIGIBLE_TOOLS.filter((t) => input.items.some((i) => i.toolId === t)),
    });
  }

  return opportunities;
}

export function runAudit(input: SpendFormInput): AuditResult {
  const findings = input.items.map((item) => applyDeterministicRules(item, input));
  const redundancies = findApiSubRedundancies(input);
  const observations = findUseCaseObservations(input);
  const allFindings = [...findings, ...redundancies, ...observations];
  const totals = calculateTotals(allFindings);
  const opportunities = findCredexOpportunities(input, allFindings);

  return {
    input,
    findings: allFindings,
    opportunities,
    totals,
    credexCtaTier: classifyCredexCtaTier(totals),
  };
}
