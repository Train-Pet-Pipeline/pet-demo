import { useTranslations } from "next-intl";
import { SectionShell, SchematicOverlay } from "@purrai/ui";

const ABILITY_KEYS = ["01", "02", "03", "04"] as const;

/** Bounding-box icon — ability 01 detection */
function IconBoundingBox() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* corner brackets */}
      <path d="M8 20V8h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 8h12v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M48 36v12H36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 48H8V36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* center dot */}
      <circle cx="28" cy="28" r="4" fill="currentColor" />
    </svg>
  );
}

/** Path/trail icon — ability 02 tracking */
function IconTrail() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="44" r="4" fill="currentColor" opacity="0.35" />
      <circle cx="20" cy="36" r="4" fill="currentColor" opacity="0.55" />
      <circle cx="32" cy="26" r="4" fill="currentColor" opacity="0.75" />
      <circle cx="44" cy="14" r="5" fill="currentColor" />
      <path d="M10 44 Q16 38 20 36 Q26 30 32 26 Q38 20 44 14" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
    </svg>
  );
}

/** Skeleton/stick-figure icon — ability 03 pose */
function IconSkeleton() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* head */}
      <circle cx="28" cy="10" r="5" stroke="currentColor" strokeWidth="2.5" />
      {/* spine */}
      <line x1="28" y1="15" x2="28" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* shoulders */}
      <line x1="14" y1="20" x2="42" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* left arm */}
      <line x1="14" y1="20" x2="10" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* right arm */}
      <line x1="42" y1="20" x2="46" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* left leg */}
      <line x1="28" y1="34" x2="18" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* right leg */}
      <line x1="28" y1="34" x2="38" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* keypoints */}
      <circle cx="14" cy="20" r="2.5" fill="currentColor" />
      <circle cx="42" cy="20" r="2.5" fill="currentColor" />
      <circle cx="10" cy="32" r="2.5" fill="currentColor" />
      <circle cx="46" cy="32" r="2.5" fill="currentColor" />
      <circle cx="18" cy="50" r="2.5" fill="currentColor" />
      <circle cx="38" cy="50" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** Speech/text-lines icon — ability 04 narrative */
function IconNarrative() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* speech bubble */}
      <path
        d="M8 10h40a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H22l-8 8v-8H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* text lines */}
      <line x1="14" y1="20" x2="42" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="27" x2="36" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ABILITY_ICONS = {
  "01": <IconBoundingBox />,
  "02": <IconTrail />,
  "03": <IconSkeleton />,
  "04": <IconNarrative />,
} as const;

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
              <div className="aspect-square bg-cream rounded-md grid place-items-center text-clay">
                {ABILITY_ICONS[key]}
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
