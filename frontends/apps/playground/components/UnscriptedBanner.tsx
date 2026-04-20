// components/UnscriptedBanner.tsx
"use client";
import { useTranslations } from "next-intl";

export function UnscriptedBanner() {
  const t = useTranslations("badges");
  return (
    <div
      data-testid="unscripted-banner"
      className="bg-moss/10 border border-moss/30 rounded px-3 py-1.5 text-sm text-moss mb-3"
    >
      {t("unscriptedBanner")}
    </div>
  );
}
