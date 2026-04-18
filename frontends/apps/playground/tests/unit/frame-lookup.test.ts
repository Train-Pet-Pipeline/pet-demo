import { describe, it, expect } from "vitest";
import { findFrameAt } from "@/lib/frame-lookup";

const frames = [
  { t: 0.0, tracks: [] },
  { t: 0.04, tracks: [] },
  { t: 0.08, tracks: [] },
  { t: 0.12, tracks: [] },
];

describe("findFrameAt", () => {
  it("exact match returns the frame", () => {
    expect(findFrameAt(frames, 0.08)?.t).toBe(0.08);
  });
  it("returns nearest lower when between", () => {
    expect(findFrameAt(frames, 0.10)?.t).toBe(0.08);
  });
  it("before first returns first", () => {
    expect(findFrameAt(frames, -1)?.t).toBe(0.0);
  });
  it("after last returns last", () => {
    expect(findFrameAt(frames, 99)?.t).toBe(0.12);
  });
  it("empty returns undefined", () => {
    expect(findFrameAt([], 0)).toBeUndefined();
  });
});
