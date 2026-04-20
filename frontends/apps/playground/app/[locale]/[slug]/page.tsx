// app/[locale]/[slug]/page.tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import { parseManifestOrEmpty, loadTracks } from "@/lib/artifacts";
import { ClipViewer } from "@/components/ClipViewer";
import { locales } from "../../../i18n";

interface NarrativeChapter { start: number; end: number; text: string; confidence: number; }
interface NarrativesFile { chapters: NarrativeChapter[]; }

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

export async function generateStaticParams() {
  const p = path.join(process.cwd(), "public", "artifacts", "manifest.json");
  const m = await parseManifestOrEmpty(async () => JSON.parse(await fs.readFile(p, "utf-8")));
  const slugs = m.clips.map((c) => c.slug);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function Page({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  unstable_setRequestLocale(params.locale);
  const base = path.join(process.cwd(), "public", "artifacts");
  const manifest = await parseManifestOrEmpty(async () =>
    JSON.parse(await fs.readFile(path.join(base, "manifest.json"), "utf-8")));
  const clip = manifest.clips.find((c) => c.slug === params.slug);
  if (!clip) notFound();
  const dir = path.join(base, params.slug);
  const [tracks, poses, narratives] = await Promise.all([
    loadTracks(dir),
    readJson<{ fps: number; schema: string; frames: { t: number; poses: { id: number; keypoints: number[][] }[] }[] }>(path.join(dir, "poses.json")),
    readJson<NarrativesFile>(path.join(dir, "narratives.json")),
  ]);
  const localizedTitle = params.locale === "en" && clip.title_en ? clip.title_en : clip.title;
  return (
    <main>
      <h1 className="font-serif text-2xl p-6 max-w-6xl mx-auto">{localizedTitle}</h1>
      <ClipViewer slug={params.slug} clip={{ ...clip, title: localizedTitle }} tracks={tracks} poses={poses} narratives={narratives} />
    </main>
  );
}
