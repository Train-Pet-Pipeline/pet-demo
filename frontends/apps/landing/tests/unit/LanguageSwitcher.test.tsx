import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

vi.mock("next-intl", () => ({
  useLocale: () => "zh",
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      switchToEn: "Switch to English",
      switchToZh: "切换至中文",
    };
    return map[key] ?? key;
  },
}));
vi.mock("next-intl/navigation", () => {
  return {
    createSharedPathnamesNavigation: () => ({
      Link: (props: any) => <a {...props} data-locale={props.locale} data-href={props.href}>{props.children}</a>,
      usePathname: () => "/",
    }),
  };
});

describe("LanguageSwitcher", () => {
  it("renders EN link when current locale is zh", () => {
    render(<LanguageSwitcher />);
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("EN");
    expect(link).toHaveAttribute("data-locale", "en");
    expect(link).toHaveAttribute("lang", "en");
    expect(link).toHaveAttribute("aria-label", "Switch to English");
    expect(link).toHaveAttribute("title", "Switch to English");
  });
});
