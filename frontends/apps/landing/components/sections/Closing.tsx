import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionShell, EmailForm } from "@purrai/ui";

const PLAYGROUND_URL =
  process.env.NEXT_PUBLIC_PLAYGROUND_URL ?? "https://purrai-playground.vercel.app";

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
          <a
            href={PLAYGROUND_URL}
            className="mt-6 inline-flex items-center min-h-[44px] px-4 py-2 text-ink underline underline-offset-4 hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 rounded"
          >
            {t("playgroundCta")}
          </a>
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
