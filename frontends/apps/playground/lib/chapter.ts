// lib/chapter.ts
export interface Chapter { start: number; end: number; text: string; confidence: number; }

export function findChapterIndex(chapters: readonly Chapter[], t: number): number {
  if (chapters.length === 0) return -1;
  for (let i = 0; i < chapters.length; i++) {
    if (t < chapters[i].end) return i;
  }
  return chapters.length - 1;
}
