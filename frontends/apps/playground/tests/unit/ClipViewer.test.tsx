import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string, params?: Record<string, unknown>) => {
    const map: Record<string, Record<string, string>> = {
      layers: { title: "图层" },
      chapters: { title: "章节", label: "章节 {n}" },
      narrative: { title: "叙事" },
      badges: { realFootage: "真实拍摄片段 · 模型未预设" },
    };
    const val = (map[ns] ?? {})[k] ?? k;
    if (params && typeof params.n === "number") return val.replace("{n}", String(params.n));
    return val;
  },
}));

import { ClipViewer } from "@/components/ClipViewer";

const tracks = { fps: 25, frames: [{ t: 0, tracks: [{ id: 1, bbox: [10, 20, 100, 200], score: 0.9 }] }] };
const poses = { fps: 25, schema: "ap10k-17", frames: [] };
const narratives = { chapters: [{ start: 0, end: 2, text: "Chapter 1", confidence: 0.8 }] };

it("renders UnscriptedBanner for real_footage source", () => {
  const clip = { slug: "r", title: "Real", source: "real_footage" as const };
  render(<ClipViewer slug="r" clip={clip} tracks={tracks} poses={poses} narratives={narratives} />);
  expect(screen.getByText(/真实拍摄片段/)).toBeInTheDocument();
});

it("does not render UnscriptedBanner for ai_generated source", () => {
  const clip = { slug: "ai", title: "AI", source: "ai_generated" as const };
  render(<ClipViewer slug="ai" clip={clip} tracks={tracks} poses={poses} narratives={narratives} />);
  expect(screen.queryByText(/真实拍摄片段/)).not.toBeInTheDocument();
});
