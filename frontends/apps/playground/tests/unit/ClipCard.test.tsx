import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClipCard } from "@/components/ClipCard";

const clip = {
  slug: "a", title: "Title A", source: "ai_generated" as const,
  duration_s: 8, chapter_count: 1, width: 1280, height: 720, tags: [],
};

describe("ClipCard", () => {
  it("renders title", () => {
    render(<ClipCard clip={clip} />);
    expect(screen.getByText("Title A")).toBeInTheDocument();
  });
  it("ai_generated badge reads AI 生成", () => {
    render(<ClipCard clip={clip} />);
    expect(screen.getByText(/AI 生成/)).toBeInTheDocument();
  });
  it("links to /playground/<slug>", () => {
    render(<ClipCard clip={clip} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/playground/a");
  });
});
