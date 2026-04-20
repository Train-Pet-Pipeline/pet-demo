import { test, expect } from "@playwright/test";

test("toggle bbox layer updates data-active-layers", async ({ page }) => {
  await page.goto("/playground/fixture-ai-1");
  const overlay = page.getByTestId("canvas-overlay");
  await expect(overlay).toHaveAttribute("data-active-layers", /bbox/);
  await page.getByLabel("BBox").uncheck();
  await expect(overlay).toHaveAttribute("data-active-layers", /^(pose)?$/);
});

test("real-footage-6s: stitched tracks have no id fragmentation", async ({ page }) => {
  // Fixture-only skip: only runs if stitched artifact exists in public/artifacts/
  const { ok } = await page.request.get("/artifacts/real-footage-6s/tracks.stitched.json")
    .then(r => ({ ok: r.ok() }))
    .catch(() => ({ ok: false }));
  test.skip(!ok, "tracks.stitched.json not baked yet (pre-v1.0.0 operator step)");

  const payload = await page.request.get("/artifacts/real-footage-6s/tracks.stitched.json")
    .then(r => r.json());
  const ids = new Set<number>();
  for (const fr of payload.frames) for (const t of fr.tracks) ids.add(t.id);
  // 2-cat real footage should collapse to <=2 stable ids end-to-end.
  expect(ids.size, `stitched id count = ${ids.size}`).toBeLessThanOrEqual(2);
});
