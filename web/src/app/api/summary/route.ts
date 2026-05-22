import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  let body: {
    teamSize: number;
    useCase: string;
    tools: Array<{ toolName: string; planName: string; seats: number; spend: number }>;
    findings: Array<{
      toolName: string;
      currentPlan: string;
      currentMonthly: number;
      recommendation: string;
      monthlySavings: number;
      reason: string;
    }>;
    totals: { currentMonthly: number; recommendedMonthly: number; monthlySavings: number; annualSavings: number };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teamSize, useCase, tools, findings, totals } = body;

  const toolsBlock = tools
    .map((t) => `- ${t.toolName} — plan: ${t.planName} — seats: ${t.seats} — spend: $${t.spend}`)
    .join("\n");

  const findingsBlock = findings
    .map(
      (f) =>
        `- Tool: ${f.toolName}\n  Current: ${f.currentPlan} ($${f.currentMonthly}/mo)\n  Recommendation: ${f.recommendation}\n  Monthly savings: $${f.monthlySavings}\n  Reason: ${f.reason}`,
    )
    .join("\n");

  const systemPrompt = [
    "You are an assistant helping a startup founder understand an \"AI Spend Audit\".",
    "You must only summarize the audit findings provided. Do not invent numbers, vendors, plans, or savings.",
    "If total savings is $0, clearly say the stack looks efficient and focus on good practices.",
    "Write a single paragraph between 80 and 120 words. Avoid buzzwords. Be specific.",
  ].join("\n");

  const userPrompt = [
    "Here are the audit inputs and results (all numbers are monthly USD):",
    "",
    `Team size: ${teamSize}`,
    `Primary use case: ${useCase}`,
    "",
    "Current stack:",
    toolsBlock,
    "",
    "Audit findings:",
    findingsBlock,
    "",
    "Totals:",
    `- Current monthly spend: $${totals.currentMonthly}`,
    `- Recommended monthly spend: $${totals.recommendedMonthly}`,
    `- Total monthly savings: $${totals.monthlySavings}`,
    `- Total annual savings: $${totals.annualSavings}`,
    "",
    "Now write the summary paragraph.",
  ].join("\n");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.error("Anthropic API error:", response.status, errorText);
      return NextResponse.json({ error: "LLM service unavailable" }, { status: 502 });
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const text = data.content?.find((c) => c.type === "text")?.text;
    if (!text) {
      return NextResponse.json({ error: "Empty LLM response" }, { status: 502 });
    }

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error("AI summary fetch error:", err);
    return NextResponse.json({ error: "LLM request failed" }, { status: 502 });
  }
}
