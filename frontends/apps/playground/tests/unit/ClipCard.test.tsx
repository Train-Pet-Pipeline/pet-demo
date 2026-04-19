import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

const clip2 = {
  slug: "a", title: "A", source: "ai_generated" as const,
  duration_s: 2, chapter_count: 1, width: 320, height: 240, tags: [],
};

it("initially shows poster, no video playing", () => {
  render(<ClipCard clip={clip2} />);
  const video = screen.getByTestId("clip-video") as HTMLVideoElement;
  expect(video.paused).toBe(true);
});

it("click triggers play once", async () => {
  render(<ClipCard clip={clip2} />);
  const btn = screen.getByRole("button", { name: /播放 A/ });
  const video = screen.getByTestId("clip-video") as HTMLVideoElement;
  video.play = vi.fn().mockResolvedValue(undefined);
  fireEvent.click(btn);
  expect(video.play).toHaveBeenCalledTimes(1);
});
