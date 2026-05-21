import type { ToolId, UseCaseId } from "./tools";

export type CurrencyCode = "USD";

export type SpendLineItemInput = {
  toolId: ToolId;
  planId: string;
  monthlySpendUsd: number;
  seats: number;
};

export type SpendFormInput = {
  currency: CurrencyCode;
  teamSize: number;
  primaryUseCase: UseCaseId;
  items: SpendLineItemInput[];
};
