import type { AuditResult, PublicAuditView } from "@/types";

export type PublicAuditMeta = {
  auditId: string;
  createdAt: string;
};

export function toPublicAuditView(meta: PublicAuditMeta, result: AuditResult): PublicAuditView {
  return {
    auditId: meta.auditId,
    createdAt: meta.createdAt,
    teamSize: result.input.teamSize,
    primaryUseCase: result.input.primaryUseCase,
    items: result.input.items.map((item) => ({
      toolId: item.toolId,
      planId: item.planId,
      monthlySpendUsd: item.monthlySpendUsd,
      seats: item.seats,
    })),
    findings: result.findings.map((finding) => ({
      toolId: finding.toolId,
      recommendationToolId: finding.recommendation.toolId,
      recommendationPlanId: finding.recommendation.planId,
      monthlySavingsUsd: finding.monthlySavingsUsd,
      reason: finding.reason,
    })),
    totals: {
      monthlySavingsUsd: result.totals.monthlySavingsUsd,
      annualSavingsUsd: result.totals.annualSavingsUsd,
    },
  };
}

