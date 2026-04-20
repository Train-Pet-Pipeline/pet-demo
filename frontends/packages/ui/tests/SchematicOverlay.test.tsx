import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SchematicOverlay } from "../src/SchematicOverlay";

describe("SchematicOverlay", () => {
  it("renders children", () => {
    render(<SchematicOverlay><div data-testid="inner">x</div></SchematicOverlay>);
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });

  it("injects IllustrationBadge when badgeLabel is provided", () => {
    render(<SchematicOverlay badgeLabel="test label" badgeAria="test aria"><div>x</div></SchematicOverlay>);
    expect(screen.getByText("test label")).toBeInTheDocument();
  });

  it("omits IllustrationBadge when no badgeLabel is provided (caller manages their own)", () => {
    render(<SchematicOverlay><div>x</div></SchematicOverlay>);
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("injected badge coexists with absolutely-positioned child content", () => {
    render(
      <SchematicOverlay badgeLabel="coexist label" badgeAria="coexist aria">
        <span style={{ position: "absolute", top: 0 }}>conflict</span>
      </SchematicOverlay>
    );
    expect(screen.getByText("coexist label")).toBeInTheDocument();
  });
});
