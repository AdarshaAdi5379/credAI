import type { ToolId } from "@/types";

export type PriceTable = Record<string, number>;

export const PRICING_USD: Record<ToolId, PriceTable> = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    // Enterprise is custom/variable; not safe to price here.
  },
  github_copilot: {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    // Max is usage-based on claude.ai; it is a flat monthly subscription for an individual.
    max_5x: 100,
    max_20x: 200,
    team_standard: 25,
    team_premium: 125,
  },
  chatgpt: {
    plus: 20,
    team: 30,
  },
  anthropic_api: {
    api: 0,
  },
  openai_api: {
    api: 0,
  },
  gemini: {
    pro: 19.99,
    // Ultra is region-dependent; omit a constant.
  },
  gemini_api: {
    api: 0,
  },
  v0: {
    premium: 20,
  },
};

export function getPlanUnitPriceUsd(toolId: ToolId, planId: string): number | null {
  const maybe = PRICING_USD[toolId]?.[planId];
  return typeof maybe === "number" ? maybe : null;
}
