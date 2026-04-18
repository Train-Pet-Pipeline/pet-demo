import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { toAvif } from "../src/compress";

describe("toAvif", () => {
  it("converts a small PNG to AVIF bytes", async () => {
    const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#fff" } })
      .png().toBuffer();
    const out = await toAvif(png, 64);
    expect(out.length).toBeGreaterThan(0);
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe("heif");
  });
});
