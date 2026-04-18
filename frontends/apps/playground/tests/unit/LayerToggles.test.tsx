import { render, screen } from "@testing-library/react";
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
