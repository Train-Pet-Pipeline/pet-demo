"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type TabKey = "overview" | "clips" | "benchmarks";

const TAB_KEYS: TabKey[] = ["overview", "clips", "benchmarks"];

export function Tabs({
  panels,
}: {
  panels: Record<TabKey, { label: string; content: ReactNode }>;
}) {
  const [active, setActive] = useState<TabKey>("overview");
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    overview: null,
    clips: null,
    benchmarks: null,
  });

  const keys = Object.keys(panels) as TabKey[];

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, current: TabKey) => {
    const idx = TAB_KEYS.indexOf(current);
    let next: TabKey | undefined;

    if (e.key === "ArrowRight") {
      next = TAB_KEYS[(idx + 1) % TAB_KEYS.length];
    } else if (e.key === "ArrowLeft") {
      next = TAB_KEYS[(idx - 1 + TAB_KEYS.length) % TAB_KEYS.length];
    } else if (e.key === "Home") {
      next = TAB_KEYS[0];
    } else if (e.key === "End") {
      next = TAB_KEYS[TAB_KEYS.length - 1];
    }

    if (next !== undefined) {
      e.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <>
      <nav className="border-b border-b-mute-soft">
        <ul
          role="tablist"
          aria-label="仪表盘分区"
          className="mx-auto flex max-w-6xl gap-8 px-6"
        >
          {keys.map((k) => {
            const isActive = k === active;
            const tabId = `tab-${k}`;
            const panelId = `tabpanel-${k}`;
            return (
              <li key={k} role="presentation">
                <button
                  id={tabId}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  ref={(el) => { tabRefs.current[k] = el; }}
                  onClick={() => setActive(k)}
                  onKeyDown={(e) => handleKeyDown(e, k)}
                  className={`-mb-px border-b-2 py-3 text-body font-sans ${
                    isActive ? "border-clay text-clay" : "border-transparent text-mute"
                  }`}
                >
                  {panels[k].label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {keys.map((k) => {
        const tabId = `tab-${k}`;
        const panelId = `tabpanel-${k}`;
        const isActive = k === active;
        return (
          <div
            key={k}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            tabIndex={0}
            hidden={!isActive}
            className="mx-auto max-w-6xl px-6 py-8"
          >
            {panels[k].content}
          </div>
        );
      })}
    </>
  );
}
