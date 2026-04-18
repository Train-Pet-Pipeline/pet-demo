import { test, expect } from "@playwright/test";

test("toggle bbox layer updates data-active-layers", async ({ page }) => {
  await page.goto("/playground/fixture-ai-1");
  const overlay = page.getByTestId("canvas-overlay");
  await expect(overlay).toHaveAttribute("data-active-layers", /bbox/);
  await page.getByLabel("BBox").uncheck();
  await expect(overlay).toHaveAttribute("data-active-layers", /^(pose)?$/);
});
