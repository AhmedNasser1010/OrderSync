import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders brand, navigation and restaurant listings", async ({ page }) => {
    await page.goto("/en");

    await expect(
      page.getByRole("heading", { name: "Zajil" }).first()
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Language" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Dark mode" })).toBeVisible();

    await expect(page.locator("section#restaurants")).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.locator('section#restaurants a[href^="/en/"]').first()
    ).toBeVisible({ timeout: 60_000 });
  });
});
