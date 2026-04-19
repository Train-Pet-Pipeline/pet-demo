// components/CanvasOverlay.tsx
"use client";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { findFrameAt } from "@/lib/frame-lookup";

interface TrackFrame { t: number; tracks: { id: number; bbox: number[]; score: number }[]; }
interface PoseFrame { t: number; poses: { id: number; keypoints: number[][] }[]; }

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  tracks: { fps: number; frames: TrackFrame[] };
  poses: { fps: number; schema: string; frames: PoseFrame[] };
  showBBox: boolean;
  showPose: boolean;
  /** Used in tests to trigger a synchronous draw; in prod, internal rVFC loop drives this. */
  tick?: number;
}

const AP10K_SKELETON: [number, number][] = [
  [0, 2], [1, 2], [2, 3], [3, 4],
  [3, 5], [5, 6], [6, 7],
  [3, 8], [8, 9], [9, 10],
  [4, 11], [11, 12], [12, 13],
  [4, 14], [14, 15], [15, 16],
];

export function CanvasOverlay({ videoRef, tracks, poses, showBBox, showPose, tick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = video.clientWidth;
    const ch = video.clientHeight;
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;
    ctx.clearRect(0, 0, cw, ch);

    const sx = cw / (video.videoWidth || cw);
    const sy = ch / (video.videoHeight || ch);
    const t = video.currentTime;

    if (showBBox) {
      const f = findFrameAt(tracks.frames, t);
      if (f) {
        ctx.strokeStyle = "rgb(198,93,62)"; // @purrai/theme clay
        ctx.lineWidth = 2;
        for (const tr of f.tracks) {
          ctx.strokeRect(tr.bbox[0] * sx, tr.bbox[1] * sy,
                         tr.bbox[2] * sx, tr.bbox[3] * sy);
        }
      }
    }

    if (showPose) {
      const pf = findFrameAt(poses.frames, t);
      if (pf) {
        ctx.strokeStyle = "rgb(62,93,64)"; // moss
        ctx.fillStyle = "rgb(237,232,225)"; // cream
        ctx.lineWidth = 2;
        for (const p of pf.poses) {
          for (const [a, b] of AP10K_SKELETON) {
            const ka = p.keypoints[a], kb = p.keypoints[b];
            if (!ka || !kb) continue;
            if (ka[2] < 0.3 || kb[2] < 0.3) continue;
            ctx.beginPath();
            ctx.moveTo(ka[0] * sx, ka[1] * sy);
            ctx.lineTo(kb[0] * sx, kb[1] * sy);
            ctx.stroke();
          }
          for (const kp of p.keypoints) {
            if (kp[2] < 0.3) continue;
            ctx.beginPath();
            ctx.arc(kp[0] * sx, kp[1] * sy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }, [videoRef, tracks, poses, showBBox, showPose]);

  // `tick` prop lets tests force a synchronous draw; layer toggles trigger
  // a redraw here (the rVFC/timeupdate loop is set up once below with [] deps
  // so the continuous loop isn't re-created on every toggle change).
  useEffect(() => { draw(); }, [draw, tick]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof video.addEventListener !== "function") return;
    let stopped = false;
    const useRvfc = "requestVideoFrameCallback" in HTMLVideoElement.prototype;

    let cleanup: () => void;
    if (useRvfc) {
      const loop = () => {
        if (stopped) return;
        draw();
        video.requestVideoFrameCallback(loop);
      };
      video.requestVideoFrameCallback(loop);
      cleanup = () => { stopped = true; };
    } else {
      const onTimeUpdate = () => draw();
      video.addEventListener("timeupdate", onTimeUpdate);
      cleanup = () => {
        stopped = true;
        video.removeEventListener("timeupdate", onTimeUpdate);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
    return cleanup;
  }, [draw, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="canvas-overlay"
      data-active-layers={`${showBBox ? "bbox " : ""}${showPose ? "pose" : ""}`.trim()}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
