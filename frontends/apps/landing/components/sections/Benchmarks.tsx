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
  const filled = (data?.metrics ?? []).filter((m) => m.value);
  const pending = (data?.metrics ?? []).filter((m) => !m.value);
  return (
    <SectionShell id="section-07-benchmarks" headingId="section-07-heading" className="px-6 py-24">
      <h2 id="section-07-heading" className="font-serif text-h1 text-ink">{t("heading")}</h2>
      <p className="mt-3 text-body text-mute max-w-2xl">{t("intro")}</p>
      {filled.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filled.map((m) => (
            <div key={m.key} className="rounded-md bg-bone p-8">
              <div className="text-caption text-mute">{t(`metrics.${m.key}.label`)}</div>
              <div className="mt-3 font-serif text-hero leading-none text-ink">
                {m.value}
                <span className="ml-0.5 text-h2 text-mute font-serif">{m.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {pending.length > 0 && (
        <p className="mt-8 text-caption text-mute">
          {t("metrics.updatingPrefix")}
          {pending.map((m) => t(`metrics.${m.key}.label`)).join(" · ")}
        </p>
      )}
    </SectionShell>
  );
}
