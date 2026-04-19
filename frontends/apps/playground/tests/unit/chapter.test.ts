import { describe, it, expect } from "vitest";
import { findChapterIndex } from "@/lib/chapter";

const chapters = [
  { start: 0, end: 8, text: "a", confidence: 0.9 },
  { start: 8, end: 16, text: "b", confidence: 0.9 },
  { start: 16, end: 24, text: "c", confidence: 0.9 },
];

describe("findChapterIndex", () => {
  it("t in first chapter", () => expect(findChapterIndex(chapters, 3)).toBe(0));
  it("t on boundary belongs to next", () => expect(findChapterIndex(chapters, 8)).toBe(1));
  it("t past last clamps to last", () => expect(findChapterIndex(chapters, 99)).toBe(2));
  it("single chapter always 0", () => expect(findChapterIndex([chapters[0]], 100)).toBe(0));
  it("empty returns -1", () => expect(findChapterIndex([], 0)).toBe(-1));
});
