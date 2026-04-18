import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const translations: Record<string, string> = {
  intro: "六类我们会主动告诉你的信号",
  "items.01.title": "异常呜咽",
  "items.02.title": "进食停止 ≥ 12h",
  "items.03.title": "呕吐 / 反复呼吸异常",
  "items.04.title": "睡眠模式骤变",
  "items.05.title": "理毛过度",
  "items.06.title": "失踪 ≥ 4h",
  "items.01.body": "持续低吟或求救声,我们记下时间和情绪.",
  "items.02.body": "粮碗未变化,可能是健康警示.",
  "items.03.body": "短促咳嗽或反复抬头,需要关注.",
  "items.04.body": "白夜节律突然反转,可能是潜在病兆.",
  "items.05.body": "局部反复舔舐,可能是焦虑或皮肤问题.",
  "items.06.body": "Re-ID 模型未识别到它,我们告诉你.",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) => translations[k] ?? k,
}));

import { Alerts } from "@/components/sections/Alerts";

describe("Alerts section", () => {
  it("renders intro + 6 alert titles", () => {
    render(<Alerts />);
    expect(screen.getByText("六类我们会主动告诉你的信号")).toBeInTheDocument();
    expect(screen.getByText("异常呜咽")).toBeInTheDocument();
    expect(screen.getByText("进食停止 ≥ 12h")).toBeInTheDocument();
    expect(screen.getByText("呕吐 / 反复呼吸异常")).toBeInTheDocument();
    expect(screen.getByText("睡眠模式骤变")).toBeInTheDocument();
    expect(screen.getByText("理毛过度")).toBeInTheDocument();
    expect(screen.getByText("失踪 ≥ 4h")).toBeInTheDocument();
  });
});
