import { NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";
import { explainWithTextLLM } from "@/lib/llm";
import type { Distribution } from "@/lib/bayes";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  let body: {
    kind?: "why_experiment" | "what_result_means";
    currentDistribution?: Distribution;
    nextExperimentId?: string;
    nextExperimentName?: string;
    lastExperimentId?: string;
    lastExperimentName?: string;
    lastResultLabel?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.kind || !body.currentDistribution) {
    return NextResponse.json(
      { error: "Missing kind or currentDistribution" },
      { status: 400 }
    );
  }

  const cfg = getServerConfig();
  if (!cfg.ollamaBaseUrl) {
    // Graceful fallback — return a deterministic kid-friendly fallback without LLM
    const fallback =
      body.kind === "why_experiment"
        ? `Let's try the ${body.nextExperimentName ?? body.nextExperimentId} next — it will help us rule out the trickiest look-alikes!`
        : `Nice work on the ${body.lastExperimentName ?? body.lastExperimentId}! That clue helps us narrow down which materials are still possible.`;
    return NextResponse.json({ explanation: fallback, fallback: true });
  }

  try {
    const explanation = await explainWithTextLLM({
      baseUrl: cfg.ollamaBaseUrl,
      apiKey: cfg.ollamaApiKey,
      model: cfg.textModel,
      kind: body.kind,
      context: {
        currentDistribution: body.currentDistribution,
        nextExperimentId: body.nextExperimentId,
        nextExperimentName: body.nextExperimentName,
        lastExperimentId: body.lastExperimentId,
        lastExperimentName: body.lastExperimentName,
        lastResultLabel: body.lastResultLabel,
      },
    });
    return NextResponse.json({ explanation, fallback: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Return fallback instead of hard failing — explanations are non-critical
    return NextResponse.json({
      explanation:
        body.kind === "why_experiment"
          ? `Let's try the ${body.nextExperimentName ?? "next test"} — it gives us the biggest clue about what's left!`
          : `Great observation — that result helps us update our best guess!`,
      fallback: true,
      error: msg,
    });
  }
}
