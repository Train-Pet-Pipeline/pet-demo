import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { loadManifest, resolveOutputPath, type ManifestEntry } from "./manifest";
import { DoubaoProvider } from "./providers/doubao";
import { UnsplashProvider } from "./providers/unsplash";
import type { Provider } from "./providers/types";
import { toAvif } from "./compress";

const MANIFEST = path.resolve(process.cwd(), "manifest.yaml");

function getProvider(name: string): Provider {
  if (name === "doubao") return new DoubaoProvider();
  if (name === "unsplash") return new UnsplashProvider();
  throw new Error(`unknown provider ${name}`);
}

async function readPrompt(promptFile: string): Promise<string> {
  const file = path.resolve(path.dirname(MANIFEST), promptFile);
  const raw = await fs.readFile(file, "utf8");
  return raw.replace(/^#.*$/gm, "").trim();
}

async function generateOne(e: ManifestEntry, manifestRoot: string): Promise<void> {
  const prompt = await readPrompt(e.promptFile);
  const order: string[] = [e.provider, ...(e.providerFallback ? [e.providerFallback] : [])];
  let lastErr: unknown;
  for (const name of order) {
    try {
      const p = getProvider(name);
      const result = await p.generate({ prompt, aspect: e.aspect, width: e.width });
      const avif = await toAvif(result.bytes, e.width);
      const outAbs = resolveOutputPath(MANIFEST, await loadManifest(MANIFEST), e);
      await fs.mkdir(path.dirname(outAbs), { recursive: true });
      await fs.writeFile(outAbs, avif);
      console.log(`[gen-assets] ${e.id} via ${p.name} → ${path.relative(manifestRoot, outAbs)}`);
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`[gen-assets] ${e.id} via ${name} failed: ${(err as Error).message}`);
    }
  }
  throw new Error(`[gen-assets] ${e.id} all providers failed: ${(lastErr as Error)?.message}`);
}

async function main() {
  const m = await loadManifest(MANIFEST);
  const filter = process.argv[2];
  const entries = filter ? m.entries.filter((e) => e.id === filter) : m.entries;
  if (entries.length === 0) {
    console.error(`no entries match ${filter ?? "<all>"}`);
    process.exit(1);
  }
  const root = path.dirname(MANIFEST);
  for (const e of entries) await generateOne(e, root);
}

main().catch((e) => { console.error(e); process.exit(1); });
