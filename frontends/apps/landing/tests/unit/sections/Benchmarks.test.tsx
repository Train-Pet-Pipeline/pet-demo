import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("node:fs/promises", () => {
  return {
    readFile: async () =>
      JSON.stringify({
        schemaVersion: 1,
        metrics: [{ key: "x", value: "42", unit: "" }],
      }),
    default: {
      readFile: async () =>
        JSON.stringify({
          schemaVersion: 1,
          metrics: [{ key: "x", value: "42", unit: "" }],
        }),
    },
  };
});

vi.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const ns = typeof arg === "string" ? arg : arg.namespace;
    const map: Record<string, Record<string, string>> = {
      benchmarks: {
        heading: "基准数据",
        "metrics.x.label": "Test",
        "metrics.updating": "更新中",
      },
    };
    return (k: string) => (map[ns] ?? {})[k] ?? k;
  },
}));

import { Benchmarks } from "@/components/sections/Benchmarks";

describe("Benchmarks section", () => {
  it("renders metrics from json", async () => {
    const ui = await Benchmarks({ locale: "zh" });
    render(ui);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });
});
