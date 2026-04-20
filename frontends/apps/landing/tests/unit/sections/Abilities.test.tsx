import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const translationsByNs: Record<string, Record<string, string>> = {
  abilities: {
    intro: "四项端侧能力，共同构成对它的理解",
    "items.01.title": "多目标检测与追踪",
    "items.02.title": "Re-ID 个体识别",
    "items.03.title": "姿态与行为",
    "items.04.title": "VLM 自然语言摘要",
    "items.01.body": "YOLO + ByteTrack，识别多只猫并保持身份。",
    "items.02.body": "OSNet，在你家里区分每一只。",
    "items.03.body": "AP-10K 关键点，捕捉理毛、跳跃、休息。",
    "items.04.body": "Qwen2-VL 微调，生成结构化健康笔记。",
  },
};

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string) => (translationsByNs[ns] ?? {})[k] ?? k,
}));

import { Abilities } from "@/components/sections/Abilities";

describe("Abilities section", () => {
  it("renders intro + 4 titles", () => {
    render(<Abilities />);
    expect(screen.getByText("四项端侧能力，共同构成对它的理解")).toBeInTheDocument();
    expect(screen.getByText("多目标检测与追踪")).toBeInTheDocument();
    expect(screen.getByText("Re-ID 个体识别")).toBeInTheDocument();
    expect(screen.getByText("姿态与行为")).toBeInTheDocument();
    expect(screen.getByText("VLM 自然语言摘要")).toBeInTheDocument();
  });
});
