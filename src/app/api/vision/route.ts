import { NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";
import { classifyWithVisionLLM } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
  }

  const cfg = getServerConfig();
  if (!cfg.ollamaBaseUrl) {
    return NextResponse.json(
      { error: "OLLAMA_BASE_URL not configured on server" },
      { status: 503 }
    );
  }

  try {
    const result = await classifyWithVisionLLM({
      baseUrl: cfg.ollamaBaseUrl,
      apiKey: cfg.ollamaApiKey,
      model: cfg.visionModel,
      imageBase64,
      mimeType,
    });
    return NextResponse.json({
      distribution: result.distribution,
      raw: result.rawJson,
      model: cfg.visionModel,
      note: "AI's first impression — zero-shot vision LLM, NOT a trained classifier",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
