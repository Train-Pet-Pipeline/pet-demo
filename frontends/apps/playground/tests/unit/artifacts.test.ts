import { describe, it, expect } from "vitest";
import { manifestSchema, parseManifestOrEmpty } from "@/lib/artifacts";

describe("manifest parsing", () => {
  it("valid manifest parses", () => {
    const raw = {
      version: "0.4.0", generated_at: "2026-04-18T00:00:00Z",
      clips: [{
        slug: "a", title: "A", source: "ai_generated",
        duration_s: 8, chapter_count: 1, width: 1280, height: 720, tags: [],
      }],
    };
    const parsed = manifestSchema.parse(raw);
    expect(parsed.clips[0].slug).toBe("a");
  });
  it("invalid source rejected", () => {
    expect(() => manifestSchema.parse({
      version: "0.4.0", generated_at: "x", clips: [{
        slug: "a", title: "A", source: "xxx",
        duration_s: 8, chapter_count: 1, width: 1280, height: 720, tags: [],
      }],
    })).toThrow();
  });
  it("missing file → empty array", async () => {
    const got = await parseManifestOrEmpty(async () => { throw new Error("ENOENT"); });
    expect(got.clips).toEqual([]);
  });
  it("empty clips array → empty", async () => {
    const got = await parseManifestOrEmpty(async () => ({
      version: "0.4.0", generated_at: "", clips: [],
    }));
    expect(got.clips).toEqual([]);
  });
});
