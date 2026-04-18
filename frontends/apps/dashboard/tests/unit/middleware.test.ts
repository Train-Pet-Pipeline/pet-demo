import { describe, expect, it, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import middleware from "@/middleware";
import { signSession } from "@/lib/auth";

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
      headers: { cookie: `purrai_session=${cookie}` },
    });
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through all requests when DASHBOARD_AUTH_DISABLED=true", async () => {
    process.env.DASHBOARD_AUTH_DISABLED = "true";
    const req = new NextRequest("https://example.test/clips");
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });
});
