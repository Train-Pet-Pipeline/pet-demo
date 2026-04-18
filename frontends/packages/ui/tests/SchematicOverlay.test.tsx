import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SchematicOverlay } from "../src/SchematicOverlay";

describe("SchematicOverlay", () => {
  it("renders children", () => {
    render(<SchematicOverlay><div data-testid="inner">x</div></SchematicOverlay>);
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });

  it("always injects IllustrationBadge", () => {
    render(<SchematicOverlay><div>x</div></SchematicOverlay>);
    expect(screen.getByText("示意图 · 非真实推理输出")).toBeInTheDocument();
  });

  it("badge is present even when children include their own absolute children", () => {
    render(
      <SchematicOverlay>
        <span style={{ position: "absolute", top: 0 }}>conflict</span>
      </SchematicOverlay>
    );
    expect(screen.getByText("示意图 · 非真实推理输出")).toBeInTheDocument();
  });
});
