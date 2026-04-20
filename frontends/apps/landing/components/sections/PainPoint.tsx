import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionShell } from "@purrai/ui";

export function PainPoint() {
  const t = useTranslations("painPoint");
  return (
    <SectionShell id="section-03-painpoint" headingId="section-03-heading" className="relative min-h-[400px]">
      <Image
        src="/images/pain-point.avif"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 to-ink/60" />
      <div className="relative z-10 grid min-h-[400px] place-items-center px-6 py-24 text-center">
        <div>
          <h2 id="section-03-heading" className="font-serif text-h1 text-cream">{t("headline")}</h2>
          <p className="mt-6 text-body text-bone mx-auto max-w-2xl">{t("body")}</p>
        </div>
      </div>
    </SectionShell>
  );
}
