import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string, params?: Record<string, unknown>) => {
    const map: Record<string, Record<string, string>> = {
      chapters: { title: "章节", label: "章节 {n}" },
    };
    const val = (map[ns] ?? {})[k] ?? k;
    if (params && typeof params.n === "number") return val.replace("{n}", String(params.n));
    return val;
  },
}));

import { ChapterNav } from "@/components/ChapterNav";

const chapters = [
  { start: 0, end: 8, text: "Chapter 1", confidence: 0.8 },
  { start: 8, end: 16, text: "Chapter 2", confidence: 0.9 },
];

it("clicking chapter 2 button sets video currentTime", () => {
  let jumped = -1;
  render(<ChapterNav chapters={chapters} currentIdx={0} onJump={(t) => { jumped = t; }} />);
  const btn = screen.getByRole("button", { name: /章节 2/ });
  fireEvent.click(btn);
  expect(jumped).toBe(8);
});
