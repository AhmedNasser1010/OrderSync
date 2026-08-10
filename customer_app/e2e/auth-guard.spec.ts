import { test, expect } from "@playwright/test";

test.describe("Guest guards", () => {
  test("asking a guest to place an order opens the login sidebar", async ({
    page,
  }) => {
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

    const cartLink = page.getByRole("link", { name: "Cart" }).first();
    await expect(cartLink).toBeVisible();
    await cartLink.click();

    const placeOrder = page
      .getByRole("button", { name: "Place Order" })
      .first();
    await expect(placeOrder).toBeVisible({ timeout: 60_000 });
    await placeOrder.click();

    await expect(
      page.getByRole("button", { name: "Login With Google" })
    ).toBeVisible();
  });
});
