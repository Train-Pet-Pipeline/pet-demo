import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";

const Entry = z.object({
  id: z.string().min(1),
  promptFile: z.string().min(1),
  output: z.string().min(1),
  provider: z.enum(["doubao", "unsplash"]),
  providerFallback: z.enum(["doubao", "unsplash"]).optional(),
  aspect: z.string().regex(/^\d+:\d+$/),
  width: z.number().int().positive(),
});

const Manifest = z.object({
  version: z.literal(1),
  outputRoot: z.string().min(1),
  entries: z.array(Entry).min(1),
});

export type ManifestEntry = z.infer<typeof Entry>;
export type Manifest = z.infer<typeof Manifest>;

export async function loadManifest(file: string): Promise<Manifest> {
  const raw = await fs.readFile(file, "utf8");
  const parsed = YAML.parse(raw);
  return Manifest.parse(parsed);
}

export function resolveOutputPath(manifestFile: string, m: Manifest, e: ManifestEntry): string {
  return path.resolve(path.dirname(manifestFile), m.outputRoot, e.output);
}
