// app/real-sample/page.tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { parseManifestOrEmpty } from "@/lib/artifacts";

export default async function Page() {
  const m = await parseManifestOrEmpty(async () => {
    const p = path.join(process.cwd(), "public", "artifacts", "manifest.json");
    return JSON.parse(await fs.readFile(p, "utf-8"));
  });
  const real = m.clips.find((c) => c.source === "real_footage");
  if (!real) return <main className="p-8"><p>真实素材尚未入库</p></main>;
  redirect(`/playground/${real.slug}`);
}
