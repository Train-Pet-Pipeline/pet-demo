// components/ClipViewer.tsx
"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { IllustrationBadge, SchematicOverlay } from "@purrai/ui";
import { CanvasOverlay } from "./CanvasOverlay";
import { LayerToggles } from "./LayerToggles";
import { ChapterNav } from "./ChapterNav";
import { NarrativePanel } from "./NarrativePanel";
import { UnscriptedBanner } from "./UnscriptedBanner";
import { SourceBadge } from "./SourceBadge";
import { findChapterIndex } from "@/lib/chapter";

interface TrackFrame { t: number; tracks: { id: number; bbox: number[]; score: number }[]; }
interface PoseFrame { t: number; poses: { id: number; keypoints: number[][] }[]; }
interface NarrativeChapter { start: number; end: number; text: string; confidence: number; }

interface Props {
  slug: string;
  clip: { slug: string; title: string; source: "ai_generated" | "real_footage" };
  tracks: { fps: number; frames: TrackFrame[] };
  poses: { fps: number; schema: string; frames: PoseFrame[] };
  narratives: { chapters: NarrativeChapter[] };
}

export function ClipViewer({ slug, clip, tracks, poses, narratives }: Props) {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showBBox, setBBox] = useState(true);
  const [showPose, setPose] = useState(true);
  const [showNarr, setNarr] = useState(true);
  const [tick, setTick] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);

  const onTime = useCallback(() => {
    setTick((x) => x + 1);
    setChapterIdx(findChapterIndex(narratives.chapters, videoRef.current?.currentTime ?? 0));
  }, [narratives.chapters]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [onTime]);

  const jump = (t: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      setChapterIdx(findChapterIndex(narratives.chapters, t));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-6xl mx-auto">
      <div className="col-span-1 lg:col-span-2 relative">
        {clip.source === "real_footage" && <UnscriptedBanner />}
        <SchematicOverlay>
          <SourceBadge
            source={clip.source}
            aiLabel={t("badges.aiGenerated")}
            realLabel={t("badges.realFootage")}
          />
        </SchematicOverlay>
        <IllustrationBadge
          label={t("schematic.label")}
          aria={t("schematic.aria")}
        />
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
