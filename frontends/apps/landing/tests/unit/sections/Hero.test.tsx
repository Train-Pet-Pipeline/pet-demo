import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) =>
    ({ wordmark: "Purr·AI", tagline: "听懂每一声咕噜、低吟、呼吸。", subhead: "端侧多模态宠物理解,只在你家里。" } as Record<string, string>)[k] ?? k,
}));
vi.mock("next/image", () => ({ default: () => null }));

import { Hero } from "@/components/sections/Hero";

describe("Hero section", () => {
  it("renders wordmark + tagline + section anchor", () => {
    const { container } = render(<Hero />);
    expect(screen.getByText("Purr·AI")).toBeInTheDocument();
    expect(container.querySelector("#section-01-hero")).toBeInTheDocument();
  });
});
