import { useTranslations } from "next-intl";
import { SectionShell, SchematicOverlay } from "@purrai/ui";

const ABILITY_KEYS = ["01", "02", "03", "04"] as const;

export function Abilities() {
  const t = useTranslations("abilities");
  const ts = useTranslations("schematic");
  return (
    <SectionShell id="section-05-abilities" headingId="section-05-heading" className="px-6 py-24">
      <h2 id="section-05-heading" className="font-serif text-h1 text-ink text-center">
        {t("intro")}
      </h2>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {ABILITY_KEYS.map((key) => (
          <div key={key} className="flex flex-col gap-4">
            <SchematicOverlay badgeLabel={ts("label")} badgeAria={ts("aria")}>
              <div className="aspect-square bg-cream rounded-md grid place-items-center">
                <span className="text-mute text-caption">{key}</span>
              </div>
            </SchematicOverlay>
            <h3 className="font-serif text-h2 text-ink">{t(`items.${key}.title`)}</h3>
            <p className="text-body text-mute">{t(`items.${key}.body`)}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
