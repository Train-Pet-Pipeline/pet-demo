import { NarrativesSchema, BenchmarksSchema, type Narratives, type Benchmarks } from "@/lib/schemas";
import { ARTIFACTS_BASE } from "@/config";
import { readFile } from "node:fs/promises";
import path from "node:path";

export function parseNarratives(raw: unknown): Narratives {
  return NarrativesSchema.parse(raw);
}

export function parseBenchmarks(raw: unknown): Benchmarks {
  return BenchmarksSchema.parse(raw);
}

export async function loadNarratives(): Promise<Narratives> {
  const res = await fetch(`${ARTIFACTS_BASE}/narratives.json`);
  if (!res.ok) throw new Error(`narratives.json load failed: ${res.status}`);
  return parseNarratives(await res.json());
}

export async function loadBenchmarks(): Promise<Benchmarks> {
  const res = await fetch(`${ARTIFACTS_BASE}/benchmarks.json`);
  if (!res.ok) throw new Error(`benchmarks.json load failed: ${res.status}`);
  return parseBenchmarks(await res.json());
}

export async function loadNarrativesFromDisk(): Promise<Narratives> {
  const p = path.join(process.cwd(), "public", "artifacts", "narratives.json");
  return parseNarratives(JSON.parse(await readFile(p, "utf-8")));
}

export async function loadBenchmarksFromDisk(): Promise<Benchmarks> {
  const p = path.join(process.cwd(), "public", "artifacts", "benchmarks.json");
  return parseBenchmarks(JSON.parse(await readFile(p, "utf-8")));
}
