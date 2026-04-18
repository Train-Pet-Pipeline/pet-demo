"use client";

import { useState } from "react";
import { VideoPlayer, NarrativeCard, BenchCard } from "@purrai/ui";
import type { Narratives, Benchmarks } from "@/lib/schemas";
import { ARTIFACTS_BASE } from "@/config";

const NARRATIVE_HOLD_SEC = 2.0;

export function OverviewTab({ narratives, benchmarks }: { narratives: Narratives; benchmarks: Benchmarks }) {
  const hero = narratives.clip_1;
  const [currentText, setCurrentText] = useState<{ text: string; confidence: number } | null>(null);

  function onTimeUpdate(t: number) {
    const list = hero?.narratives ?? [];
    const active = [...list].reverse().find((n) => n.time_s <= t && t <= n.time_s + NARRATIVE_HOLD_SEC);
    if (active) setCurrentText({ text: active.text, confidence: active.confidence });
    else setCurrentText(null);
  }

  const kpi = benchmarks;
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-xl bg-bone">
        {hero ? (
          <>
            <VideoPlayer
              src={`${ARTIFACTS_BASE}/${hero.video}`}
              poster={`${ARTIFACTS_BASE}/${hero.poster}`}
              hero
              className="h-[420px] w-full object-cover"
              onTimeUpdate={onTimeUpdate}
            />
            <div className="pointer-events-none absolute bottom-6 left-6 max-w-md">
              <NarrativeCard
                text={currentText?.text ?? ""}
                confidence={currentText?.confidence ?? 0}
                visible={!!currentText}
              />
            </div>
          </>
        ) : (
          <div className="flex h-[420px] items-center justify-center text-mute">clip_1 missing</div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BenchCard
          label="FPS"
          value={String(Math.round(kpi.mean_fps))}
          unit="fps"
          sublabel="detector + track pipeline"
        />
        <BenchCard
          label="VLM"
          value={(kpi.narrative_ms / 1000).toFixed(1)}
          unit="s"
          sublabel="Qwen2-VL-2B on-device"
        />
        <BenchCard
          label="Clips"
          value={String(Object.keys(narratives).length)}
          sublabel="真实 pet-data"
        />
      </section>
    </div>
  );
}
