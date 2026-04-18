"use client";

import { useTranslations } from "next-intl";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { SectionShell, SchematicOverlay } from "@purrai/ui";

const dimensions: { key: string; value: number }[] = [
  { key: "calm", value: 0.7 },
  { key: "alert", value: 0.5 },
  { key: "playful", value: 0.6 },
  { key: "anxious", value: 0.3 },
  { key: "affection", value: 0.8 },
  { key: "fatigue", value: 0.4 },
  { key: "appetite", value: 0.65 },
  { key: "vocal", value: 0.55 },
];

export function EmotionRadar() {
  const t = useTranslations("radar");
  const data = dimensions.map((d) => ({
    subject: t(`dimensions.${d.key}`),
    value: d.value,
  }));

  return (
    <SectionShell id="section-06-radar" headingId="section-06-heading" className="px-6 py-24">
      <h2 id="section-06-heading" className="font-serif text-h1 text-ink text-center">
        {t("intro")}
      </h2>
      <div className="mt-12 mx-auto max-w-xl">
        <SchematicOverlay>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 1]} tick={false} />
              <Radar dataKey="value" fill="currentColor" fillOpacity={0.3} stroke="currentColor" />
            </RadarChart>
          </ResponsiveContainer>
        </SchematicOverlay>
      </div>
    </SectionShell>
  );
}
