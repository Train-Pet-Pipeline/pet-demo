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
  label = "基线推理",
  aria = "基线推理",
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
        maxWidth: "calc(100% - 16px)",
        padding: "2px 7px",
        borderRadius: 999,
        background: "rgba(255,252,247,0.82)",
        border: "1px solid rgba(31,26,23,0.14)",
        color: "rgba(31,26,23,0.60)",
        fontSize: 10,
        letterSpacing: "0.02em",
        fontFamily: "var(--font-sans, sans-serif)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        ...style,
      }}
    >
      {label}
    </span>
  );
}
