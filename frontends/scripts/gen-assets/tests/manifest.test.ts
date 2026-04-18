import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { loadManifest } from "../src/manifest";

const MANIFEST = path.resolve(__dirname, "../manifest.yaml");

describe("loadManifest", () => {
  it("parses real manifest.yaml", async () => {
    const m = await loadManifest(MANIFEST);
    expect(m.version).toBe(1);
    expect(m.entries.length).toBeGreaterThanOrEqual(6);
    expect(m.entries[0]?.id).toBe("hero");
  });

  it("rejects malformed manifest", async () => {
    const bad = path.resolve(__dirname, "fixtures/bad-manifest.yaml");
    await fs.mkdir(path.dirname(bad), { recursive: true });
    await fs.writeFile(bad, "version: 'not-a-number'\nentries: []\n");
    await expect(loadManifest(bad)).rejects.toThrow();
  });
});
