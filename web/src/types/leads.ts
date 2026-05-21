export type LeadCaptureInput = {
  email: string;
  companyName?: string;
  role?: string;
  teamSize: number;
};

export type StoredLead = LeadCaptureInput & {
  createdAt: string;
  auditId: string;
};

export type PublicAuditView = {
  auditId: string;
  createdAt: string;
  teamSize: number;
  primaryUseCase: string;
  items: Array<{
    toolId: string;
    planId: string;
    monthlySpendUsd: number;
    seats: number;
  }>;
  findings: Array<{
    toolId: string;
    recommendationToolId: string;
    recommendationPlanId: string;
    monthlySavingsUsd: number;
    reason: string;
  }>;
  totals: {
    monthlySavingsUsd: number;
    annualSavingsUsd: number;
  };
};
