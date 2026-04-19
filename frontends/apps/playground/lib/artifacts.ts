// lib/artifacts.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

export const clipManifestSchema = z.object({
  slug: z.string(),
  title: z.string(),
  source: z.enum(["ai_generated", "real_footage"]),
  duration_s: z.number(),
  chapter_count: z.number().int().min(1),
  width: z.number().int(),
  height: z.number().int(),
  tags: z.array(z.string()),
});

export const manifestSchema = z.object({
  version: z.string(),
  generated_at: z.string(),
  clips: z.array(clipManifestSchema),
});

export type ClipManifest = z.infer<typeof clipManifestSchema>;
export type Manifest = z.infer<typeof manifestSchema>;

// Tracks schema — exercised in PR3
export const trackEntrySchema = z.object({
  id: z.number().int(),     // was z.string() — mismatch with serialize_tracks int output
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  score: z.number(),
});
export const tracksFrameSchema = z.object({
  t: z.number(),
  tracks: z.array(trackEntrySchema),
});
export const tracksFileSchema = z.object({
  fps: z.number(),
  frames: z.array(tracksFrameSchema),
});
export type TracksFile = z.infer<typeof tracksFileSchema>;

// Poses schema — exercised in PR3
export const poseEntrySchema = z.object({
  id: z.number().int(),
  keypoints: z.array(z.tuple([z.number(), z.number(), z.number()])),
});
export const posesFrameSchema = z.object({
  t: z.number(),
  poses: z.array(poseEntrySchema),
});
export const posesFileSchema = z.object({
  fps: z.number(),
  schema: z.literal("ap10k-17"),
  frames: z.array(posesFrameSchema),
});
export type PosesFile = z.infer<typeof posesFileSchema>;

// Narratives schema — exercised in PR3
export const narrativeChapterSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
  confidence: z.number(),
});
export const narrativesFileSchema = z.object({
  clip_duration_s: z.number(),
  chapters: z.array(narrativeChapterSchema),
});
export type NarrativesFile = z.infer<typeof narrativesFileSchema>;

export async function loadTracks(dir: string): Promise<TracksFile> {
  const stitchedPath = path.join(dir, "tracks.stitched.json");
  const plainPath = path.join(dir, "tracks.json");
  try {
    const raw = await fs.readFile(stitchedPath, "utf-8");
    return tracksFileSchema.parse(JSON.parse(raw));
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") throw err;
  }
  const raw = await fs.readFile(plainPath, "utf-8");
  return tracksFileSchema.parse(JSON.parse(raw));
}

export async function parseManifestOrEmpty(
  load: () => Promise<unknown>,
): Promise<Manifest> {
  try {
    const raw = await load();
    const parsed = manifestSchema.safeParse(raw);
    if (!parsed.success) {
      return { version: "", generated_at: "", clips: [] };
    }
    return parsed.data;
  } catch {
    return { version: "", generated_at: "", clips: [] };
  }
}
