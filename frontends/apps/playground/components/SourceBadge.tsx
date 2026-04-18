// components/SourceBadge.tsx — app-local; labels ai_generated vs real_footage
type Tone = "clay" | "moss";
export function SourceBadge({ source }: { source: "ai_generated" | "real_footage" }) {
  const label = source === "ai_generated" ? "AI 生成示意" : "真实拍摄 · 未预设";
  const tone: Tone = source === "ai_generated" ? "clay" : "moss";
  const bg = tone === "clay" ? "bg-clay" : "bg-moss";
  return (
    <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs text-cream ${bg}`}>
      {label}
    </span>
  );
}
