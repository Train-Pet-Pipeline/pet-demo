import { unstable_setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { PrivacyFirst } from "@/components/sections/PrivacyFirst";
import { PainPoint } from "@/components/sections/PainPoint";
import { Alerts } from "@/components/sections/Alerts";
import { Abilities } from "@/components/sections/Abilities";
import { EmotionRadar } from "@/components/sections/EmotionRadar";
import { Benchmarks } from "@/components/sections/Benchmarks";
import { Closing } from "@/components/sections/Closing";

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <main>
      <a href="#section-01-hero" className="sr-only focus:not-sr-only">跳到主内容</a>
      <Hero />
      <PrivacyFirst />
      <PainPoint />
      <Alerts />
      <Abilities />
      <EmotionRadar />
      <Benchmarks />
      <Closing />
    </main>
  );
}
