import React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      "nav.viewDetail": "View Details",
      "badges.aiGenerated": "AI 生成示意",
      "badges.realFootage": "真实拍摄 · 未预设",
      "schematic.label": "基线推理",
      "schematic.aria": "基线推理",
    };
    return map[k] ?? k;
  },
}));

vi.mock("next-intl/navigation", () => ({
  createSharedPathnamesNavigation: () => ({
    Link: ({ href, children, ...props }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children),
    usePathname: () => "/",
  }),
}));

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
  it("links to locale-aware /<slug>", () => {
    render(<ClipCard clip={clip} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/a");
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
  const btn = screen.getByRole("button", { name: /View Details A/ });
  const video = screen.getByTestId("clip-video") as HTMLVideoElement;
  video.play = vi.fn().mockResolvedValue(undefined);
  fireEvent.click(btn);
  expect(video.play).toHaveBeenCalledTimes(1);
});
