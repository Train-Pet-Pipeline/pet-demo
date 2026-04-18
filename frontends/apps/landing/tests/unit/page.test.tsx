import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({ wordmark: "Purr·AI", tagline: "听懂每一声咕噜、低吟、呼吸。", subtitle: "敬请期待 · Coming Soon" } as Record<string, string>)[key] ?? key,
}));

vi.mock("next-intl/server", () => ({
  unstable_setRequestLocale: () => undefined,
}));

vi.mock("@/components/sections/Hero", () => ({ Hero: () => <div id="section-01-hero">Hero</div> }));
vi.mock("@/components/sections/PrivacyFirst", () => ({ PrivacyFirst: () => <div>PrivacyFirst</div> }));
vi.mock("@/components/sections/PainPoint", () => ({ PainPoint: () => <div>PainPoint</div> }));
vi.mock("@/components/sections/Alerts", () => ({ Alerts: () => <div>Alerts</div> }));
vi.mock("@/components/sections/Abilities", () => ({ Abilities: () => <div>Abilities</div> }));
vi.mock("@/components/sections/EmotionRadar", () => ({ EmotionRadar: () => <div>EmotionRadar</div> }));
vi.mock("@/components/sections/Benchmarks", () => ({ Benchmarks: () => <div>Benchmarks</div> }));
vi.mock("@/components/sections/Closing", () => ({ Closing: () => <div>Closing</div> }));

import HomePage from "@/app/[locale]/page";

describe("HomePage", () => {
  it("renders all sections + skip link", () => {
    render(<HomePage params={{ locale: "zh" }} />);
    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByText("跳到主内容")).toBeInTheDocument();
  });
});
