import { test, expect } from "@playwright/test";

test("clicking chapter 2 updates narrative panel text", async ({ page }) => {
  await page.goto("/zh/playground/fixture-ai-1");
  // fixture-ai-1 has 2 chapters: Chapter 1 (0–1s) and Chapter 2 (1–2s)
  const ch2btn = page.getByRole("button", { name: /章节 2/ });
  await expect(ch2btn).toBeVisible();

  // Capture initial narrative text (Chapter 1)
  const narrativePanel = page.locator("p.text-sm");
  await expect(narrativePanel.first()).toBeVisible();
  const initialText = await narrativePanel.first().textContent();

  // Click chapter 2 button — this calls jump(1) which sets video.currentTime = 1
  await ch2btn.click();

  // Assert video currentTime >= 1 (chapter 2 starts at 1s)
  const video = page.locator("video");
  const currentTime = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  expect(currentTime).toBeGreaterThanOrEqual(1);

  // Assert narrative panel text has changed (Chapter 2 content replaces Chapter 1)
  await expect(narrativePanel.first()).not.toHaveText(initialText ?? "");
});
