import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const translationsByNs: Record<string, Record<string, string>> = {
  privacy: {
    intro: "你的猫的数据，从设备到提醒，全程留在你家里。",
    step1: "端侧 VLM 推理 · 像家具一样安静的存在",
    step2: "结构化笔记 · 不是原始录音",
    step3: "你按自己的节奏阅读 · 没有云端可看",
    outro: "我们看不到任何数据，因为我们不看。",
  },
};

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string) => (translationsByNs[ns] ?? {})[k] ?? k,
}));
vi.mock("next/image", () => ({ default: () => null }));

import { PrivacyFirst } from "@/components/sections/PrivacyFirst";

describe("PrivacyFirst section", () => {
  it("renders intro + outro + 3 step captions", () => {
    render(<PrivacyFirst />);
    expect(screen.getByText("你的猫的数据，从设备到提醒，全程留在你家里。")).toBeInTheDocument();
    expect(screen.getByText("我们看不到任何数据，因为我们不看。")).toBeInTheDocument();
    expect(screen.getByText("端侧 VLM 推理 · 像家具一样安静的存在")).toBeInTheDocument();
  });
});
