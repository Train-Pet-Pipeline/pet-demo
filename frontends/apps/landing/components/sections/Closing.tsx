import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionShell, EmailForm } from "@purrai/ui";

export function Closing() {
  const t = useTranslations("closing");
  return (
    <SectionShell id="section-08-closing" headingId="section-08-heading" className="relative min-h-[56.25vw]">
      <Image
        src="/images/closing.avif"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/0 via-cream/40 to-cream" />
      <div className="relative z-10 grid min-h-[56.25vw] place-items-center px-6 py-24 text-center">
        <div>
          <h2 id="section-08-heading" className="font-serif text-hero text-ink">{t("wordmark")}</h2>
          <p className="mt-4 font-serif-sc text-h2 text-ink">{t("tagline")}</p>
          <div className="mt-10 mx-auto max-w-sm">
            <EmailForm
              labelText={t("subscribe.label")}
              buttonText={t("subscribe.button")}
              successText={t("subscribe.success")}
              busyText={t("subscribe.busy")}
              errorText={t("subscribe.error")}
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
