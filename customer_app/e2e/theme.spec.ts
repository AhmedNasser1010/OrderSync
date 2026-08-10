import { test, expect } from "@playwright/test";

test.describe("Theme", () => {
  test("toggles dark mode and persists the preference across reloads", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("button", { name: "Dark mode" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Dark mode" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "dark"
    );

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(
      page.getByRole("button", { name: "Light mode" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Light mode" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "light"
    );
  });
});
