import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("recharts", () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar">{children}</div>,
  Radar: () => null,
  PolarGrid: () => null,
  PolarAngleAxis: ({ dataKey }: { dataKey: string }) => <span data-testid="axis">{dataKey}</span>,
  PolarRadiusAxis: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) =>
    ({
      intro: "情绪的八个面向,从一段时间观察它的状态",
      "dimensions.calm": "平静",
      "dimensions.alert": "警觉",
      "dimensions.playful": "玩心",
      "dimensions.anxious": "焦虑",
      "dimensions.affection": "亲昵",
      "dimensions.fatigue": "疲惫",
      "dimensions.appetite": "食欲",
      "dimensions.vocal": "话痨",
    } as Record<string, string>)[k] ?? k,
}));

import { EmotionRadar } from "@/components/sections/EmotionRadar";

describe("EmotionRadar section", () => {
  it("renders intro + 8 dimension labels + at least 1 badge", () => {
    render(<EmotionRadar />);
    expect(screen.getByText("情绪的八个面向,从一段时间观察它的状态")).toBeInTheDocument();
    const badges = screen.getAllByText("示意图 · 非真实推理输出");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
