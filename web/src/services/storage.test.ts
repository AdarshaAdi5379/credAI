import { describe, expect, it } from "vitest";

import { runAudit } from "@/services/audit";
import { saveAudit, getPublicAudit, attachLead } from "@/services/storage";
import type { SpendFormInput } from "@/types";

function baseInput(overrides: Partial<SpendFormInput> = {}): SpendFormInput {
  return {
    currency: "USD",
    teamSize: 3,
    primaryUseCase: "coding",
    items: [],
    ...overrides,
  };
}

describe("storage", () => {
  it("saves and retrieves a public audit", () => {
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
    const id = saveAudit(result);

    expect(id).toContain("audit_");

    const pub = getPublicAudit(id);
    expect(pub).not.toBeNull();
    expect(pub!.auditId).toBe(id);
    expect(pub!.teamSize).toBe(3);
    expect(pub!.totals.monthlySavingsUsd).toBeGreaterThan(0);
  });

  it("returns null for non-existent audit", () => {
    expect(getPublicAudit("nonexistent")).toBeNull();
  });

  it("attaches lead data to an existing audit", () => {
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
    const id = saveAudit(result);

    const stored = attachLead(id, {
      email: "test@example.com",
      companyName: "TestCo",
      role: "CTO",
      teamSize: 3,
    });

    expect(stored).not.toBeNull();
    expect(stored!.auditId).toBe(id);
    expect(stored!.email).toBe("test@example.com");
  });

  it("returns null when attaching lead to non-existent audit", () => {
    const stored = attachLead("nonexistent", {
      email: "test@example.com",
      teamSize: 2,
    });
    expect(stored).toBeNull();
  });

  it("strips PII from public audit view", () => {
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
    const id = saveAudit(result);

    attachLead(id, {
      email: "private@example.com",
      companyName: "Secret Inc",
      role: "Founder",
      teamSize: 3,
    });

    const pub = getPublicAudit(id);
    expect(pub).not.toBeNull();
    expect("email" in (pub as unknown as Record<string, unknown>)).toBe(false);
    expect("companyName" in (pub as unknown as Record<string, unknown>)).toBe(false);
    expect("role" in (pub as unknown as Record<string, unknown>)).toBe(false);
  });
});
