"use client";

import { useRef, useState } from "react";
import { VideoPlayer } from "@purrai/ui";
import type { Narratives } from "@/lib/schemas";
import { ARTIFACTS_BASE } from "@/config";

export function ClipsTab({ narratives }: { narratives: Narratives }) {
  const ids = Object.keys(narratives);
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const active = narratives[activeId];
  if (!active) return <p className="text-mute">no clips</p>;

  function seek(t: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      videoRef.current.play().catch(() => undefined);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <ul className="space-y-3">
        {ids.map((id) => {
          const c = narratives[id]!;
          const isActive = id === activeId;
          return (
            <li key={id}>
              <button
                onClick={() => setActiveId(id)}
                className={`w-full rounded-lg border p-2 text-left transition-colors ${
                  isActive ? "border-clay bg-cream" : "border-mute-soft bg-bone"
                }`}
              >
                <img
                  src={`${ARTIFACTS_BASE}/${c.poster}`}
                  alt={c.label}
                  className="mb-2 aspect-video w-full rounded-md object-cover"
                />
                <div className="text-caption text-mute">{id}</div>
                <div className="font-serif-sc text-body text-ink">{c.label}</div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="space-y-4">
        <VideoPlayer
          ref={videoRef}
          src={`${ARTIFACTS_BASE}/${active.video}`}
          poster={`${ARTIFACTS_BASE}/${active.poster}`}
          className="aspect-video w-full rounded-xl bg-bone"
        />
        <ol className="space-y-2">
          {active.narratives.map((n, i) => (
            <li
              key={`${n.frame}-${i}`}
              className="flex items-center gap-3 rounded-md border border-mute-soft bg-cream px-3 py-2"
            >
              <button
                onClick={() => seek(n.time_s)}
                className="rounded bg-bone px-2 py-1 font-mono text-caption"
              >
                {n.time_s.toFixed(1)}s
              </button>
              <span className="font-serif-sc text-body text-ink">{n.text}</span>
              <div className="ml-auto flex items-center gap-2 text-caption text-mute">
                <div className="h-1 w-24 rounded-full bg-bone">
                  <div
                    className="h-1 rounded-full bg-clay"
                    style={{ width: `${Math.round(n.confidence * 100)}%` }}
                  />
                </div>
                <span>{Math.round(n.confidence * 100)}%</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
