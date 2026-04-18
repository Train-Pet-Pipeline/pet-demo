// components/LayerToggles.tsx
"use client";

interface Props {
  showBBox: boolean;
  setBBox: (v: boolean) => void;
  showPose: boolean;
  setPose: (v: boolean) => void;
  showNarr: boolean;
  setNarr: (v: boolean) => void;
}

export function LayerToggles({ showBBox, setBBox, showPose, setPose, showNarr, setNarr }: Props) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-ink">图层</h4>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={showBBox} onChange={(e) => setBBox(e.target.checked)} />
        BBox
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={showPose} onChange={(e) => setPose(e.target.checked)} />
        Pose
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={showNarr} onChange={(e) => setNarr(e.target.checked)} />
        Narrative
      </label>
    </div>
  );
}
