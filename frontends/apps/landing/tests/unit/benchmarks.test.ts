import { describe, it, expect } from "vitest";
import { parseBenchmarks } from "@/lib/benchmarks";

describe("parseBenchmarks", () => {
  it("accepts valid benchmark JSON", () => {
    const r = parseBenchmarks({ schemaVersion: 1, metrics: [{ key: "x", label: "X", value: "1", unit: "" }] });
    expect(r.metrics[0]?.key).toBe("x");
  });
  it("rejects malformed JSON", () => {
    expect(() => parseBenchmarks({ schemaVersion: 2, metrics: [] })).toThrow();
  });
});
