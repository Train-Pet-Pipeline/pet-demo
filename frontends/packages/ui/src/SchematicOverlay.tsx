import type { ReactNode } from "react";
import { IllustrationBadge } from "./IllustrationBadge";

export interface SchematicOverlayProps {
  children: ReactNode;
  className?: string;
  badgeLabel?: string;
  badgeAria?: string;
}

export function SchematicOverlay({ children, className, badgeLabel, badgeAria }: SchematicOverlayProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      {children}
      <IllustrationBadge label={badgeLabel} aria={badgeAria} />
    </div>
  );
}
