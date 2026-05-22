import { describe, expect, it, vi } from "vitest";

import { runAudit } from "@/services/audit";
import { fetchAiSummary } from "@/services/aiSummary";
import type { SpendFormInput } from "@/types";

function baseInput(overrides: Partial<SpendFormInput> = {}): SpendFormInput {
  return {
    currency: "USD",
    teamSize: 2,
    primaryUseCase: "coding",
    items: [],
    ...overrides,
  };
}

describe("fetchAiSummary", () => {
  it("returns error when API is unavailable (network failure)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const input = baseInput({
      items: [
        {
          toolId: "claude",
          planId: "pro",
          monthlySpendUsd: 20,
          seats: 1,
        },
      ],
    });
    const result = runAudit(input);
    const response = await fetchAiSummary(result);

    expect(response.ok).toBe(false);
  });

  it("builds a valid payload with all required fields", async () => {
    let capturedBody: unknown = null;
    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      capturedBody = JSON.parse(opts.body as string);
      return {
        ok: true,
        json: async () => ({ summary: "Sample AI summary." }),
      };
    });

    const input = baseInput({
      teamSize: 5,
      primaryUseCase: "writing",
      items: [
        {
          toolId: "claude",
          planId: "team",
          monthlySpendUsd: 125,
          seats: 5,
        },
      ],
    });
    const result = runAudit(input);
    const response = await fetchAiSummary(result);

    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.summary).toBe("Sample AI summary.");
    }

    const body = capturedBody as Record<string, unknown>;
    expect(body.teamSize).toBe(5);
    expect(body.useCase).toBe("writing");
    expect(body.tools).toHaveLength(1);
    expect(body.findings).toBeDefined();
    expect(body.totals).toBeDefined();
  });

  it("returns error when API returns non-ok status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: "Service unavailable" }),
    });

    const input = baseInput({
      items: [
        {
          toolId: "cursor",
          planId: "pro",
          monthlySpendUsd: 20,
          seats: 1,
        },
      ],
    });
    const result = runAudit(input);
    const response = await fetchAiSummary(result);

    expect(response.ok).toBe(false);
  });
});
