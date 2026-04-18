import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) =>
    ({
      wordmark: "Purr·AI",
      tagline: "因为我们终于听懂了。",
      "subscribe.label": "邮箱订阅 · 获取首批邀请",
      "subscribe.button": "订阅",
      "subscribe.success": "感谢,我们会与你联系。",
      "subscribe.busy": "提交中…",
      "subscribe.error": "出错了,请稍后再试。",
    } as Record<string, string>)[k] ?? k,
}));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@purrai/ui", () => ({
  SectionShell: ({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) => (
    <section id={id} className={className}>{children}</section>
  ),
  EmailForm: () => (
    <form>
      <input type="email" />
      <button type="submit">订阅</button>
    </form>
  ),
}));

import { Closing } from "@/components/sections/Closing";

describe("Closing section", () => {
  it("renders wordmark + tagline + subscribe button", () => {
    render(<Closing />);
    expect(screen.getByText("Purr·AI")).toBeInTheDocument();
    expect(screen.getByText("因为我们终于听懂了。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "订阅" })).toBeInTheDocument();
  });
});
