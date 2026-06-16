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

const translationsByNs: Record<string, Record<string, string>> = {
  radar: {
    intro: "情绪的八个面向，从一段时间观察它的状态",
    "dimensions.calm": "平静",
    "dimensions.alert": "警觉",
    "dimensions.playful": "玩心",
    "dimensions.anxious": "焦虑",
    "dimensions.affection": "亲昵",
    "dimensions.fatigue": "疲惫",
    "dimensions.appetite": "食欲",
    "dimensions.vocal": "话痨",
  },
};

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string) => (translationsByNs[ns] ?? {})[k] ?? k,
}));

import { EmotionRadar } from "@/components/sections/EmotionRadar";

describe("EmotionRadar section", () => {
  it("renders intro + radar chart", () => {
    render(<EmotionRadar />);
    expect(screen.getByText("情绪的八个面向，从一段时间观察它的状态")).toBeInTheDocument();
    expect(screen.getByTestId("radar")).toBeInTheDocument();
  });
});
