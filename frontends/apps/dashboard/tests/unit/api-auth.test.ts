import { describe, expect, it, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/route";
import { _resetRateLimitForTests } from "@/lib/auth";

const SECRET = "test-secret-32bytes-0123456789abcdef";

function req(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://example.test/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth", () => {
  beforeEach(() => {
    process.env.DASHBOARD_AUTH_SECRET = SECRET;
    process.env.DASHBOARD_PASSWORD = "letmein";
    _resetRateLimitForTests();
  });

  it("sets cookie and returns 200 on correct password", async () => {
    const res = await POST(req({ password: "letmein", next: "/clips" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/purrai_session=.+;/);
  });

  it("returns 401 on wrong password", async () => {
    const res = await POST(req({ password: "nope" }));
    expect(res.status).toBe(401);
  });

  it("returns 429 after rate limit", async () => {
    for (let i = 0; i < 5; i++) await POST(req({ password: "nope" }));
    const res = await POST(req({ password: "nope" }));
    expect(res.status).toBe(429);
  });

  it("rejects malformed body", async () => {
    const res = await POST(
      new Request("https://example.test/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
        body: "not-json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("sanitizes open-redirect: protocol-relative //evil.com falls back to /", async () => {
    const res = await POST(req({ password: "letmein", next: "//evil.com/path" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; next: string };
    expect(body.next).toBe("/");
  });

  it("sanitizes open-redirect: absolute https://evil.com falls back to /", async () => {
    const res = await POST(req({ password: "letmein", next: "https://evil.com/path" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; next: string };
    expect(body.next).toBe("/");
  });

  it("accepts a safe relative next", async () => {
    const res = await POST(req({ password: "letmein", next: "/clips?filter=active" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; next: string };
    expect(body.next).toBe("/clips?filter=active");
  });

  it("sanitizes open-redirect: backslash variant \\evil.com falls back to /", async () => {
    const res = await POST(req({ password: "letmein", next: "\\evil.com" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; next: string };
    expect(body.next).toBe("/");
  });

  it("sanitizes open-redirect: backslash-slash variant \\/evil.com falls back to /", async () => {
    const res = await POST(req({ password: "letmein", next: "\\/evil.com" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; next: string };
    expect(body.next).toBe("/");
  });

  it("sanitizes open-redirect: URL-encoded /%2F%2Fevil.com falls back to /", async () => {
    const res = await POST(req({ password: "letmein", next: "/%2F%2Fevil.com" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; next: string };
    expect(body.next).toBe("/");
  });

  it("sanitizes CRLF injection attempt", async () => {
    const res = await POST(req({ password: "letmein", next: "/path\r\nSet-Cookie: pwned=1" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; next: string };
    expect(body.next).toBe("/");
  });
});
