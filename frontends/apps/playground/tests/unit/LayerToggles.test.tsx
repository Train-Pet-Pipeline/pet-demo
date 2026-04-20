import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (k: string) =>
    ({
      layers: {
        title: "图层",
        tracks: "跟踪框",
        poses: "骨架",
        narratives: "旁白",
      },
    } as Record<string, Record<string, string>>)[ns]?.[k] ?? k,
}));

import { LayerToggles } from "@/components/LayerToggles";

it("renders 3 checkboxes for tracks, poses, narratives", () => {
  render(
    <LayerToggles
      showBBox={true} setBBox={() => {}}
      showPose={true} setPose={() => {}}
      showNarr={true} setNarr={() => {}}
    />
  );
  expect(screen.getByLabelText("跟踪框")).toBeInTheDocument();
  expect(screen.getByLabelText("骨架")).toBeInTheDocument();
  expect(screen.getByLabelText("旁白")).toBeInTheDocument();
});
