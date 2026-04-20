import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      unscriptedBanner: "真实拍摄片段 · 模型未预设",
    };
    return map[k] ?? k;
  },
}));

import { UnscriptedBanner } from "@/components/UnscriptedBanner";

it("renders the banner text", () => {
  render(<UnscriptedBanner />);
  expect(screen.getByText(/真实拍摄片段/)).toBeInTheDocument();
});
