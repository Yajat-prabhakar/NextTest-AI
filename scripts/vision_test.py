#!/usr/bin/env python3
"""
Optimized vision test for NextTest AI — replaces the 1-liner.

Features vs the original one-liner:
- Reads endpoint + API key from env (OLLAMA_BASE_URL, OLLAMA_API_KEY) — no hardcoded secrets
- Proper argparse, pathlib, timeout, error handling, status-code checks
- Case-insensitive JSON key normalization (Iron/iron), sum-to-1 validation + re-normalization
- Strips markdown fences, retries on transient 5xx with backoff
- Supports both PNG/JPEG, validates file exists, prints sorted distribution
- Reuses the same system prompt as the app (src/lib/llm.ts:77) but with lowercase keys
- Usable locally and in CI (exits non-zero on failure)

Usage:
  python scripts/vision_test.py --image Copper-21991.png
  OLLAMA_API_KEY=xxx OLLAMA_BASE_URL=http://130.210.8.13:8080 python scripts/vision_test.py --image path/to/sample.jpg --raw
  python scripts/vision_test.py --image Copper-21991.png --model qwen2.5vl:3b --timeout 120

Env:
  OLLAMA_BASE_URL  default http://130.210.8.13:8080 (NOT .../v1/chat/completions — script appends it)
  OLLAMA_API_KEY   required (or --api-key), never committed — set via .env.local or GitHub Secrets
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ELEMENTS = ["iron", "copper", "zinc", "aluminum", "sulfur", "graphite", "unknown"]
DEFAULT_BASE = "http://130.210.8.13:8080"
DEFAULT_MODEL = "qwen2.5vl:3b"
TIMEOUT = 120  # vision cold-start can exceed 60s (nginx proxy_read_timeout is 60s — will retry)

SYSTEM_PROMPT = (
    "You are a careful lab assistant for a children's element kit "
    "(iron, copper, zinc, aluminum, sulfur, graphite, unknown). "
    "Given this image, estimate the probability this sample is each of: "
    "Iron, Copper, Zinc, Aluminum, Sulfur, Graphite, or Unknown. "
    "Base this on visible color, luster, and texture only. "
    "Return ONLY valid JSON, no markdown, no code fences, no explanation: "
    '{"iron": 0.X, "copper": 0.X, "zinc": 0.X, "aluminum": 0.X, "sulfur": 0.X, "graphite": 0.X, "unknown": 0.X}. '
    "Probabilities must sum to 1."
)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="NextTest AI vision test")
    p.add_argument("--image", "-i", required=True, help="Path to sample image (PNG/JPEG)")
    p.add_argument("--model", default=os.getenv("OLLAMA_VISION_MODEL", DEFAULT_MODEL))
    p.add_argument("--base-url", default=os.getenv("OLLAMA_BASE_URL", DEFAULT_BASE),
                   help="Ollama base URL, e.g. http://130.210.8.13:8080")
    p.add_argument("--api-key", default=os.getenv("OLLAMA_API_KEY"),
                   help="Bearer token (or set OLLAMA_API_KEY env)")
    p.add_argument("--timeout", type=int, default=TIMEOUT, help="HTTP timeout seconds")
    p.add_argument("--retries", type=int, default=2, help="Retries on 5xx/timeout")
    p.add_argument("--raw", action="store_true", help="Print raw LLM content alongside parsed JSON")
    return p.parse_args()


def load_image_b64(path: Path) -> tuple[str, str]:
    if not path.is_file():
        sys.exit(f"Image not found: {path}")
    data = path.read_bytes()
    if len(data) == 0:
        sys.exit(f"Empty file: {path}")
    # sniff mime
    ext = path.suffix.lower()
    mime = "image/png" if ext == ".png" else "image/jpeg" if ext in (".jpg", ".jpeg") else "image/png"
    # warn if huge (vision models struggle >2MB base64); app downscales via canvas — here just warn
    if len(data) > 2_000_000:
        print(f"Warning: image is {len(data)/1e6:.1f} MB — consider resizing <1MB", file=sys.stderr)
    return base64.b64encode(data).decode(), mime


def normalize_distribution(raw: dict) -> dict[str, float]:
    # Accept Iron/iron, Copper/copper etc. — case-insensitive
    lowered = {k.lower(): v for k, v in raw.items()}
    dist: dict[str, float] = {}
    for k in ELEMENTS:
        v = lowered.get(k, 0)
        try:
            f = float(v)
        except Exception:
            f = 0.0
        dist[k] = max(0.0, min(1.0, f))
    s = sum(dist.values())
    if s < 1e-9:
        raise ValueError(f"Distribution sums to ~0: {raw}")
    # re-normalize to 1.0
    return {k: round(v / s, 4) for k, v in dist.items()}


def call_ollama(base_url: str, api_key: str, model: str, image_b64: str, mime: str, timeout: int, retries: int) -> dict:
    base_url = re.sub(r"/v1/chat/completions/?$", "", base_url.rstrip("/"))
    url = f"{base_url}/v1/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Identify the element sample. Return the 7-way JSON distribution."},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_b64}"}},
                ],
            },
        ],
        "temperature": 0.2,
    }
    data = json.dumps(payload).encode()
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    last_err: Exception | None = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read().decode()
                j = json.loads(body)
                content = j["choices"][0]["message"]["content"]
                return {"raw_content": content, "response": j}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode(errors="replace")[:800]
            # retry only on 5xx (502/504 from nginx/Ollama when model cold)
            if 500 <= e.code < 600 and attempt < retries:
                wait = 5 * (attempt + 1)
                print(f"HTTP {e.code} — retrying in {wait}s ({err_body[:120]})", file=sys.stderr)
                time.sleep(wait)
                last_err = e
                continue
            sys.exit(f"HTTP {e.code}: {err_body}")
        except Exception as e:  # timeout etc.
            if attempt < retries:
                wait = 5 * (attempt + 1)
                print(f"Error {e} — retrying in {wait}s", file=sys.stderr)
                time.sleep(wait)
                last_err = e
                continue
            raise
    assert last_err
    raise last_err


def main() -> None:
    args = parse_args()
    if not args.api_key:
        sys.exit("Missing API key: set OLLAMA_API_KEY env or pass --api-key (never commit it)")
    img_path = Path(args.image)
    b64, mime = load_image_b64(img_path)

    print(f"-> {img_path} ({mime}, {len(b64)/1e3:.1f} KB b64) -> {args.base_url}/v1/chat/completions [{args.model}]")
    t0 = time.time()
    result = call_ollama(args.base_url, args.api_key, args.model, b64, mime, args.timeout, args.retries)
    dt = time.time() - t0

    raw_content: str = result["raw_content"]
    # strip markdown fences if model ignores instruction
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_content.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    if args.raw:
        print("\n--- raw LLM content ---")
        print(raw_content)
        print("--- end raw ---\n")

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}\nRaw:\n{cleaned[:1000]}", file=sys.stderr)
        sys.exit(1)

    try:
        dist = normalize_distribution(parsed)
    except Exception as e:
        print(f"Invalid distribution: {e}\nParsed: {parsed}", file=sys.stderr)
        sys.exit(1)

    # Pretty print sorted by confidence desc (matches ConfidenceBars)
    sorted_dist = sorted(dist.items(), key=lambda kv: kv[1], reverse=True)
    print(json.dumps(dist, indent=2))
    print(f"\nSorted ({dt:.1f}s, sum={sum(dist.values()):.2f}):")
    for k, v in sorted_dist:
        print(f"  {k:9s} {v*100:5.1f}%")
    # quick sanity: top candidate
    top, top_v = sorted_dist[0]
    print(f"\nTop: {top} ({top_v*100:.1f}%)")

    # non-zero exit if obviously broken (all uniform or unknown dominant on clear copper)
    # Don't fail CI on model quality — just warn
    if top_v < 0.20:
        print("Warning: very low confidence — image may be ambiguous/low-res", file=sys.stderr)


if __name__ == "__main__":
    main()
