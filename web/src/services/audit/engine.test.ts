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

  it("detects API + subscription redundancy for same vendor", () => {
    const input = baseInput({
      items: [
        {
          toolId: "claude",
          planId: "pro",
          monthlySpendUsd: 20,
          seats: 1,
        },
        {
          toolId: "anthropic_api",
          planId: "api",
          monthlySpendUsd: 50,
          seats: 1,
        },
      ],
    });

    const result = runAudit(input);
    const redundancy = result.findings.find((f) => f.recommendation.kind === "switch_tool");
    expect(redundancy).toBeDefined();
    expect(redundancy?.reason.toLowerCase()).toContain("both");
    expect(redundancy?.reason.toLowerCase()).toContain("claude");
  });

  it("adds use-case observation when coding is primary but no coding tool present", () => {
    const input = baseInput({
      primaryUseCase: "coding",
      items: [
        {
          toolId: "chatgpt",
          planId: "plus",
          monthlySpendUsd: 20,
          seats: 1,
        },
      ],
    });

    const result = runAudit(input);
    const observation = result.findings.find((f) => f.reason.toLowerCase().includes("coding assistant"));
    expect(observation).toBeDefined();
    expect(observation?.monthlySavingsUsd).toBe(0);
  });

  it("generates Credex credit opportunities for eligible tools", () => {
    const input = baseInput({
      items: [
        {
          toolId: "cursor",
          planId: "pro",
          monthlySpendUsd: 20,
          seats: 1,
        },
        {
          toolId: "claude",
          planId: "pro",
          monthlySpendUsd: 20,
          seats: 1,
        },
      ],
    });

    const result = runAudit(input);
    expect(result.opportunities.length).toBeGreaterThan(0);
    const creditOpp = result.opportunities.find((o) => o.kind === "credex_credits");
    expect(creditOpp).toBeDefined();
    expect(creditOpp?.description.toLowerCase()).toContain("credex");
    expect(creditOpp?.relevantToolIds).toContain("cursor");
    expect(creditOpp?.relevantToolIds).toContain("claude");
  });
});
