import { describe, expect, it } from "vitest";

import { runAudit } from "@/services/audit";
import { toPublicAuditView } from "@/services/publicAudit";
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

describe("toPublicAuditView", () => {
  it("does not include lead PII fields (email/company/role)", () => {
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
    const pub = toPublicAuditView({ auditId: "a_123", createdAt: "2026-05-22T00:00:00.000Z" }, result);

    expect(pub.auditId).toBe("a_123");
    expect(pub.createdAt).toBe("2026-05-22T00:00:00.000Z");

    expect("email" in (pub as unknown as Record<string, unknown>)).toBe(false);
    expect("companyName" in (pub as unknown as Record<string, unknown>)).toBe(false);
    expect("role" in (pub as unknown as Record<string, unknown>)).toBe(false);
  });
});

