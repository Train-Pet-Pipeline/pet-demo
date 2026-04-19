import { test, expect } from "@playwright/test";

test("/en loads gallery page", async ({ page }) => {
  await page.goto("/en");
  // Page should load without error
  await expect(page).not.toHaveURL(/404/);
  // Gallery grid should be present
  const grid = page.locator(".grid-cols-2").first();
  await expect(grid).toBeVisible();
});

test("/en/fixture-ai-1 loads same DOM as /fixture-ai-1", async ({ page }) => {
  // Load zh (default, no prefix) version
  await page.goto("/fixture-ai-1");
  const h1 = page.locator("h1").first();
  await expect(h1).toBeVisible();
  const zhTitle = await h1.textContent();

  // Load en version
  await page.goto("/en/fixture-ai-1");
  await expect(page).not.toHaveURL(/404/);
  const enTitle = await page.locator("h1").first().textContent();

  // Both should render the same clip title (titles are not translated)
  expect(enTitle).toBe(zhTitle);
  // Clip viewer canvas overlay should be present
  await expect(page.getByTestId("canvas-overlay")).toBeVisible();
});
