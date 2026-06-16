import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { IllustrationBadge } from "../src/IllustrationBadge";

describe("IllustrationBadge", () => {
  it("renders the mandated text", () => {
    render(<IllustrationBadge />);
    expect(screen.getByText("基线推理")).toBeInTheDocument();
  });

  it("exposes aria-label for screen readers", () => {
    render(<IllustrationBadge />);
    const badge = screen.getByLabelText("基线推理");
    expect(badge).toBeInTheDocument();
  });
});
