import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadTracks } from "@/lib/artifacts";

const STITCHED = {
  fps: 25,
  frames: [{ t: 0, tracks: [{ id: 1, bbox: [0, 0, 10, 10], score: 0.9 }] }],
};
const PLAIN = {
  fps: 25,
  frames: [{ t: 0, tracks: [{ id: 2, bbox: [0, 0, 10, 10], score: 0.9 }] }],
};

describe("loadTracks", () => {
  let dir: string;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), "load-tracks-")); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("prefers tracks.stitched.json when present", async () => {
    writeFileSync(join(dir, "tracks.stitched.json"), JSON.stringify(STITCHED));
    writeFileSync(join(dir, "tracks.json"), JSON.stringify(PLAIN));
    const out = await loadTracks(dir);
    expect(out).toEqual(STITCHED);
  });

  it("falls back to tracks.json when stitched absent", async () => {
    writeFileSync(join(dir, "tracks.json"), JSON.stringify(PLAIN));
    const out = await loadTracks(dir);
    expect(out).toEqual(PLAIN);
  });

  it("throws clearly when neither file present", async () => {
    await expect(loadTracks(dir)).rejects.toThrow();
  });
});
