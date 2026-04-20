"use client";

import { useLocale, useTranslations } from "next-intl";
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "@/i18n";

const { Link, usePathname } = createSharedPathnamesNavigation({
  locales: [...locales],
  localePrefix: "as-needed",
});

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block align-middle mr-1.5"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <ellipse cx="8" cy="8" rx="2.5" ry="6.5" stroke="currentColor" strokeWidth="1.25" />
      <line x1="1.5" y1="6" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.25" />
      <line x1="1.5" y1="10" x2="14.5" y2="10" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const other = locale === "zh" ? "en" : "zh";
  const label = locale === "zh" ? "EN" : "中";
  const ariaLabel = locale === "zh" ? t("switchToEn") : t("switchToZh");
  return (
    <Link
      href={pathname}
      locale={other}
      lang={other}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="fixed right-4 top-4 z-50 rounded border border-ink/20 bg-cream/80 px-3 py-1.5 text-sm text-ink backdrop-blur hover:border-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      <GlobeIcon />
      {label}
    </Link>
  );
}
