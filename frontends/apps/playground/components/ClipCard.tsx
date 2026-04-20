// components/ClipCard.tsx
"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { IllustrationBadge, SchematicOverlay } from "@purrai/ui";
import type { ClipManifest } from "@/lib/artifacts";
import { SourceBadge } from "./SourceBadge";
import { locales } from "../i18n";

const { Link: IntlLink } = createSharedPathnamesNavigation({
  locales: [...locales],
  localePrefix: "as-needed",
});

export function ClipCard({ clip }: { clip: ClipManifest }) {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterUrl = `/artifacts/${clip.slug}/thumb.avif`;
  const videoUrl = `/artifacts/${clip.slug}/raw.mp4`;
  const play = () => { videoRef.current?.play(); };
  return (
    <div className={`block rounded-lg border p-4 ${clip.source === "real_footage" ? "border-moss-2" : "border-bone"}`}>
      <button
        type="button"
        aria-label={`${t("nav.viewDetail")} ${clip.title}`}
        onClick={play}
        className="block w-full aspect-video overflow-hidden relative"
      >
        <video
          ref={videoRef}
          data-testid="clip-video"
          src={videoUrl}
          poster={posterUrl}
          preload="none"
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <SchematicOverlay className="absolute inset-0">
          <SourceBadge
            source={clip.source}
            aiLabel={t("badges.aiGenerated")}
            realLabel={t("badges.realFootage")}
          />
        </SchematicOverlay>
        <IllustrationBadge
          label={t("schematic.label")}
          aria={t("schematic.aria")}
        />
      </button>
      <h3 className="font-serif text-ink mt-3">{clip.title}</h3>
      <IntlLink
        href={`/${clip.slug}`}
        className="text-xs underline mt-2 inline-flex items-center min-h-[44px]"
      >
        {t("nav.viewDetail")}
      </IntlLink>
    </div>
  );
}
