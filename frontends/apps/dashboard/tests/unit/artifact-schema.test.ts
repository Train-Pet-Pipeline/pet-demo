import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { GoldenSchema, NarrativesSchema, BenchmarksSchema } from "@/lib/schemas";

const goldenPath = path.resolve(__dirname, "../../../../../tests/fixtures/artifact-golden.json");
const golden = JSON.parse(readFileSync(goldenPath, "utf-8"));

describe("artifact schemas", () => {
  it("parses the golden fixture", () => {
    expect(() => GoldenSchema.parse(golden)).not.toThrow();
  });

  it("parses narratives subtree", () => {
    const parsed = NarrativesSchema.parse(golden.narratives);
    expect(parsed.clip_1?.narratives[0]?.text).toBeDefined();
  });

  it("parses benchmarks subtree", () => {
    const parsed = BenchmarksSchema.parse(golden.benchmarks);
    expect(parsed.pipeline_mode).toBe("parallel");
  });

  it("rejects malformed benchmarks (missing pipeline_mode)", () => {
    const { pipeline_mode, ...bad } = golden.benchmarks;
    expect(() => BenchmarksSchema.parse(bad)).toThrow();
  });
});
