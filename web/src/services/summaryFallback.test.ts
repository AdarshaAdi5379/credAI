import { describe, expect, it } from "vitest";

import { runAudit } from "@/services/audit";
import { buildFallbackSummary } from "@/services/summaryFallback";
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

describe("buildFallbackSummary", () => {
  it("mentions savings when savings exist", () => {
    const input = baseInput({
      items: [
        {
          toolId: "claude",
          planId: "team",
          monthlySpendUsd: 50,
          seats: 2,
        },
      ],
    });

    const result = runAudit(input);
    const summary = buildFallbackSummary(result);

    expect(summary.length).toBeGreaterThan(40);
    expect(summary.toLowerCase()).toContain("save");
    expect(summary).toContain("/mo");
  });

  it("says the stack looks efficient when savings are $0", () => {
    const input = baseInput({
      teamSize: 5,
      items: [
        {
          toolId: "github_copilot",
          planId: "business",
          monthlySpendUsd: 95,
          seats: 5,
        },
      ],
    });

    const result = runAudit(input);
    const summary = buildFallbackSummary(result);

    expect(result.totals.monthlySavingsUsd).toBe(0);
    expect(summary.toLowerCase()).toContain("looks efficient");
  });
});

