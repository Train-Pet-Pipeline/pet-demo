"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "../i18n";

const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "/";

const { Link: IntlLink, usePathname } = createSharedPathnamesNavigation({
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

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");

  const other = locale === "zh" ? "en" : "zh";
  const switchLabel = locale === "zh" ? "EN" : "中";
  const switchAriaLabel = locale === "zh" ? t("switchToEn") : t("switchToZh");

  // pathname from next-intl is locale-stripped; root gallery is "/".
  const isDetailPage = pathname !== "/" && pathname !== "";

  return (
    <header className="sticky top-0 z-10 bg-cream/90 backdrop-blur border-b border-ink/10 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          href={landingUrl}
          className="font-serif text-h3 text-ink hover:text-clay transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 rounded"
        >
          Purr·AI
        </Link>
        {isDetailPage && (
          <Link
            href="/"
            className="text-sm text-mute hover:text-ink transition flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 rounded"
          >
            <span aria-hidden="true">←</span>
            <span>{t("gallery")}</span>
          </Link>
        )}
      </div>
      <IntlLink
        href={pathname}
        locale={other}
        lang={other}
        aria-label={switchAriaLabel}
        title={switchAriaLabel}
        className="rounded border border-ink/20 bg-cream/80 px-3 py-1.5 text-sm text-ink hover:border-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <GlobeIcon />
        {switchLabel}
      </IntlLink>
    </header>
  );
}
