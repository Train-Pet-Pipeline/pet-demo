import type { ReactNode } from "react";

export interface SectionShellProps {
  id: string;
  headingId: string;
  children: ReactNode;
  className?: string;
}

export function SectionShell({ id, headingId, children, className }: SectionShellProps) {
  return (
    <section id={id} aria-labelledby={headingId} className={className}>
      {children}
    </section>
  );
}
