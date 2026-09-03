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
  // Local Ollama listens on port 11434. A compatible remote endpoint can still
  // be selected explicitly with OLLAMA_BASE_URL.
  const rawBase =
    process.env.OLLAMA_BASE_URL?.replace(/\/+$/, "") ?? "http://127.0.0.1:11434";
  const baseUrl = rawBase
    .replace(/\/v1\/chat\/completions\/?$/i, "")
    .replace(/\/+$/, "");
  return {
    ollamaBaseUrl: baseUrl,
    ollamaApiKey: process.env.OLLAMA_API_KEY ?? "",
    visionModel: process.env.OLLAMA_VISION_MODEL ?? "Qwen3-VL:latest",
    textModel: process.env.OLLAMA_TEXT_MODEL ?? "Qwen3-VL:latest",
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
