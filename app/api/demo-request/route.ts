import { NextRequest, NextResponse } from "next/server";
import { DemoRequest, validateDemoRequest } from "./validation";
import { checkRateLimit } from "./rateLimit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;
const DEFAULT_RECIPIENT = "vanshbadkul@gmail.com";
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendToWebhook(request: DemoRequest): Promise<boolean> {
  const endpoint = process.env.DEMO_REQUEST_WEBHOOK_URL;
  if (!endpoint) return false;

  let url: URL;
  try { url = new URL(endpoint); } catch { throw new Error("Invalid demo webhook URL"); }
  if (url.protocol !== "https:") throw new Error("Demo webhook must use HTTPS");

  const secret = process.env.DEMO_REQUEST_WEBHOOK_SECRET;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(secret ? { authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify({ ...request, source: "termi-web", submittedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Demo webhook returned ${response.status}`);
  return true;
}

async function sendWithResend(request: DemoRequest): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const recipient = process.env.DEMO_REQUEST_RECIPIENT || DEFAULT_RECIPIENT;
  const from = process.env.DEMO_REQUEST_FROM || "Termi demos <onboarding@resend.dev>";
  const phone = request.phone || "Not provided";
  const details = request.details || "No additional details";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: request.email,
      subject: `Enterprise demo request from ${request.email}`,
      text: `Email: ${request.email}\nPhone: ${phone}\n\nDetails:\n${details}`,
      html: `<h2>New Termi enterprise demo request</h2><p><strong>Email:</strong> ${escapeHtml(request.email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p><p><strong>Details:</strong></p><p>${escapeHtml(details).replaceAll("\n", "<br>")}</p>`,
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Resend returned ${response.status}`);
  return true;
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

  try {
    const delivered = await sendToWebhook(validation.value) || await sendWithResend(validation.value);
    if (!delivered) {
      return NextResponse.json({
        error: "Online booking is being configured. Continue by email.",
        emailFallback: true,
      }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({
      error: "We couldn't send your request. Continue by email.",
      emailFallback: true,
    }, { status: 502 });
  }
}
