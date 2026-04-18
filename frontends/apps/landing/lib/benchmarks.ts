import { z } from "zod";

const Metric = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string(),
});

const BenchmarksSchema = z.object({
  schemaVersion: z.literal(1),
  metrics: z.array(Metric).min(1),
});

export type Benchmarks = z.infer<typeof BenchmarksSchema>;

export function parseBenchmarks(raw: unknown): Benchmarks {
  return BenchmarksSchema.parse(raw);
}
