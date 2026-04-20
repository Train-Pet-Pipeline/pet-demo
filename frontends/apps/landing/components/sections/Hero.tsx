import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@purrai/ui";

const PLAYGROUND_URL =
  process.env.NEXT_PUBLIC_PLAYGROUND_URL ?? "https://purrai-playground.vercel.app";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  return (
    <SectionShell id="section-01-hero" headingId="section-01-heading" className="relative h-screen min-h-[640px]">
      <Image
        src="/images/hero.avif"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/0 via-cream/40 to-cream" />
      <div className="relative z-10 grid h-full place-items-center px-6 text-center">
        <div className="max-w-2xl">
          <h1 id="section-01-heading" className="font-serif text-hero text-ink">{t("wordmark")}</h1>
          <p
            className="mt-5 font-serif-sc text-h2 text-ink"
            style={locale === "zh" ? { wordBreak: "keep-all" } : undefined}
          >
            {t("tagline")}
          </p>
          <p className="mt-3 text-body text-ink/70">{t("subhead")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a
              href={PLAYGROUND_URL}
              className="inline-flex items-center min-h-[44px] rounded-full bg-ink px-6 py-2.5 text-body text-cream transition-colors hover:bg-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
            >
              {t("primaryCta")}
            </a>
            <a
              href="#section-02-privacy"
              className="inline-flex items-center min-h-[44px] px-2 py-2 text-body text-ink underline underline-offset-4 hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 rounded"
            >
              {t("secondaryCta")}
            </a>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-caption text-ink/50">
        {t("scrollHint")}
      </div>
    </SectionShell>
  );
}
