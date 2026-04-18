import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("node:fs/promises", () => {
  return {
    readFile: async () =>
      JSON.stringify({
        schemaVersion: 1,
        metrics: [{ key: "x", label: "Test", value: "42", unit: "" }],
      }),
    // provide enough of the module shape to satisfy the import
    default: {
      readFile: async () =>
        JSON.stringify({
          schemaVersion: 1,
          metrics: [{ key: "x", label: "Test", value: "42", unit: "" }],
        }),
    },
  };
});

import { Benchmarks } from "@/components/sections/Benchmarks";

describe("Benchmarks section", () => {
  it("renders metrics from json", async () => {
    const ui = await Benchmarks();
    render(ui);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });
});
