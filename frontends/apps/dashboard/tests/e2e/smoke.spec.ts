import { test, expect } from "@playwright/test";

test("login redirect + three tabs render", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);

  await page.fill("input[type=password]", "letmein");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL("/");

  await expect(page.locator("text=Purr·AI").first()).toBeVisible();

  await expect(page.getByText("FPS").first()).toBeVisible();

  await page.click("button:has-text('Clips')");
  await expect(page.locator("text=猫·饮水行为").first()).toBeVisible();

  await page.click("button:has-text('Benchmarks')");
  await expect(page.getByText("Mean FPS")).toBeVisible();
});
