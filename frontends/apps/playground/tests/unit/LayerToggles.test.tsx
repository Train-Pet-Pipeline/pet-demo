import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string) =>
    ({ layers: { title: "图层" } } as Record<string, Record<string, string>>)[ns]?.[k] ?? k,
}));

import { LayerToggles } from "@/components/LayerToggles";

it("renders 3 checkboxes for BBox, Pose, Narrative", () => {
  render(
    <LayerToggles
      showBBox={true} setBBox={() => {}}
      showPose={true} setPose={() => {}}
      showNarr={true} setNarr={() => {}}
    />
  );
  expect(screen.getByLabelText("BBox")).toBeInTheDocument();
  expect(screen.getByLabelText("Pose")).toBeInTheDocument();
  expect(screen.getByLabelText("Narrative")).toBeInTheDocument();
});
