// Web Crypto only — no node:crypto imports. This file runs on both Edge (middleware)
// and Node (api route) runtimes. HMAC-SHA256 via crypto.subtle, base64url via btoa/atob.

const encoder = new TextEncoder();
const SECONDS_PER_DAY = 86_400;
const MIN_SECRET_LENGTH = 32;

function b64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = (4 - (s.length % 4)) % 4;
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export async function signSession(ttlDays: number, secret: string): Promise<string> {
  const expSec = Math.floor(Date.now() / 1000) + ttlDays * SECONDS_PER_DAY;
  const expPart = b64urlEncode(encoder.encode(String(expSec)));
  const mac = await hmacSha256(secret, expPart);
  return `${expPart}.${b64urlEncode(mac)}`;
}

export async function verifySession(
  cookie: string,
  secret: string,
): Promise<{ valid: true; exp: number } | { valid: false; reason: string }> {
  if (!cookie || cookie.split(".").length !== 2) return { valid: false, reason: "malformed" };
  const [expPart, macPart] = cookie.split(".") as [string, string];
  const expected = await hmacSha256(secret, expPart);
  let received: Uint8Array;
  try {
    received = b64urlDecode(macPart);
  } catch {
    return { valid: false, reason: "bad-b64" };
  }
  if (!timingSafeEqual(received, expected)) return { valid: false, reason: "hmac-mismatch" };
  let expBytes: Uint8Array;
  try {
    expBytes = b64urlDecode(expPart);
  } catch {
    return { valid: false, reason: "bad-exp" };
  }
  const expSec = parseInt(new TextDecoder().decode(expBytes), 10);
  if (!Number.isFinite(expSec)) return { valid: false, reason: "bad-exp" };
  if (expSec <= Math.floor(Date.now() / 1000)) return { valid: false, reason: "expired" };
  return { valid: true, exp: expSec };
}

// NOTE: byte-length of `a` and `b` is observable to a timing attacker (we early-return
// on length mismatch). For password comparison at current scope this is acceptable; if
// callers need length-opaque compare, pre-hash both sides to equal-length digests first.
// Timing-safe password compare (byte-level; strings up to ~1KB are fine at this scale).
export function timingSafeEqualString(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// --- rate limit (in-memory per-process) ---

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export function _resetRateLimitForTests(): void {
  buckets.clear();
}

export function requireAuthSecret(): string {
  const s = process.env.DASHBOARD_AUTH_SECRET;
  if (!s || s.length < MIN_SECRET_LENGTH) {
    throw new Error(`DASHBOARD_AUTH_SECRET must be set and >=${MIN_SECRET_LENGTH} chars`);
  }
  return s;
}

export function requireDashboardPassword(): string {
  const p = process.env.DASHBOARD_PASSWORD;
  if (!p) throw new Error("DASHBOARD_PASSWORD must be set");
  return p;
}

export function isAuthDisabled(): boolean {
  return process.env.DASHBOARD_AUTH_DISABLED === "true";
}
