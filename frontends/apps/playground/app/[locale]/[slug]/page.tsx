// app/[slug]/page.tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { parseManifestOrEmpty, loadTracks } from "@/lib/artifacts";
import { ClipViewer } from "@/components/ClipViewer";

interface NarrativeChapter { start: number; end: number; text: string; confidence: number; }
interface NarrativesFile { chapters: NarrativeChapter[]; }

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

export async function generateStaticParams() {
  const p = path.join(process.cwd(), "public", "artifacts", "manifest.json");
  const m = await parseManifestOrEmpty(async () => JSON.parse(await fs.readFile(p, "utf-8")));
  return m.clips.map((c) => ({ slug: c.slug }));
}

export default async function Page({ params }: { params: { slug: string } }) {
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
  return (
    <main>
      <h1 className="font-serif text-2xl p-6 max-w-6xl mx-auto">{clip.title}</h1>
      <ClipViewer slug={params.slug} clip={clip} tracks={tracks} poses={poses} narratives={narratives} />
    </main>
  );
}
