// components/ClipCard.tsx
"use client";
import { useRef } from "react";
import Link from "next/link";
import { IllustrationBadge, SchematicOverlay } from "@purrai/ui";
import type { ClipManifest } from "@/lib/artifacts";
import { SourceBadge } from "./SourceBadge";

export function ClipCard({ clip }: { clip: ClipManifest }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterUrl = `/artifacts/${clip.slug}/thumb.avif`;
  const videoUrl = `/artifacts/${clip.slug}/raw.mp4`;
  const play = () => { videoRef.current?.play(); };
  return (
    <div className="block rounded-lg border border-bone p-4">
      <button
        type="button"
        aria-label={`播放 ${clip.title}`}
        onClick={play}
        className="block w-full aspect-video overflow-hidden relative"
      >
        <video
          ref={videoRef}
          data-testid="clip-video"
          src={videoUrl}
          poster={posterUrl}
          preload="metadata"
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <SchematicOverlay className="absolute inset-0">
          <SourceBadge source={clip.source} />
        </SchematicOverlay>
        <IllustrationBadge />
      </button>
      <h3 className="font-serif text-ink mt-3">{clip.title}</h3>
      <Link href={`/playground/${clip.slug}`} className="text-xs underline mt-2 inline-block">
        查看详情
      </Link>
    </div>
  );
}
