import { describe, expect, it, beforeEach, vi } from "vitest";
import { signSession, verifySession, checkRateLimit, _resetRateLimitForTests } from "@/lib/auth";

const SECRET = "test-secret-32bytes-0123456789abcdef";

describe("signSession / verifySession (Web Crypto HMAC)", () => {
  it("round-trips", async () => {
    const cookie = await signSession(7, SECRET);
    const result = await verifySession(cookie, SECRET);
    expect(result.valid).toBe(true);
  });

  it("rejects a cookie signed with a different secret", async () => {
    const cookie = await signSession(7, SECRET);
    const result = await verifySession(cookie, "other-secret-0123456789abcdefghij");
    expect(result.valid).toBe(false);
  });

  it("rejects a malformed cookie", async () => {
    expect((await verifySession("", SECRET)).valid).toBe(false);
    expect((await verifySession("onepart", SECRET)).valid).toBe(false);
    expect((await verifySession("bad.bad.extra", SECRET)).valid).toBe(false);
  });

  it("rejects an expired cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T00:00:00Z"));
    const cookie = await signSession(7, SECRET);
    vi.setSystemTime(new Date("2026-05-01T00:00:00Z"));
    expect((await verifySession(cookie, SECRET)).valid).toBe(false);
    vi.useRealTimers();
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => _resetRateLimitForTests());

  it("allows up to limit", () => {
    for (let i = 0; i < 5; i++) expect(checkRateLimit("1.2.3.4", 5, 60_000)).toBe(true);
  });

  it("blocks the 6th within the window", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("1.2.3.4", 5, 60_000);
    expect(checkRateLimit("1.2.3.4", 5, 60_000)).toBe(false);
  });

  it("resets after the window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    for (let i = 0; i < 5; i++) checkRateLimit("1.2.3.4", 5, 60_000);
    vi.setSystemTime(60_001);
    expect(checkRateLimit("1.2.3.4", 5, 60_000)).toBe(true);
    vi.useRealTimers();
  });
});
