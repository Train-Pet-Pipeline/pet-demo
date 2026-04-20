import { expect, test } from "@playwright/test";

test("zh route renders Chinese hero", async ({ browser }) => {
  // Force zh Accept-Language so middleware serves zh at "/"
  const context = await browser.newContext({ locale: "zh-CN" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Purr");
  await expect(page.getByText("听懂每一声咕噜")).toBeVisible();
  await context.close();
});

test("en route renders English hero", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("h1")).toContainText("Purr");
  await expect(page.getByText("Hear every purr")).toBeVisible();
});

test("LanguageSwitcher toggles locale zh → en → zh", async ({ browser }) => {
  // Force zh Accept-Language so middleware serves zh at "/"
  const context = await browser.newContext({ locale: "zh-CN" });
  const page = await context.newPage();
  await page.goto("/");
  const toEn = page.getByRole("link", { name: "Switch to English" });
  await toEn.click();
  await expect(page).toHaveURL(/\/en\/?$/);
  const toZh = page.getByRole("link", { name: "切换至中文" });
  await toZh.click();
  await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/?$/);
  await context.close();
});
