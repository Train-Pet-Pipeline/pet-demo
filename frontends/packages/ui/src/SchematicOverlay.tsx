import type { ReactNode } from "react";
import { IllustrationBadge } from "./IllustrationBadge";

export interface SchematicOverlayProps {
  children: ReactNode;
  className?: string;
}

export function SchematicOverlay({ children, className }: SchematicOverlayProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      {children}
      <IllustrationBadge />
    </div>
  );
}
