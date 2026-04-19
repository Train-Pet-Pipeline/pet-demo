"use client";

import { useLocale } from "next-intl";
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "@/i18n";

const { Link, usePathname } = createSharedPathnamesNavigation({
  locales: [...locales],
  localePrefix: "as-needed",
});

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "zh" ? "en" : "zh";
  const label = locale === "zh" ? "EN" : "中";
  return (
    <Link
      href={pathname}
      locale={other}
      lang={other}
      aria-label={`Switch to ${other}`}
      className="fixed right-4 top-4 z-50 rounded border border-ink/20 bg-cream/80 px-2 py-1 text-sm text-ink backdrop-blur hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      {label}
    </Link>
  );
}
