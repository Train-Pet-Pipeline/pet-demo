import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { IllustrationBadge } from "../src/IllustrationBadge";

describe("IllustrationBadge", () => {
  it("renders the mandated text", () => {
    render(<IllustrationBadge />);
    expect(screen.getByText("示意图 · 非真实推理输出")).toBeInTheDocument();
  });

  it("exposes aria-label for screen readers", () => {
    render(<IllustrationBadge />);
    const badge = screen.getByLabelText("示意图,非真实推理输出");
    expect(badge).toBeInTheDocument();
  });
});
