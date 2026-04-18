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
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ALERT_KEYS.map((key) => (
          <div key={key} className="bg-bone rounded-md p-6">
            <h3 className="font-serif text-h2 text-ink">{t(`items.${key}.title`)}</h3>
            <p className="mt-2 text-body text-mute">{t(`items.${key}.body`)}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
