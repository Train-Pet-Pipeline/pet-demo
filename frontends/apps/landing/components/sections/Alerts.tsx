import { useTranslations } from "next-intl";
import { SectionShell } from "@purrai/ui";

const ALERT_KEYS = ["01", "02", "03", "04", "05", "06"] as const;

export function Alerts() {
  const t = useTranslations("alerts");
  return (
    <SectionShell id="section-04-alerts" headingId="section-04-heading" className="px-6 py-24">
      <h2 id="section-04-heading" className="font-serif text-h1 text-ink text-center">
        {t("intro")}
      </h2>
      <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {ALERT_KEYS.map((key) => (
          <article key={key} className="relative pl-5 border-l border-ink/10 transition-colors hover:border-clay/60">
            <span className="font-serif text-caption tracking-[0.2em] text-clay/80 block mb-2">
              {`— ${key}`}
            </span>
            <h3 className="font-serif text-h2 text-ink leading-tight">{t(`items.${key}.title`)}</h3>
            <p className="mt-3 text-body text-mute leading-relaxed">{t(`items.${key}.body`)}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
