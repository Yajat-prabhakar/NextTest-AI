import { NextResponse } from "next/server";
import { getServerConfig, getClientSafeConfig } from "@/lib/config";

export async function GET() {
  const cfg = getServerConfig();
  return NextResponse.json(getClientSafeConfig(cfg));
}
