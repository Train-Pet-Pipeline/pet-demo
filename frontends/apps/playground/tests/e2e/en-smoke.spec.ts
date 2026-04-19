import { test, expect } from "@playwright/test";

test("/en loads gallery page", async ({ page }) => {
  await page.goto("/en");
  // Page should load without error
  await expect(page).not.toHaveURL(/404/);
  // Gallery grid should be present
  const grid = page.locator(".grid-cols-2").first();
  await expect(grid).toBeVisible();
});

test("/en/playful-jump loads same DOM as /playful-jump", async ({ page }) => {
  // Load zh (default) version
  await page.goto("/playful-jump");
  const zhTitle = await page.locator("h1").first().textContent();

  // Load en version
  await page.goto("/en/playful-jump");
  await expect(page).not.toHaveURL(/404/);
  const enTitle = await page.locator("h1").first().textContent();

  // Both should render the same clip title (titles are not translated)
  expect(enTitle).toBe(zhTitle);
  // Clip viewer canvas overlay should be present in both
  await expect(page.getByTestId("canvas-overlay")).toBeVisible();
});
