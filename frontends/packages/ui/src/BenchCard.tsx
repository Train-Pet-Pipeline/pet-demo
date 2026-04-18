export type BenchCardProps = {
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
  size?: "default" | "large";
  className?: string;
};

export function BenchCard({
  label,
  value,
  unit,
  sublabel,
  size = "default",
  className,
}: BenchCardProps) {
  const sizeClass = size === "large" ? "bench-card-large" : "bench-card-default";
  return (
    <div
      data-testid="bench-card"
      className={`rounded-lg border border-mute-soft bg-cream p-4 ${sizeClass} ${className ?? ""}`}
    >
      <div className="text-caption font-sans uppercase tracking-wide text-mute">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-serif text-h1 text-ink">{value}</span>
        {unit ? (
          <span data-testid="bench-card-unit" className="text-body text-mute">
            {unit}
          </span>
        ) : null}
      </div>
      {sublabel ? <div className="mt-1 text-caption text-mute">{sublabel}</div> : null}
    </div>
  );
}
