// app/[locale]/page.tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ClipCard } from "@/components/ClipCard";
import { parseManifestOrEmpty } from "@/lib/artifacts";
import { locales } from "../../i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function loadManifest() {
  return parseManifestOrEmpty(async () => {
    const p = path.join(process.cwd(), "public", "artifacts", "manifest.json");
    const raw = await fs.readFile(p, "utf-8");
    return JSON.parse(raw);
  });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "state" });
  const { clips } = await loadManifest();
  if (clips.length === 0) {
    return <main className="p-8"><p>{t("empty")}</p></main>;
  }
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="font-serif text-3xl mb-8">Playground</h1>
      <div className="grid grid-cols-2 gap-6">
        {clips.map((c) => (
          <ClipCard
            key={c.slug}
            clip={{ ...c, title: locale === "en" && c.title_en ? c.title_en : c.title }}
          />
        ))}
      </div>
    </main>
  );
}
