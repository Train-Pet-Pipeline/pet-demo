import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string) =>
    ({ narrative: { title: "叙事" } } as Record<string, Record<string, string>>)[ns]?.[k] ?? k,
}));

import { NarrativePanel } from "@/components/NarrativePanel";

it("renders chapter text and confidence", () => {
  render(<NarrativePanel chapter={{ start: 0, end: 8, text: "猫咪向左走", confidence: 0.85 }} />);
  expect(screen.getByText("猫咪向左走")).toBeInTheDocument();
  expect(screen.getByText(/85%/)).toBeInTheDocument();
});
