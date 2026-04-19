// components/NarrativePanel.tsx
"use client";

interface Chapter { start: number; end: number; text: string; confidence: number; }

interface Props {
  chapter: Chapter | undefined;
}

export function NarrativePanel({ chapter }: Props) {
  if (!chapter) return null;
  const pct = Math.round(chapter.confidence * 100);
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-ink">叙事</h4>
      <p className="text-sm text-ink/80">{chapter.text}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden">
          <div className="h-full bg-clay rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-ink/70">{pct}%</span>
      </div>
    </div>
  );
}
