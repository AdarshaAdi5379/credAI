import type { AuditResult, LeadCaptureInput, PublicAuditView, StoredLead } from "@/types";
import { toPublicAuditView } from "@/services/publicAudit";

interface AuditRecord {
  result: AuditResult;
  lead: LeadCaptureInput | null;
  createdAt: string;
}

const store = new Map<string, AuditRecord>();

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `audit_${ts}${rand}`;
}

export function saveAudit(result: AuditResult): string {
  const id = generateId();
  store.set(id, {
    result,
    lead: null,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export function attachLead(auditId: string, lead: LeadCaptureInput): StoredLead | null {
  const record = store.get(auditId);
  if (!record) return null;

  record.lead = lead;

  return {
    ...lead,
    createdAt: record.createdAt,
    auditId,
  };
}

export function getPublicAudit(auditId: string): PublicAuditView | null {
  const record = store.get(auditId);
  if (!record) return null;

  return toPublicAuditView({ auditId, createdAt: record.createdAt }, record.result);
}

export function getAuditResult(auditId: string): AuditResult | null {
  return store.get(auditId)?.result ?? null;
}
