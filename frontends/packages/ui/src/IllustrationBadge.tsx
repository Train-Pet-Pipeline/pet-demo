import type { CSSProperties } from "react";

export interface IllustrationBadgeProps {
  className?: string;
  style?: CSSProperties;
  label?: string;
  aria?: string;
}

export function IllustrationBadge({
  className,
  style,
  label = "示意图 · 非真实推理输出",
  aria = "示意图,非真实推理输出",
}: IllustrationBadgeProps) {
  return (
    <span
      role="note"
      aria-label={aria}
      className={className}
      style={{
        position: "absolute",
        right: 8,
        bottom: 8,
        padding: "2px 8px",
        borderRadius: 4,
        background: "rgba(31,26,23,0.65)",
        color: "#FFFCF7",
        fontSize: 11,
        fontFamily: "var(--font-sans, sans-serif)",
        ...style,
      }}
    >
      {label}
    </span>
  );
}
