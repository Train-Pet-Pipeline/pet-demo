import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({ wordmark: "Purr·AI", tagline: "听懂每一声咕噜、低吟、呼吸。", subtitle: "敬请期待 · Coming Soon" } as Record<string, string>)[key] ?? key,
}));

vi.mock("next-intl/server", () => ({
  unstable_setRequestLocale: () => undefined,
}));

import HomePage from "@/app/[locale]/page";

describe("HomePage (Coming Soon)", () => {
  it("renders wordmark + tagline", () => {
    render(<HomePage params={{ locale: "zh" }} />);
    expect(screen.getByText("Purr·AI")).toBeInTheDocument();
    expect(screen.getByText("听懂每一声咕噜、低吟、呼吸。")).toBeInTheDocument();
  });
});
