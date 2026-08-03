import { NextRequest, NextResponse } from "next/server";
import { validateDemoRequest } from "./validation";
import { checkRateLimit } from "./rateLimit";
import { insertDemoRequest } from "./persistence";
import { createAdminClient, isAdminConfigured } from "@/utils/supabase/admin";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1_000;
const MAX_RATE_KEYS = 1_000;
let rateState: Readonly<Record<string, readonly number[]>> = {};

function clientKey(request: NextRequest): string {
  const forwarded = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for") || "unknown"
    : "untrusted-network";
  return forwarded.split(",")[0].trim().slice(0, 80) || "unknown";
}

function consumeRateLimit(key: string, now: number) {
  const result = checkRateLimit(rateState[key] || [], now, RATE_LIMIT, RATE_WINDOW_MS);
  const cutoff = now - RATE_WINDOW_MS;
  const retainedEntries = Object.entries(rateState)
    .filter(([entryKey, timestamps]) => entryKey !== key && (timestamps[timestamps.length - 1] || 0) > cutoff)
    .slice(-(MAX_RATE_KEYS - 1));
  const retained = Object.fromEntries(retainedEntries);
  rateState = { ...retained, [key]: result.timestamps };
  return result;
}

export async function POST(httpRequest: NextRequest) {
  const rate = consumeRateLimit(clientKey(httpRequest), Date.now());
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many demo requests. Please try again shortly." },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } },
    );
  }

  const contentType = httpRequest.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Send this request as JSON." }, { status: 415 });
  }

  const contentLength = Number(httpRequest.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const rawBody = await httpRequest.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validation = validateDemoRequest(body);
  if (!validation.ok) {
    if (validation.spam) return NextResponse.json({ ok: true }, { status: 202 });
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Demo booking is temporarily unavailable." }, { status: 503 });
  }

  try {
    await insertDemoRequest(createAdminClient(), validation.value);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to persist demo request:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 503 });
  }
}
