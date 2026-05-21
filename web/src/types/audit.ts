import type { SpendFormInput, SpendLineItemInput } from "./spend";
import type { ToolId } from "./tools";

export type AuditRecommendationKind =
  | "keep"
  | "downgrade_same_vendor"
  | "switch_tool"
  | "switch_to_api"
  | "use_credits"
  | "unknown";

export type AuditFinding = {
  toolId: ToolId;
  current: SpendLineItemInput;
  recommendation: {
    kind: AuditRecommendationKind;
    toolId: ToolId;
    planId: string;
    estimatedMonthlyUsd: number;
  };
  monthlySavingsUsd: number;
  reason: string;
};

export type AuditTotals = {
  currentMonthlyUsd: number;
  recommendedMonthlyUsd: number;
  monthlySavingsUsd: number;
  annualSavingsUsd: number;
};

export type CredexCtaTier = "none" | "soft" | "prominent";

export type AuditResult = {
  input: SpendFormInput;
  findings: AuditFinding[];
  totals: AuditTotals;
  credexCtaTier: CredexCtaTier;
};
