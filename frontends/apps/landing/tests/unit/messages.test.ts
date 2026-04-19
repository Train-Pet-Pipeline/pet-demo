import { describe, expect, it } from "vitest";
import zh from "@/messages/zh.json";
import en from "@/messages/en.json";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("landing messages parity", () => {
  it("zh and en have identical key structure", () => {
    const zhKeys = keyPaths(zh).sort();
    const enKeys = keyPaths(en).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it("meta.title is set in both locales", () => {
    expect((zh as any).meta.title).toMatch(/Purr/);
    expect((en as any).meta.title).toMatch(/Purr/);
  });
});
