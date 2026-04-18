// components/ChapterNav.tsx
"use client";

interface Chapter { start: number; end: number; text: string; confidence: number; }

interface Props {
  chapters: Chapter[];
  currentIdx: number;
  onJump: (t: number) => void;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export function ChapterNav({ chapters, currentIdx, onJump }: Props) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-ink">章节</h4>
      {chapters.map((ch, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onJump(ch.start)}
          aria-label={`章节 ${i + 1}`}
          className={`w-full text-left px-2 py-1 rounded text-sm ${
            i === currentIdx ? "bg-clay/20 font-medium" : "hover:bg-ink/5"
          }`}
        >
          <span className="font-medium">章节 {i + 1}</span>
          <span className="ml-2 text-ink/50 text-xs">{fmt(ch.start)}–{fmt(ch.end)}</span>
        </button>
      ))}
    </div>
  );
}
