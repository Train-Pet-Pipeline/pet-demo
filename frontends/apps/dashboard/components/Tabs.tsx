"use client";

import { useState, type ReactNode } from "react";

export type TabKey = "overview" | "clips" | "benchmarks";

export function Tabs({
  panels,
}: {
  panels: Record<TabKey, { label: string; content: ReactNode }>;
}) {
  const [active, setActive] = useState<TabKey>("overview");
  const keys = Object.keys(panels) as TabKey[];
  return (
    <>
      <nav className="border-b border-b-mute-soft">
        <ul className="mx-auto flex max-w-6xl gap-8 px-6">
          {keys.map((k) => {
            const isActive = k === active;
            return (
              <li key={k}>
                <button
                  onClick={() => setActive(k)}
                  className={`-mb-px border-b-2 py-3 text-body font-sans ${
                    isActive ? "border-clay text-clay" : "border-transparent text-mute"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {panels[k].label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mx-auto max-w-6xl px-6 py-8">{panels[active].content}</div>
    </>
  );
}
