import { DEFAULT_THRESHOLD } from "./constants";

export interface AppConfig {
  ollamaBaseUrl: string;
  ollamaApiKey: string;
  visionModel: string;
  textModel: string;
  confidenceThreshold: number;
}

function parseThreshold(raw: string | undefined): number {
  if (!raw) return DEFAULT_THRESHOLD;
  const v = Number.parseFloat(raw);
  if (Number.isNaN(v) || v <= 0 || v > 1) return DEFAULT_THRESHOLD;
  return v;
}

/** Server-side only — reads from process.env. Call inside route handlers / server components. */
export function getServerConfig(): AppConfig {
  // Allow OLLAMA_BASE_URL to be set as either "http://host:8080" or full ".../v1/chat/completions"
  const rawBase =
    process.env.OLLAMA_BASE_URL?.replace(/\/+$/, "") ?? "";
  const baseUrl = rawBase
    .replace(/\/v1\/chat\/completions\/?$/i, "")
    .replace(/\/+$/, "");
  return {
    ollamaBaseUrl: baseUrl,
    ollamaApiKey: process.env.OLLAMA_API_KEY ?? "",
    visionModel: process.env.OLLAMA_VISION_MODEL ?? "qwen2.5vl:3b",
    textModel: process.env.OLLAMA_TEXT_MODEL ?? "qwen2.5:3b",
    confidenceThreshold: parseThreshold(
      process.env.NEXTTEST_CONFIDENCE_THRESHOLD
    ),
  };
}

/** Shape returned to client — never includes the API key. */
export function getClientSafeConfig(c: AppConfig) {
  return {
    visionModel: c.visionModel,
    textModel: c.textModel,
    confidenceThreshold: c.confidenceThreshold,
    hasEndpoint: c.ollamaBaseUrl.length > 0,
  };
}
