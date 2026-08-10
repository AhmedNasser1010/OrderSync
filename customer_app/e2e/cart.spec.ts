import { test, expect } from "@playwright/test";

test.describe("Cart flow", () => {
  test("adds an item from the menu and opens the bill", async ({ page }) => {
    await page.goto("/en");
    const firstRestaurant = page
      .locator('section#restaurants a[href^="/en/"]')
      .first();
    await expect(firstRestaurant).toBeVisible({ timeout: 60_000 });
    await firstRestaurant.click();
    await page.waitForURL(/\/en\/[^/]+$/);

    const addButton = page.getByRole("button", { name: "Add" }).first();
    await expect(addButton).toBeVisible({ timeout: 60_000 });
    await addButton.click();

    await expect(
      page.getByRole("button", { name: "Decrease" }).first()
    ).toBeVisible();

    const cartLink = page.getByRole("link", { name: "Cart" }).first();
    await expect(cartLink).toBeVisible();
    await cartLink.click();

    await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Place Order" }).first()
    ).toBeVisible({ timeout: 60_000 });

    await expect(
      page.getByRole("heading", { name: "Payment Method" })
    ).toBeVisible();
    await expect(page.getByText("Cash on Delivery")).toBeVisible();
    await expect(page.getByText("Soon", { exact: true })).toBeVisible();
  });
});
