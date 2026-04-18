// frontends/scripts/gen-assets/stitch-videos.mjs
#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VIDEOS = join(root, "videos");
const STITCHED = join(VIDEOS, "stitched");
mkdirSync(STITCHED, { recursive: true });

const plan = JSON.parse(readFileSync(join(VIDEOS, "stitch-plan.json"), "utf-8"));

for (const [slug, parts] of Object.entries(plan)) {
  // normalize each part
  const normalized = [];
  for (const [i, p] of parts.entries()) {
    const src = join(VIDEOS, p);
    if (!existsSync(src)) { console.error(`missing ${src}`); process.exit(1); }
    const dst = join(STITCHED, `${slug}.part${i}.mp4`);
    execFileSync("ffmpeg", [
      "-y", "-i", src,
      "-c:v", "libx264", "-r", "25",
      "-s", "1280x720", "-pix_fmt", "yuv420p",
      "-an", dst,
    ], { stdio: "inherit" });
    normalized.push(dst);
  }
  const listFile = join(STITCHED, `${slug}.list.txt`);
  const esc = (p) => p.replace(/'/g, "'\\''");
  writeFileSync(listFile, normalized.map((p) => `file '${esc(p)}'`).join("\n"));
  const out = join(STITCHED, `${slug}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0",
    "-i", listFile,
    "-c", "copy", out,
  ], { stdio: "inherit" });
  console.log(`stitched ${slug} -> ${out}`);
}
