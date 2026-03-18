import { test, expect } from "@playwright/test";

test.describe("Main Page Footer", () => {
  test("SC-001: footer with copyright text is displayed", async ({ page }) => {
    await page.goto("/");

    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer).toHaveText("© 2026 Notes App");
  });

  test("SC-002: page structure contains heading, main, and footer", async ({
    page,
  }) => {
    await page.goto("/");

    // Heading
    const heading = page.getByRole("heading", { level: 1, name: "Notes App" });
    await expect(heading).toBeVisible();

    // Main element
    const main = page.getByRole("main");
    await expect(main).toBeVisible();

    // Footer with copyright
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer).toHaveText("© 2026 Notes App");

    // Footer has a top border (border-t class)
    await expect(footer).toHaveCSS("border-top-style", "solid");
  });
});
