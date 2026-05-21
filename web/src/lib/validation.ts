import { z } from "zod";

import type { ToolId, UseCaseId } from "@/types";

const toolIdSchema: z.ZodType<ToolId> = z.enum([
  "cursor",
  "github_copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "gemini_api",
  "v0",
]);

const useCaseSchema: z.ZodType<UseCaseId> = z.enum([
  "coding",
  "writing",
  "data",
  "research",
  "mixed",
]);

export const spendLineItemInputSchema = z.object({
  toolId: toolIdSchema,
  planId: z.string().min(1),
  monthlySpendUsd: z.number().finite().min(0).max(1_000_000),
  seats: z.number().int().min(1).max(10_000),
});

export const spendFormInputSchema = z.object({
  currency: z.literal("USD"),
  teamSize: z.number().int().min(1).max(10_000),
  primaryUseCase: useCaseSchema,
  items: z.array(spendLineItemInputSchema).min(1).max(50),
});

export const leadCaptureInputSchema = z.object({
  email: z.string().email().max(254),
  companyName: z.string().trim().min(1).max(200).optional(),
  role: z.string().trim().min(1).max(200).optional(),
  teamSize: z.number().int().min(1).max(10_000),
});

export function parseSpendFormInput(input: unknown) {
  return spendFormInputSchema.parse(input);
}

export function parseLeadCaptureInput(input: unknown) {
  return leadCaptureInputSchema.parse(input);
}
