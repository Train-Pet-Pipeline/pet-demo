import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NarrativeCard } from "../src/NarrativeCard";

describe("NarrativeCard", () => {
  it("renders when visible", () => {
    render(<NarrativeCard text="猫走向水碗" confidence={0.91} visible />);
    expect(screen.getByText("猫走向水碗")).toBeInTheDocument();
    expect(screen.getByText(/91%/)).toBeInTheDocument();
  });

  it("renders nothing when visible=false", () => {
    render(<NarrativeCard text="猫走向水碗" confidence={0.91} visible={false} />);
    expect(screen.queryByText("猫走向水碗")).toBeNull();
  });

  it("formats confidence as integer percent", () => {
    render(<NarrativeCard text="x" confidence={0.876} visible />);
    expect(screen.getByText("88%")).toBeInTheDocument();
  });
});
