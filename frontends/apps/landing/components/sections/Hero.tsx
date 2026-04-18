import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionShell } from "@purrai/ui";

export function Hero() {
  const t = useTranslations("hero");
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
        <div>
          <h1 id="section-01-heading" className="font-serif text-hero">{t("wordmark")}</h1>
          <p className="mt-4 font-serif-sc text-h2 text-ink">{t("tagline")}</p>
          <p className="mt-2 text-body text-mute">{t("subhead")}</p>
        </div>
      </div>
    </SectionShell>
  );
}
