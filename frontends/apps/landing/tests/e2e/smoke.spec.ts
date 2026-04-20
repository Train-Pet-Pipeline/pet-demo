import { test, expect } from "@playwright/test";

test("landing renders all 8 section anchors", async ({ page }) => {
  await page.goto("/");
  for (const id of [
    "section-01-hero", "section-02-privacy", "section-03-painpoint",
    "section-04-alerts", "section-05-abilities", "section-06-radar",
    "section-07-benchmarks", "section-08-closing",
  ]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});

test("Hero wordmark uses Playfair", async ({ page }) => {
  await page.goto("/");
  const wordmark = page.locator("#section-01-hero h1").first();
  await expect(wordmark).toBeVisible();
  const family = await wordmark.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family.toLowerCase()).toContain("playfair");
});

test("SchematicOverlay badge visible in mandated sections", async ({ page }) => {
  await page.goto("/");
  for (const sectionId of ["section-02-privacy", "section-05-abilities", "section-06-radar"]) {
    const badges = page.locator(`#${sectionId}`).getByText("示意图 · 非真实推理输出");
    await expect(badges.first(), `badge missing in #${sectionId}`).toBeVisible();
  }
});

test("EmailForm rejects invalid email client-side", async ({ page }) => {
  await page.goto("/");
  const input = page.locator("#section-08-closing input[type='email']").first();
  const submit = page.locator("#section-08-closing button[type='submit']").first();
  await input.fill("not-an-email");
  await submit.click();
  await expect(input).toHaveAttribute("aria-invalid", "true");
});
