import { test, expect } from "@playwright/test";

test("gallery shows exactly 4 AI cards", async ({ page }) => {
  await page.goto("/");
  // 4 AI clip cards should be present
  const aiCards = page.locator('[data-testid="clip-video"]');
  await expect(aiCards).toHaveCount(4);
  // Gallery must use a 2-column grid layout
  const grid = page.locator('.grid-cols-2').first();
  await expect(grid).toBeVisible();
  const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  // grid-cols-2 resolves to two tracks — assert exactly 2 space-separated values
  expect(cols.trim().split(/\s+/).length).toBe(2);
});

test("AI cards have AI 生成示意 badge", async ({ page }) => {
  await page.goto("/");
  const badges = page.getByText("AI 生成示意");
  await expect(badges.first()).toBeVisible();
});
