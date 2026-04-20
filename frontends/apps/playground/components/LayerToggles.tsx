// components/LayerToggles.tsx
"use client";

import { useTranslations } from "next-intl";

interface Props {
  showBBox: boolean;
  setBBox: (v: boolean) => void;
  showPose: boolean;
  setPose: (v: boolean) => void;
  showNarr: boolean;
  setNarr: (v: boolean) => void;
}

export function LayerToggles({ showBBox, setBBox, showPose, setPose, showNarr, setNarr }: Props) {
  const t = useTranslations("layers");
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-ink">{t("title")}</h4>
      <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[32px]">
        <input
          type="checkbox"
          checked={showBBox}
          onChange={(e) => setBBox(e.target.checked)}
          className="w-4 h-4 accent-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        />
        {t("tracks")}
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[32px]">
        <input
          type="checkbox"
          checked={showPose}
          onChange={(e) => setPose(e.target.checked)}
          className="w-4 h-4 accent-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        />
        {t("poses")}
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[32px]">
        <input
          type="checkbox"
          checked={showNarr}
          onChange={(e) => setNarr(e.target.checked)}
          className="w-4 h-4 accent-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        />
        {t("narratives")}
      </label>
    </div>
  );
}
