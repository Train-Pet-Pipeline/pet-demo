// tests/fixtures/generate-fixtures.mjs
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "artifacts-test");
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

// Spec §4 gallery is 2×2 — fixture MUST provide 4 AI clips so gallery.spec
// can assert 2×2 layout deterministically, plus 1 real clip for page 2.
const clips = [
  { slug: "fixture-ai-1", source: "ai_generated", title: "Fixture AI 1", title_en: "Fixture AI 1", dur: 2, chapters: [[0, 1], [1, 2]] },
  { slug: "fixture-ai-2", source: "ai_generated", title: "Fixture AI 2", title_en: "Fixture AI 2", dur: 2, chapters: null },
  { slug: "fixture-ai-3", source: "ai_generated", title: "Fixture AI 3", title_en: "Fixture AI 3", dur: 2, chapters: null },
  { slug: "fixture-ai-4", source: "ai_generated", title: "Fixture AI 4", title_en: "Fixture AI 4", dur: 2, chapters: null },
  { slug: "fixture-real", source: "real_footage", title: "Fixture real", title_en: "Fixture real", dur: 2, chapters: null },
];

function genVideo(outPath, dur) {
  mkdirSync(dirname(outPath), { recursive: true });
  // 320x240 black, 25fps, silent — keeps bundle <200KB
  execSync(
    `ffmpeg -f lavfi -i color=c=black:s=320x240:d=${dur} -c:v libx264 -r 25 -pix_fmt yuv420p -y "${outPath}"`,
    { stdio: "ignore" },
  );
}

function fakeTracks(dur) {
  const frames = [];
  for (let i = 0; i < dur * 25; i++) {
    frames.push({ t: +(i / 25).toFixed(4),
      tracks: [{ id: 1, bbox: [50 + i, 60, 100, 140], score: 0.9 }] });
  }
  return { fps: 25, frames };
}

function fakePoses(dur) {
  const frames = [];
  const kpts = Array.from({ length: 17 }, (_, i) => [100 + i, 80 + i, 0.9]);
  for (let i = 0; i < dur * 25; i++) {
    frames.push({ t: +(i / 25).toFixed(4), poses: [{ id: 1, keypoints: kpts }] });
  }
  return { fps: 25, schema: "ap10k-17", frames };
}

function fakeNarratives(chapters, dur) {
  if (!chapters) return { chapters: [{ start: 0, end: dur, text: "真实片段全片 narrative", confidence: 0.7 }] };
  return { chapters: chapters.map(([s, e], i) => ({
    start: s, end: e, text: `Chapter ${i + 1}`, confidence: 0.8,
  })) };
}

const manifestEntries = [];
for (const c of clips) {
  const dir = join(OUT, c.slug);
  mkdirSync(dir, { recursive: true });
  genVideo(join(dir, "raw.mp4"), c.dur);
  // Use libsvtav1 (widely available across ffmpeg builds); libaom-av1 is not
  // guaranteed on ubuntu-latest CI runners.
  execSync(`ffmpeg -f lavfi -i color=c=0x888888:s=8x8:d=0.1 -frames:v 1 -c:v libsvtav1 -crf 40 -y "${join(dir, "thumb.avif")}"`, { stdio: "ignore" });
  writeFileSync(join(dir, "tracks.json"), JSON.stringify(fakeTracks(c.dur)));
  writeFileSync(join(dir, "poses.json"), JSON.stringify(fakePoses(c.dur)));
  writeFileSync(join(dir, "narratives.json"), JSON.stringify(fakeNarratives(c.chapters, c.dur)));
  manifestEntries.push({
    slug: c.slug, title: c.title, title_en: c.title_en, source: c.source, duration_s: c.dur,
    chapter_count: c.chapters?.length ?? 1, width: 320, height: 240, tags: [],
  });
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({
  version: "test", generated_at: new Date().toISOString(), clips: manifestEntries,
}, null, 2));

// Report size
execSync(`du -sh "${OUT}"`, { stdio: "inherit" });
