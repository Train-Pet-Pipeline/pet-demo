import { test, expect } from "@playwright/test";

test("gallery shows exactly 4 AI cards", async ({ page }) => {
  await page.goto("/");
  // 4 AI clip cards should be present
  const aiCards = page.locator('[data-testid="clip-video"]');
  await expect(aiCards).toHaveCount(4);
});

test("AI cards have AI 生成示意 badge", async ({ page }) => {
  await page.goto("/");
  const badges = page.getByText("AI 生成示意");
  await expect(badges.first()).toBeVisible();
});
