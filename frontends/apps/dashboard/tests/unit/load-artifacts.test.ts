import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseNarratives, parseBenchmarks } from "@/lib/load-artifacts";

const fix = path.resolve(__dirname, "../../public/artifacts");
const narratives = JSON.parse(readFileSync(path.join(fix, "narratives.json"), "utf-8"));
const benchmarks = JSON.parse(readFileSync(path.join(fix, "benchmarks.json"), "utf-8"));

describe("load-artifacts", () => {
  it("parseNarratives on committed fixture", () => {
    const result = parseNarratives(narratives);
    expect(Object.keys(result)).toHaveLength(4);
    expect(result.clip_1?.narratives.length ?? 0).toBeGreaterThanOrEqual(1);
  });

  it("parseBenchmarks on committed fixture", () => {
    const result = parseBenchmarks(benchmarks);
    expect(result.pipeline_mode).toBe("parallel");
  });

  it("parseNarratives throws on malformed input", () => {
    expect(() => parseNarratives({ bad: "value" } as unknown as object)).toThrow();
  });

  it("parseBenchmarks throws on malformed input", () => {
    expect(() => parseBenchmarks({ bad: "value" } as unknown as object)).toThrow();
  });
});
