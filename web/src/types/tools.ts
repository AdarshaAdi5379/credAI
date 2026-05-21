export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "gemini_api"
  | "v0";

export type UseCaseId = "coding" | "writing" | "data" | "research" | "mixed";

export type CursorPlanId = "hobby" | "pro" | "business" | "enterprise";
export type GitHubCopilotPlanId = "individual" | "business" | "enterprise";
export type ClaudePlanId = "free" | "pro" | "max" | "team" | "enterprise" | "api";
export type ChatGPTPlanId = "plus" | "team" | "enterprise" | "api";
export type GeminiPlanId = "pro" | "ultra" | "api";
export type V0PlanId = "premium" | "enterprise";

export type ToolPlanId =
  | CursorPlanId
  | GitHubCopilotPlanId
  | ClaudePlanId
  | ChatGPTPlanId
  | GeminiPlanId
  | V0PlanId
  | "api";

export type ToolPlanOption<TToolId extends ToolId = ToolId> = {
  toolId: TToolId;
  planId: string;
  label: string;
};

export const TOOL_LABELS: Record<ToolId, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API (direct)",
  openai_api: "OpenAI API (direct)",
  gemini: "Gemini",
  gemini_api: "Gemini API (direct)",
  v0: "v0",
};

export const TOOL_PLAN_LABELS: Record<ToolId, Record<string, string>> = {
  cursor: {
    hobby: "Hobby",
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
  },
  github_copilot: {
    individual: "Individual",
    business: "Business",
    enterprise: "Enterprise",
  },
  claude: {
    free: "Free",
    pro: "Pro",
    max: "Max",
    team: "Team",
    enterprise: "Enterprise",
    api: "API direct",
  },
  chatgpt: {
    plus: "Plus",
    team: "Team",
    enterprise: "Enterprise",
    api: "API direct",
  },
  anthropic_api: { api: "API direct" },
  openai_api: { api: "API direct" },
  gemini: {
    pro: "Pro",
    ultra: "Ultra",
    api: "API",
  },
  gemini_api: { api: "API direct" },
  v0: {
    premium: "Premium",
    enterprise: "Enterprise",
  },
};

export function getToolLabel(toolId: ToolId): string {
  return TOOL_LABELS[toolId];
}

export function getToolPlanLabel(toolId: ToolId, planId: string): string {
  return TOOL_PLAN_LABELS[toolId]?.[planId] ?? planId;
}
