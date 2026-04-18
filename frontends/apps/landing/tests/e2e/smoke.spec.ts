import { test, expect } from "@playwright/test";

test("Coming Soon wordmark visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Purr·AI")).toBeVisible();
  await expect(page.getByText("听懂每一声咕噜、低吟、呼吸。")).toBeVisible();
});
