// components/SourceBadge.tsx — app-local; labels ai_generated vs real_footage
type Tone = "clay" | "moss";
interface SourceBadgeProps {
  source: "ai_generated" | "real_footage";
  aiLabel: string;
  realLabel: string;
}
export function SourceBadge({ source, aiLabel, realLabel }: SourceBadgeProps) {
  const label = source === "ai_generated" ? aiLabel : realLabel;
  const tone: Tone = source === "ai_generated" ? "clay" : "moss";
  const bg = tone === "clay" ? "bg-clay" : "bg-moss";
  return (
    <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs text-cream ${bg}`}>
      {label}
    </span>
  );
}
