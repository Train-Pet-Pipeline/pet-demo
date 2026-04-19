export interface TimedFrame { t: number; }

export function findFrameAt<T extends TimedFrame>(
  frames: readonly T[], t: number,
): T | undefined {
  if (frames.length === 0) return undefined;
  if (t <= frames[0].t) return frames[0];
  if (t >= frames[frames.length - 1].t) return frames[frames.length - 1];
  let lo = 0, hi = frames.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >>> 1;
    if (frames[mid].t <= t) lo = mid; else hi = mid;
  }
  return frames[lo];
}
