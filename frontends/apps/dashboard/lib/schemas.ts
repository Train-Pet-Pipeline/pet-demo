import { z } from "zod";

export const NarrativeSchema = z.object({
  frame: z.number().int().nonnegative(),
  time_s: z.number().nonnegative(),
  text: z.string(),
  confidence: z.number().min(0).max(1),
});

export const ClipSchema = z.object({
  video: z.string(),
  poster: z.string(),
  label: z.string(),
  narratives: z.array(NarrativeSchema),
});

export const NarrativesSchema = z.record(z.string(), ClipSchema);

export const BenchmarksSchema = z.object({
  mean_fps: z.number(),
  detector_ms: z.number(),
  tracker_ms: z.number(),
  reid_ms: z.number(),
  pose_ms: z.number(),
  narrative_ms: z.number(),
  pipeline_ms: z.number(),
  pipeline_mode: z.enum(["parallel", "serial", "fake"]),
  total_frames: z.number().int().nonnegative(),
  total_seconds: z.number().nonnegative(),
});

export const GoldenSchema = z.object({
  narratives: NarrativesSchema,
  benchmarks: BenchmarksSchema,
});

export type Narrative = z.infer<typeof NarrativeSchema>;
export type Clip = z.infer<typeof ClipSchema>;
export type Narratives = z.infer<typeof NarrativesSchema>;
export type Benchmarks = z.infer<typeof BenchmarksSchema>;
export type Golden = z.infer<typeof GoldenSchema>;
