"use client";

import { useState } from "react";

import { AuditResults } from "@/components/AuditResults";
import { Button } from "@/components/Button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { parseSpendFormInput } from "@/lib/validation";
import { runAudit } from "@/services/audit";
import { saveAudit } from "@/services/storage";
import type { AuditResult, SpendFormInput, ToolId, UseCaseId } from "@/types";
import { TOOL_LABELS, TOOL_PLAN_LABELS } from "@/types/tools";

const STORAGE_KEY = "credex.ai_spend_audit.v1";

function makeEmptyInput(): SpendFormInput {
  return {
    currency: "USD",
    teamSize: 2,
    primaryUseCase: "coding",
    items: [
      {
        toolId: "cursor",
        planId: "pro",
        monthlySpendUsd: 20,
        seats: 1,
      },
    ],
  };
}

type FormError = { path: string; message: string };

function toolOptions(): Array<{ value: ToolId; label: string }> {
  return (Object.keys(TOOL_LABELS) as ToolId[]).map((toolId) => ({
    value: toolId,
    label: TOOL_LABELS[toolId],
  }));
}

function planOptions(toolId: ToolId): Array<{ value: string; label: string }> {
  const table = TOOL_PLAN_LABELS[toolId] ?? {};
  return Object.keys(table).map((planId) => ({ value: planId, label: table[planId] ?? planId }));
}

function getUseCaseOptions(): Array<{ value: UseCaseId; label: string }> {
  return [
    { value: "coding", label: "Coding" },
    { value: "writing", label: "Writing" },
    { value: "data", label: "Data" },
    { value: "research", label: "Research" },
    { value: "mixed", label: "Mixed" },
  ];
}

export function SpendAuditForm() {
  const persisted = useLocalStorageState<SpendFormInput>(STORAGE_KEY, makeEmptyInput());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormError[]>([]);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);

  const input = persisted.value;
  const setInput = persisted.setValue;

  const toolOpts = toolOptions();
  const useCaseOpts = getUseCaseOptions();

  function updateItem(index: number, patch: Partial<SpendFormInput["items"][number]>) {
    setInput({
      ...input,
      items: input.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    });
  }

  function addItem() {
    if (input.items.length >= 50) return;
    setInput({
      ...input,
      items: [
        ...input.items,
        { toolId: "github_copilot", planId: "individual", monthlySpendUsd: 10, seats: 1 },
      ],
    });
  }

  function removeItem(index: number) {
    if (input.items.length <= 1) return;
    setInput({ ...input, items: input.items.filter((_, i) => i !== index) });
  }

  function onSubmit() {
    setSubmitError(null);
    setFieldErrors([]);

    try {
      const parsed = parseSpendFormInput(input);
      const audit = runAudit(parsed);
      const id = saveAudit(audit);
      setAuditId(id);
      setResult(audit);
    } catch (e) {
      setResult(null);
      const maybe = e as { issues?: Array<{ path: Array<string | number>; message: string }> };
      if (Array.isArray(maybe?.issues)) {
        setFieldErrors(
          maybe.issues.map((issue) => ({
            path: issue.path.map(String).join("."),
            message: issue.message,
          })),
        );
        return;
      }
      setSubmitError("Please double-check your inputs and try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Run your audit
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enter what you pay today. The audit math is deterministic; AI is only used for the optional
          summary.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Team size</span>
            <input
              inputMode="numeric"
              className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-300"
              value={input.teamSize}
              onChange={(e) => setInput({ ...input, teamSize: Number(e.target.value || 0) })}
            />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Primary use case
          </span>
          <select
            className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-300"
            value={input.primaryUseCase}
            onChange={(e) =>
              setInput({ ...input, primaryUseCase: e.target.value as SpendFormInput["primaryUseCase"] })
            }
          >
            {useCaseOpts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tools</h3>
          <Button type="button" variant="secondary" onClick={addItem}>
            Add tool
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[820px] table-auto border-separate border-spacing-0">
            <caption className="sr-only">Tools, plans, seats, and monthly spend</caption>
            <thead>
              <tr className="text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <th id="th-tool" className="py-2 pr-3">Tool</th>
                <th id="th-plan" className="py-2 pr-3">Plan</th>
                <th id="th-seats" className="py-2 pr-3">Seats</th>
                <th id="th-spend" className="py-2 pr-3">Monthly spend (USD)</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {input.items.map((item, idx) => {
                const plans = planOptions(item.toolId);
                const effectivePlanId = plans.some((p) => p.value === item.planId)
                  ? item.planId
                  : plans[0]?.value ?? item.planId;

                return (
                  <tr key={idx} className="border-t border-zinc-100 dark:border-zinc-900">
                    <td className="py-2 pr-3">
                      <select
                        aria-labelledby="th-tool"
                        className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-300"
                        value={item.toolId}
                        onChange={(e) =>
                          updateItem(idx, {
                            toolId: e.target.value as ToolId,
                            planId: (Object.keys(TOOL_PLAN_LABELS[e.target.value as ToolId] ?? {})[0] ?? Object.keys(TOOL_PLAN_LABELS.cursor ?? {})[0] ?? "pro"),
                          })
                        }
                      >
                        {toolOpts.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        aria-labelledby="th-plan"
                        className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-300"
                        value={effectivePlanId}
                        onChange={(e) => updateItem(idx, { planId: e.target.value })}
                      >
                        {plans.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        aria-labelledby="th-seats"
                        inputMode="numeric"
                        className="h-11 w-28 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-300"
                        value={item.seats}
                        onChange={(e) => updateItem(idx, { seats: Number(e.target.value || 0) })}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        aria-labelledby="th-spend"
                        inputMode="decimal"
                        className="h-11 w-40 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-300"
                        value={item.monthlySpendUsd}
                        onChange={(e) => updateItem(idx, { monthlySpendUsd: Number(e.target.value || 0) })}
                      />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeItem(idx)}
                        disabled={input.items.length <= 1}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {fieldErrors.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
            <div className="font-medium">Fix these inputs:</div>
            <ul className="mt-1 list-disc pl-5">
              {fieldErrors.slice(0, 6).map((e, i) => (
                <li key={i}>
                  <span className="font-mono text-xs">{e.path}</span>: {e.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">
            {submitError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Saved locally in your browser{persisted.hydrated ? "" : " (loading…)"}.
          </div>
          <Button type="button" onClick={onSubmit}>
            Generate audit
          </Button>
        </div>
      </div>

      {result && auditId ? (
        <AuditResults result={result} auditId={auditId} onReset={() => { setResult(null); setAuditId(null); }} />
      ) : null}
    </div>
  );
}

