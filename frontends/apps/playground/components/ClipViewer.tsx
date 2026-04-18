// components/ClipViewer.tsx
"use client";
import { useRef, useState, useEffect } from "react";
import { IllustrationBadge, SchematicOverlay } from "@purrai/ui";
import { CanvasOverlay } from "./CanvasOverlay";
import { LayerToggles } from "./LayerToggles";
import { ChapterNav } from "./ChapterNav";
import { NarrativePanel } from "./NarrativePanel";
import { UnscriptedBanner } from "./UnscriptedBanner";
import { SourceBadge } from "./SourceBadge";
import { findChapterIndex } from "@/lib/chapter";

interface Props {
  slug: string;
  clip: { slug: string; title: string; source: "ai_generated" | "real_footage" };
  tracks: any;
  poses: any;
  narratives: { chapters: { start: number; end: number; text: string; confidence: number }[] };
}

export function ClipViewer({ slug, clip, tracks, poses, narratives }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showBBox, setBBox] = useState(true);
  const [showPose, setPose] = useState(true);
  const [showNarr, setNarr] = useState(true);
  const [tick, setTick] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setTick((x) => x + 1);
      setChapterIdx(findChapterIndex(narratives.chapters, v.currentTime));
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  const jump = (t: number) => { if (videoRef.current) videoRef.current.currentTime = t; };

  return (
    <div className="grid grid-cols-3 gap-6 p-6 max-w-6xl mx-auto">
      <div className="col-span-2 relative">
        {clip.source === "real_footage" && <UnscriptedBanner />}
        <SchematicOverlay>
          <SourceBadge source={clip.source} />
        </SchematicOverlay>
        <IllustrationBadge />
        <video
          ref={videoRef}
          src={`/artifacts/${slug}/raw.mp4`}
          poster={`/artifacts/${slug}/thumb.avif`}
          controls
          playsInline
          className="w-full"
        />
        <CanvasOverlay videoRef={videoRef} tracks={tracks} poses={poses}
          showBBox={showBBox} showPose={showPose} tick={tick} />
      </div>
      <aside className="space-y-6">
        <LayerToggles
          showBBox={showBBox} setBBox={setBBox}
          showPose={showPose} setPose={setPose}
          showNarr={showNarr} setNarr={setNarr}
        />
        <ChapterNav chapters={narratives.chapters} currentIdx={chapterIdx} onJump={jump} />
        {showNarr && <NarrativePanel chapter={narratives.chapters[chapterIdx]} />}
      </aside>
    </div>
  );
}
