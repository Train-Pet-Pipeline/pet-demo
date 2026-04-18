import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionShell, SchematicOverlay } from "@purrai/ui";

export function PrivacyFirst() {
  const t = useTranslations("privacy");
  const steps = [
    { key: "step1", src: "/images/privacy/step-1.avif" },
    { key: "step2", src: "/images/privacy/step-2.avif" },
    { key: "step3", src: "/images/privacy/step-3.avif" },
  ] as const;

  return (
    <SectionShell id="section-02-privacy" headingId="section-02-heading" className="px-6 py-24">
      <h2 id="section-02-heading" className="font-serif text-h1 text-ink text-center">
        {t("intro")}
      </h2>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map(({ key, src }) => (
          <div key={key} className="flex flex-col items-center gap-4">
            <SchematicOverlay className="w-full">
              <div className="relative aspect-square w-full">
                <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
              </div>
            </SchematicOverlay>
            <p className="text-body text-ink text-center">{t(key)}</p>
          </div>
        ))}
      </div>
      <p className="mt-12 text-body text-mute text-center">{t("outro")}</p>
    </SectionShell>
  );
}
