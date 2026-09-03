import { test, expect } from "@playwright/test";
import {
  seedEmulator,
  getAuthStoragePayload,
  getCustomerOrders,
  authStorageKey,
  E2E_RESTAURANT_ID,
  E2E_USER_NAME,
} from "./seed-emulator";

let authPayload: string;

test.beforeAll(async () => {
  await seedEmulator();
  authPayload = await getAuthStoragePayload();
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: authStorageKey(), value: authPayload }
  );
});

test("customer can place an order end-to-end via the emulator", async ({
  page,
}) => {
  await page.goto("/en/Test-Restaurant");

  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("View Cart")).toBeVisible();
  await page.getByText("View Cart").click();

  await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();

  await page.getByRole("button", { name: "Place Order" }).first().click();

  await expect(page.getByText("Thank You!")).toBeVisible({ timeout: 30_000 });

  const orders = await getCustomerOrders();
  expect(orders).toHaveLength(1);
  expect(orders[0].businessId).toBe(E2E_RESTAURANT_ID);
  expect(orders[0].customer.name).toBe(E2E_USER_NAME);
  expect(orders[0].status.current).toBe("RECEIVED");
  expect(orders[0].pricing.total).toBe(105);
  expect(orders[0].pricing.subtotal).toBe(100);
  expect(orders[0].pricing.deliveryFees).toBe(5);
  expect(orders[0].finance).toEqual({
    commissionPercent: 10,
    commissionAmount: 10,
    restaurantShare: 90,
    companyShare: 10,
    cashCollected: 105,
    driverEarnings: 5,
  });
});
