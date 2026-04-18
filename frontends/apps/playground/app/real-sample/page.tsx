// app/real-sample/page.tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import { parseManifestOrEmpty } from "@/lib/artifacts";

export default async function Page() {
  const m = await parseManifestOrEmpty(async () => {
    const p = path.join(process.cwd(), "public", "artifacts", "manifest.json");
    return JSON.parse(await fs.readFile(p, "utf-8"));
  });
  const real = m.clips.find((c) => c.source === "real_footage");
  if (!real) return <main className="p-8"><p>真实素材尚未入库</p></main>;
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl mb-4">{real.title}</h1>
      <p className="text-ink/70">{/* UnscriptedBanner placeholder for PR3 */}</p>
      <p className="mt-4"><a href={`/playground/${real.slug}`} className="underline">进入详情</a></p>
    </main>
  );
}
