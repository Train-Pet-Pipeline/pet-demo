import { expect, test } from "@playwright/test";

for (const path of ["/", "/en"]) {
  test(`${path} has JSON-LD SoftwareApplication schema`, async ({ page }) => {
    await page.goto(path);
    const payload = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(payload, `JSON-LD missing on ${path}`).not.toBeNull();
    const data = JSON.parse(payload!);
    expect(data["@type"]).toBe("SoftwareApplication");
  });

  test(`${path} has canonical + OG meta`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/(en)?$/);
    await expect(page.locator('meta[property="og:image"]').first())
      .toHaveAttribute("content", /purrai-og\.jpg/);
    await expect(page.locator('meta[name="twitter:card"]'))
      .toHaveAttribute("content", "summary_large_image");
  });
}

test("/sitemap.xml lists both locales", async ({ page }) => {
  const body = await page.request.get("/sitemap.xml").then(r => r.text());
  expect(body).toContain("<loc>");
  expect((body.match(/<loc>/g) ?? []).length).toBeGreaterThanOrEqual(2);
});

test("/robots.txt references sitemap", async ({ page }) => {
  const body = await page.request.get("/robots.txt").then(r => r.text());
  expect(body.toLowerCase()).toContain("sitemap:");
});
