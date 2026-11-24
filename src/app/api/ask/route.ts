import { NextResponse, type NextRequest } from "next/server";
import { handleAsk } from "../../../lib/handleAsk.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ type: "error", message: "Invalid request." }, { status: 400 });
  }
  const question = (body as { question?: unknown })?.question;
  // Note: questions are not logged anywhere, on purpose.
  const { status, body: result } = await handleAsk(question, clientIp(req));
  return NextResponse.json(result, { status, headers: { "Cache-Control": "no-store" } });
}
