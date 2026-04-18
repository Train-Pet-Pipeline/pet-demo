import { describe, expect, it, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import middleware from "@/middleware";
import { signSession } from "@/lib/auth";
import { COOKIE_NAME } from "@/config";

const SECRET = "test-secret-32bytes-0123456789abcdef";

describe("middleware", () => {
  beforeEach(() => {
    process.env.DASHBOARD_AUTH_SECRET = SECRET;
    delete process.env.DASHBOARD_AUTH_DISABLED;
  });

  it("redirects unauthenticated user to /login with next=", async () => {
    const req = new NextRequest("https://example.test/clips");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).toContain("next=%2Fclips");
  });

  it("passes through with a valid session cookie", async () => {
    const cookie = await signSession(7, SECRET);
    const req = new NextRequest("https://example.test/", {
      headers: { cookie: `${COOKIE_NAME}=${cookie}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through all requests when DASHBOARD_AUTH_DISABLED=true", async () => {
    process.env.DASHBOARD_AUTH_DISABLED = "true";
    const req = new NextRequest("https://example.test/clips");
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("preserves query string in the next= param on redirect", async () => {
    const req = new NextRequest("https://example.test/clips?filter=active&sort=recent");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    const loc = res.headers.get("location");
    expect(loc).toBeTruthy();
    // Next.js encodes ? as %3F and & as %26 inside a query param value.
    expect(loc).toMatch(/next=%2Fclips%3Ffilter%3Dactive%26sort%3Drecent/);
  });
});
