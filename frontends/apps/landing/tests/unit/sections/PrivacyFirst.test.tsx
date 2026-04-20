import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const translationsByNs: Record<string, Record<string, string>> = {
  privacy: {
    intro: "你的猫的数据,从设备到提醒,全程留在你家里。",
    step1: "端侧 VLM 推理 · 像家具一样安静的存在",
    step2: "结构化笔记 · 不是原始录音",
    step3: "你按自己的节奏阅读 · 没有云端可看",
    outro: "我们看不到任何数据,因为我们看不到。",
  },
  schematic: {
    label: "示意图 · 非真实推理输出",
    aria: "示意图,非真实推理输出",
  },
};

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string) => (translationsByNs[ns] ?? {})[k] ?? k,
}));
vi.mock("next/image", () => ({ default: () => null }));

import { PrivacyFirst } from "@/components/sections/PrivacyFirst";

describe("PrivacyFirst section", () => {
  it("renders intro + 3 badge occurrences", () => {
    render(<PrivacyFirst />);
    expect(screen.getByText("你的猫的数据,从设备到提醒,全程留在你家里。")).toBeInTheDocument();
    const badges = screen.getAllByText("示意图 · 非真实推理输出");
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });
});
