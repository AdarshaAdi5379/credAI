import { NextResponse } from "next/server";

import { leadCaptureInputSchema } from "@/lib/validation";
import { attachLead, saveAudit } from "@/services/storage";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const auditId = typeof body.auditId === "string" ? body.auditId : undefined;
  const result = typeof body.auditResult === "object" && body.auditResult != null ? body.auditResult : undefined;

  if (!auditId || !result) {
    return NextResponse.json({ error: "Missing auditId or auditResult" }, { status: 400 });
  }

  const parseResult = leadCaptureInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Validation failed", issues: parseResult.error.issues }, { status: 422 });
  }

  const stored = attachLead(auditId, parseResult.data);
  if (!stored) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, auditId });
}

export async function GET() {
  const id = saveAudit({} as never);
  return NextResponse.json({ auditId: id });
}
