import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) =>
    ({
      headline: "你不在的时候，它在说什么？",
      body: "猫不会用力呼救。它们用低吟、停顿、姿态告诉你不舒服。我们在它们第一次微弱时就听见。",
    } as Record<string, string>)[k] ?? k,
}));
vi.mock("next/image", () => ({ default: () => null }));

import { PainPoint } from "@/components/sections/PainPoint";

describe("PainPoint section", () => {
  it("renders headline + body", () => {
    render(<PainPoint />);
    expect(screen.getByText("你不在的时候，它在说什么？")).toBeInTheDocument();
    expect(screen.getByText("猫不会用力呼救。它们用低吟、停顿、姿态告诉你不舒服。我们在它们第一次微弱时就听见。")).toBeInTheDocument();
  });
});
