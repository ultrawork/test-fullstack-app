import { test, expect } from "@playwright/test";

test("SC-001: homepage displays Notes App heading", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

  const heading = page.getByRole("heading", { level: 1, name: "Notes App" });
  await expect(heading).toBeVisible();
});
