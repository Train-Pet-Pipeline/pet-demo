import { render } from "@testing-library/react";
import { act } from "react";
import { CanvasOverlay } from "@/components/CanvasOverlay";

function mockCtx() {
  const calls: string[] = [];
  const ctx: any = {
    clearRect: (...a: any[]) => calls.push(`clear`),
    strokeRect: (...a: any[]) => calls.push(`strokeRect ${a.join(",")}`),
    beginPath: () => calls.push("beginPath"),
    arc: (...a: any[]) => calls.push(`arc ${a.join(",")}`),
    moveTo: () => calls.push("moveTo"),
    lineTo: () => calls.push("lineTo"),
    stroke: () => calls.push("stroke"),
    fill: () => calls.push("fill"),
    fillRect: () => calls.push("fillRect"),
    set strokeStyle(_: any) {},
    set fillStyle(_: any) {},
    set lineWidth(_: any) {},
  };
  return { ctx, calls };
}

it("draws bbox when showBBox=true and findFrameAt returns frame", () => {
  const { ctx, calls } = mockCtx();
  HTMLCanvasElement.prototype.getContext = () => ctx as any;

  const videoRef = { current: { currentTime: 0.04, videoWidth: 320, videoHeight: 240,
    clientWidth: 320, clientHeight: 240 } as any };
  const tracks = { fps: 25, frames: [{ t: 0, tracks: [{ id: 1, bbox: [10, 20, 100, 200], score: 0.9 }] }] };
  const poses = { fps: 25, schema: "ap10k-17", frames: [{ t: 0, poses: [] }] };

  render(<CanvasOverlay videoRef={videoRef} tracks={tracks} poses={poses}
    showBBox={true} showPose={false} tick={123} />);
  expect(calls.some((c) => c.startsWith("strokeRect 10,20,100,200"))).toBe(true);
});

it("skips bbox draw when showBBox=false", () => {
  const { ctx, calls } = mockCtx();
  HTMLCanvasElement.prototype.getContext = () => ctx as any;
  const videoRef = { current: { currentTime: 0, videoWidth: 320, videoHeight: 240,
    clientWidth: 320, clientHeight: 240 } as any };
  const tracks = { fps: 25, frames: [{ t: 0, tracks: [{ id: 1, bbox: [1, 2, 3, 4], score: 0.9 }] }] };
  const poses = { fps: 25, schema: "ap10k-17", frames: [] };
  render(<CanvasOverlay videoRef={videoRef} tracks={tracks} poses={poses}
    showBBox={false} showPose={false} tick={1} />);
  expect(calls.some((c) => c.startsWith("strokeRect"))).toBe(false);
});
