// app/[slug]/page.tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { parseManifestOrEmpty } from "@/lib/artifacts";

export async function generateStaticParams() {
  const p = path.join(process.cwd(), "public", "artifacts", "manifest.json");
  try {
    const m = await parseManifestOrEmpty(async () => JSON.parse(await fs.readFile(p, "utf-8")));
    return m.clips.map((c) => ({ slug: c.slug }));
  } catch { return []; }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const p = path.join(process.cwd(), "public", "artifacts", "manifest.json");
  const m = await parseManifestOrEmpty(async () => JSON.parse(await fs.readFile(p, "utf-8")));
  const clip = m.clips.find((c) => c.slug === params.slug);
  if (!clip) notFound();
  return (
    <main className="p-8">
      <h1>{clip.title}</h1>
      <p className="text-ink/60">viewer 占位 (PR3 接入 CanvasOverlay + LayerToggles)</p>
    </main>
  );
}
