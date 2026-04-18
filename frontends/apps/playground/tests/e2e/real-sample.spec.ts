import { test, expect } from "@playwright/test";

test("real-sample redirects to viewer and shows UnscriptedBanner", async ({ page }) => {
  await page.goto("/real-sample");
  // Should redirect to /playground/fixture-real
  await expect(page).toHaveURL(/fixture-real/);
  // UnscriptedBanner should be visible
  await expect(page.getByText(/真实拍摄片段/)).toBeVisible();
});
