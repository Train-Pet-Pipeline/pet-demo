import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BenchCard } from "../src/BenchCard";

describe("BenchCard", () => {
  it("renders value, unit, label", () => {
    render(<BenchCard label="FPS" value="27" unit="fps" sublabel="detector + track pipeline" />);
    expect(screen.getByText("27")).toBeInTheDocument();
    expect(screen.getByText("fps")).toBeInTheDocument();
    expect(screen.getByText("FPS")).toBeInTheDocument();
    expect(screen.getByText("detector + track pipeline")).toBeInTheDocument();
  });

  it("omits unit when not provided", () => {
    render(<BenchCard label="Clips" value="4" sublabel="真实 pet-data" />);
    expect(screen.queryByTestId("bench-card-unit")).toBeNull();
  });

  it("applies the large variant class when size=large", () => {
    render(<BenchCard label="FPS" value="27" size="large" />);
    const card = screen.getByTestId("bench-card");
    expect(card.className).toContain("bench-card-large");
  });
});
