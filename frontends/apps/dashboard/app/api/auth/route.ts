import { NextResponse } from "next/server";
import {
  signSession,
  timingSafeEqualString,
  checkRateLimit,
  requireAuthSecret,
  requireDashboardPassword,
} from "@/lib/auth";
import { SESSION_TTL_DAYS, RATE_LIMIT_PER_MIN, COOKIE_NAME } from "@/config";

const RATE_LIMIT_WINDOW_MS = 60_000;
const SECONDS_PER_DAY = 86_400;

export const runtime = "nodejs";

function sanitizeNext(raw: unknown): string {
  if (typeof raw !== "string") return "/";
  // Browsers normalize "\" → "/" in URLs, so "\evil.com" becomes "/evil.com"
  // and "\/evil.com" becomes "//evil.com" at navigation time.
  if (raw.includes("\\")) return "/";
  // Defensively decode once to catch "/%2F%2Fevil.com" → "///evil.com".
  // decodeURIComponent throws on malformed input — treat as hostile.
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return "/";
  }
  // Must be a same-origin path: starts with "/" AND not "//" AND no CRLF.
  if (!decoded.startsWith("/")) return "/";
  if (decoded.startsWith("//")) return "/";
  if (/[\r\n\0]/.test(decoded)) return "/";
  // Return the original (pre-decode) string so legitimate percent-encoding (e.g.,
  // spaces, non-ASCII) is preserved for the browser to re-encode consistently.
  return raw;
}

export async function POST(req: Request): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip, RATE_LIMIT_PER_MIN, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { password?: string; next?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const submitted = typeof body.password === "string" ? body.password : "";
  const expected = requireDashboardPassword();

  if (!timingSafeEqualString(submitted, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const secret = requireAuthSecret();
  const cookie = await signSession(SESSION_TTL_DAYS, secret);
  const nextPath = sanitizeNext(body.next);

  const res = NextResponse.json({ ok: true, next: nextPath }, { status: 200 });
  res.cookies.set(COOKIE_NAME, cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * SECONDS_PER_DAY,
  });
  return res;
}
