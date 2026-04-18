import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnsplashProvider } from "../src/providers/unsplash";
import { DoubaoProvider } from "../src/providers/doubao";

const fakeJpeg = Buffer.from("fakejpegbytes");

describe("UnsplashProvider", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("requires UNSPLASH_ACCESS_KEY env", () => {
    delete process.env.UNSPLASH_ACCESS_KEY;
    expect(() => new UnsplashProvider()).toThrow(/UNSPLASH_ACCESS_KEY/);
  });

  it("returns image bytes from API", async () => {
    process.env.UNSPLASH_ACCESS_KEY = "k";
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("api.unsplash.com")) {
        return new Response(JSON.stringify({ urls: { full: "https://images/1" } }), { status: 200 });
      }
      return new Response(fakeJpeg, { status: 200 });
    });
    const p = new UnsplashProvider();
    const r = await p.generate({ prompt: "warm interior cat", aspect: "16:9", width: 2400 });
    expect(r.bytes.equals(fakeJpeg)).toBe(true);
    expect(r.mime).toBe("image/jpeg");
  });
});

describe("DoubaoProvider", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("requires DOUBAO_API_KEY", () => {
    delete process.env.DOUBAO_API_KEY;
    process.env.DOUBAO_RUNTIME = "ts";
    expect(() => new DoubaoProvider()).toThrow(/DOUBAO_API_KEY/);
  });

  it("ts runtime returns bytes from HTTP API", async () => {
    process.env.DOUBAO_API_KEY = "k";
    process.env.DOUBAO_RUNTIME = "ts";
    const fakePng = Buffer.from("png");
    vi.spyOn(global, "fetch").mockImplementation(async () =>
      new Response(JSON.stringify({ data: [{ b64_json: fakePng.toString("base64") }] }), { status: 200 })
    );
    const p = new DoubaoProvider();
    const r = await p.generate({ prompt: "x", aspect: "16:9", width: 1024 });
    expect(r.bytes.equals(fakePng)).toBe(true);
    expect(r.mime).toBe("image/png");
  });
});
