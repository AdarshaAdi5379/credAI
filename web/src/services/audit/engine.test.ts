import { describe, expect, it } from "vitest";

import type { SpendFormInput } from "@/types";
import { runAudit } from "@/services/audit";

function baseInput(overrides: Partial<SpendFormInput> = {}): SpendFormInput {
  return {
    currency: "USD",
    teamSize: 2,
    primaryUseCase: "coding",
    items: [],
    ...overrides,
  };
}

describe("runAudit", () => {
  it("downgrades Claude Team to Pro for 2 seats when cheaper", () => {
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

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.recommendation.kind).toBe("downgrade_same_vendor");
    expect(result.findings[0]?.recommendation.toolId).toBe("claude");
    expect(result.findings[0]?.recommendation.planId).toBe("pro");
    expect(result.totals.monthlySavingsUsd).toBe(10);
  });

  it("returns no savings for an already optimal stack", () => {
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
    expect(result.totals.monthlySavingsUsd).toBe(0);
    expect(result.credexCtaTier).toBe("none");
    expect(result.findings[0]?.recommendation.kind).toBe("keep");
  });

  it("sets a prominent Credex CTA tier when savings exceed $500/mo", () => {
    const input = baseInput({
      teamSize: 2,
      items: [
        {
          toolId: "cursor",
          planId: "business",
          monthlySpendUsd: 3000,
          seats: 2,
        },
      ],
    });

    const result = runAudit(input);
    expect(result.totals.monthlySavingsUsd).toBeGreaterThan(500);
    expect(result.credexCtaTier).toBe("prominent");
  });
});
