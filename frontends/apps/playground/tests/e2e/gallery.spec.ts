import { test, expect } from "@playwright/test";

test("gallery shows all clips as cards", async ({ page }) => {
  await page.goto("/");
  // All clips (AI + real footage) are rendered as cards (R2-O2)
  const cards = page.locator('[data-testid="clip-video"]');
  // Fixture has 4 AI + 1 real = 5 total
  await expect(cards).toHaveCount(5);
  // Gallery must use a 2-column grid layout
  const grid = page.locator('.grid-cols-2').first();
  await expect(grid).toBeVisible();
  const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  // grid-cols-2 resolves to two tracks — assert exactly 2 space-separated values
  expect(cols.trim().split(/\s+/).length).toBe(2);
});

test("AI cards have AI generated badge", async ({ page }) => {
  await page.goto("/");
  // In EN locale, badge label is "AI generated"
  const badges = page.getByText("AI generated");
  await expect(badges.first()).toBeVisible();
});
