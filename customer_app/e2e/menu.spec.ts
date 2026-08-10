import { test, expect } from "@playwright/test";

test.describe("Restaurant menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
    const firstRestaurant = page
      .locator('section#restaurants a[href^="/en/"]')
      .first();
    await expect(firstRestaurant).toBeVisible({ timeout: 60_000 });
    await firstRestaurant.click();
    await page.waitForURL(/\/en\/[^/]+$/);
  });

  test("loads the menu with an Add button for the first item", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: "Add" }).first()).toBeVisible(
      { timeout: 60_000 }
    );
  });

  test("searching for a nonexistent item shows the empty state", async ({
    page,
  }) => {
    const search = page.getByRole("searchbox", { name: "Search menu" });
    await expect(search).toBeVisible({ timeout: 60_000 });
    await search.fill("zzzzzzzz-no-match-zzzz");

    await expect(
      page.getByText("No items found", { exact: true }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).first().click();
    await expect(
      page.getByRole("button", { name: "Add" }).first()
    ).toBeVisible();
  });
});
