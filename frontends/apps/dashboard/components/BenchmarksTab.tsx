import { BenchCard } from "@purrai/ui";
import type { Benchmarks } from "@/lib/schemas";

export function BenchmarksTab({ benchmarks }: { benchmarks: Benchmarks }) {
  const b = benchmarks;
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BenchCard label="Mean FPS" value={b.mean_fps.toFixed(1)} unit="fps" size="large" />
        <BenchCard
          label="Pipeline"
          value={b.pipeline_ms.toFixed(1)}
          unit="ms / frame"
          size="large"
        />
        <BenchCard
          label="VLM latency"
          value={(b.narrative_ms / 1000).toFixed(1)}
          unit="s"
          size="large"
        />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <BenchCard label="detector" value={b.detector_ms.toFixed(1)} unit="ms" />
        <BenchCard label="tracker" value={b.tracker_ms.toFixed(1)} unit="ms" />
        <BenchCard label="reid" value={b.reid_ms.toFixed(1)} unit="ms" />
        <BenchCard label="pose" value={b.pose_ms.toFixed(1)} unit="ms" />
        <BenchCard label="narrative" value={b.narrative_ms.toFixed(0)} unit="ms" />
      </section>

      <details className="rounded-lg border border-mute-soft bg-cream p-4">
        <summary className="cursor-pointer font-sans text-body text-ink">Engineering notes</summary>
        <p className="mt-2 text-body text-mute">
          pipeline_mode = <code>{b.pipeline_mode}</code>. Reid and pose run on parallel threads per
          frame. VLM narrative runs on a single-slot background worker (vlm_trigger_interval 60
          frames). Pose uses mmpose AP-10K 17-keypoint topology with 20-edge skeleton overlay.
          Measured on RTX 5090 · {b.total_frames} frames / {b.total_seconds.toFixed(1)}s.
        </p>
      </details>
    </div>
  );
}
