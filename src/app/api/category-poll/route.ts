import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_POLL, isPollOption } from "@/lib/category-poll.mjs";
import { isPollPreview, readPoll, savePollVote } from "@/lib/category-poll-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = `recoscope_poll_${CATEGORY_POLL.id}`;
const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
const validToken = (value: string | undefined) => value && /^[a-f0-9-]{36}$/.test(value) ? value : null;
const hash = (token: string) => createHash("sha256").update(`${CATEGORY_POLL.id}:${token}`).digest("hex");

function unavailable() {
  return NextResponse.json({ error: "Voting is temporarily unavailable. Please try again later." }, { status: 503, headers });
}

export async function GET(req: NextRequest) {
  try {
    const token = validToken(req.cookies.get(COOKIE)?.value);
    return NextResponse.json({ pollId: CATEGORY_POLL.id, ...await readPoll(token ? hash(token) : null), preview: isPollPreview() }, { headers });
  } catch {
    console.error("[category-poll] unable to read votes");
    return unavailable();
  }
}

export async function POST(req: NextRequest) {
  // Next can normalize the internal URL to localhost; Host retains the visitor's host.
  const origin = req.headers.get("origin");
  let sameOrigin = false;
  try {
    const source = new URL(origin ?? "");
    sameOrigin = source.origin === origin && ["http:", "https:"].includes(source.protocol) && source.host === req.headers.get("host");
  } catch { /* A missing or malformed Origin cannot submit a vote. */ }
  if (!sameOrigin) {
    return NextResponse.json({ error: "Please vote from this website." }, { status: 403, headers });
  }
  if (!req.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415, headers });
  }
  if (Number(req.headers.get("content-length")) > 1024) {
    return NextResponse.json({ error: "Invalid request." }, { status: 413, headers });
  }
  let body;
  try {
    const text = await req.text();
    if (text.length > 1024) throw new Error("oversized request");
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers });
  }
  if (!body || body.pollId !== CATEGORY_POLL.id || !isPollOption(body.option)) {
    return NextResponse.json({ error: "Choose one of the listed categories." }, { status: 400, headers });
  }
  try {
    const token = validToken(req.cookies.get(COOKIE)?.value) ?? randomUUID();
    const result = await savePollVote(hash(token), body.option);
    const response = NextResponse.json({ pollId: CATEGORY_POLL.id, ...result, preview: isPollPreview() }, { headers });
    response.cookies.set(COOKIE, token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production" || req.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    console.error("[category-poll] unable to save vote");
    return unavailable();
  }
}
