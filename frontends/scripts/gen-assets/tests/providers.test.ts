import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnsplashProvider } from "../src/providers/unsplash";

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
