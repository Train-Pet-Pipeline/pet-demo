import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoPlayer } from "../src/VideoPlayer";

describe("VideoPlayer", () => {
  it("renders a <video> with the given src and poster", () => {
    render(<VideoPlayer src="/artifacts/overlays/clip_1.mp4" poster="/artifacts/posters/clip_1.jpg" />);
    const video = screen.getByTestId("video-player") as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video.querySelector("source")?.getAttribute("src")).toBe(
      "/artifacts/overlays/clip_1.mp4",
    );
    expect(video.poster).toContain("/artifacts/posters/clip_1.jpg");
  });

  it("defaults to muted/playsInline/loop/autoplay when hero=true", () => {
    render(<VideoPlayer src="/x.mp4" hero />);
    const video = screen.getByTestId("video-player") as HTMLVideoElement;
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.controls).toBe(false);
  });

  it("shows controls and no autoplay when hero=false", () => {
    render(<VideoPlayer src="/x.mp4" />);
    const video = screen.getByTestId("video-player") as HTMLVideoElement;
    expect(video.controls).toBe(true);
    expect(video.autoplay).toBe(false);
  });
});
