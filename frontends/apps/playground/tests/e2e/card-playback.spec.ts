import { test, expect } from "@playwright/test";

test("click ClipCard play button starts video", async ({ page }) => {
  await page.goto("/");
  const btn = page.getByRole("button", { name: /播放 Fixture AI 1/ });
  await expect(btn).toBeVisible();
  const video = page.getByTestId("clip-video").first();
  // Video starts paused before click
  const pausedBefore = await video.evaluate((v) => (v as HTMLVideoElement).paused);
  expect(pausedBefore).toBe(true);
  // Click the play button — video.play() should be called
  // Intercept the play method to verify it's called
  await video.evaluate((v) => {
    const vid = v as HTMLVideoElement;
    (vid as any).__playCalled = false;
    const orig = vid.play.bind(vid);
    vid.play = () => { (vid as any).__playCalled = true; return orig(); };
  });
  await btn.click();
  const playCalled = await video.evaluate((v) => (v as any).__playCalled);
  expect(playCalled).toBe(true);
});
