import { test, expect } from "@playwright/test";

test.describe("i18n", () => {
  test("switches from English to Arabic and updates the document direction", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("button", { name: "Language" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("menuitem", { name: "العربية" }).click();

    await page.waitForURL(/\/ar($|\/)/);
    await expect(page).toHaveURL(/\/ar/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});
