import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/subscribe/route";

function req(body: unknown): Request {
  return new Request("http://x/api/subscribe", {
    method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/subscribe", () => {
  it("returns 200 for a valid email and logs structured event", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const r = await POST(req({ email: "person@example.com" }));
    expect(r.status).toBe(200);
    const calls = log.mock.calls.map((c) => String(c[0]));
    expect(calls.some((s) => s.includes("subscribe_stub"))).toBe(true);
    expect(calls.some((s) => s.includes("person@example.com"))).toBe(true);
  });
  it("returns 400 for invalid email", async () => {
    const r = await POST(req({ email: "nope" }));
    expect(r.status).toBe(400);
  });
});
