import { readFile } from "node:fs/promises";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { SectionShell } from "@purrai/ui";
import { parseBenchmarks } from "@/lib/benchmarks";

async function loadBenchmarks() {
  const file = path.join(process.cwd(), "public/artifacts/benchmarks.json");
  try {
    const raw = JSON.parse(await readFile(file, "utf8"));
    return parseBenchmarks(raw);
  } catch {
    return null;
  }
}

export async function Benchmarks({ locale }: { locale: string }) {
  const [data, t] = await Promise.all([
    loadBenchmarks(),
    getTranslations({ locale, namespace: "benchmarks" }),
  ]);
  return (
    <SectionShell id="section-07-benchmarks" headingId="section-07-heading" className="px-6 py-24">
      <h2 id="section-07-heading" className="font-serif text-h1 text-ink">{t("heading")}</h2>
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {(data?.metrics ?? []).map((m) => (
          <div key={m.key} className="rounded-md bg-bone p-6">
            <div className="text-caption text-mute">{t(`metrics.${m.key}.label`)}</div>
            <div className="mt-2 font-serif text-h1 text-ink">{m.value ? `${m.value}${m.unit}` : t("metrics.updating")}</div>
          </div>
        ))}
        {!data && <p className="text-mute">{t("metrics.updating")}</p>}
      </div>
    </SectionShell>
  );
}
