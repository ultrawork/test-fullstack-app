import { test, expect } from "@playwright/test";

const TEST_USER = {
  email: `e2e_clear_${Date.now()}@test.com`,
  password: "TestPass123!",
  name: "E2E Clear Test",
};

async function registerAndLogin(
  baseURL: string,
  request: import("@playwright/test").APIRequestContext,
): Promise<string> {
  // Register
  const registerRes = await request.post(`${baseURL}/api/v1/auth/register`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
      name: TEST_USER.name,
    },
  });

  if (registerRes.ok()) {
    const cookies = registerRes.headers()["set-cookie"] || "";
    return cookies;
  }

  // If already registered, login
  const loginRes = await request.post(`${baseURL}/api/v1/auth/login`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
    },
  });
  const cookies = loginRes.headers()["set-cookie"] || "";
  return cookies;
}

test.describe("Clear button on NoteEditor form", () => {
  test.beforeEach(async ({ page, request, baseURL }) => {
    const url = baseURL!;

    // Register via API and get auth cookies
    const registerRes = await request.post(`${url}/api/v1/auth/register`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        name: TEST_USER.name,
      },
    });

    // If register fails (user exists), login instead
    if (!registerRes.ok()) {
      await request.post(`${url}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });
    }

    // Navigate to login page and login via UI to set cookies in browser context
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 10000 });

    // Navigate to create note page
    await page.goto("/dashboard/notes/new");
    await page.waitForSelector("form", { timeout: 10000 });
  });

  // SC-200: Clear button is displayed next to Create Note button
  test("SC-200: displays Clear button alongside Create Note button", async ({
    page,
  }) => {
    const createButton = page.getByRole("button", { name: "Create Note" });
    const clearButton = page.getByRole("button", { name: "Clear" });

    await expect(createButton).toBeVisible();
    await expect(clearButton).toBeVisible();

    // Verify both buttons are in the same parent container (same row)
    const clearBox = await clearButton.boundingBox();
    const createBox = await createButton.boundingBox();
    expect(clearBox).toBeTruthy();
    expect(createBox).toBeTruthy();
    // They should be on approximately the same vertical line (same row)
    expect(Math.abs(clearBox!.y - createBox!.y)).toBeLessThan(20);
  });

  // SC-201: Clear button resets all filled fields
  test("SC-201: clears all form fields when Clear is clicked", async ({
    page,
  }) => {
    const titleInput = page.getByLabel("Title");
    const contentInput = page.getByLabel("Content");
    const categorySelect = page.getByLabel("Category (optional)");
    const clearButton = page.getByRole("button", { name: "Clear" });

    // Fill in form fields
    await titleInput.fill("Test Title");
    await contentInput.fill("Test Content");

    // Verify fields are filled
    await expect(titleInput).toHaveValue("Test Title");
    await expect(contentInput).toHaveValue("Test Content");

    // Click Clear
    await clearButton.click();

    // Verify all fields are cleared
    await expect(titleInput).toHaveValue("");
    await expect(contentInput).toHaveValue("");
    await expect(categorySelect).toHaveValue("");

    // Verify user stays on the same page
    expect(page.url()).toContain("/dashboard/notes/new");
  });

  // SC-202: Clear button clears validation errors
  test("SC-202: clears validation errors when Clear is clicked", async ({
    page,
  }) => {
    const createButton = page.getByRole("button", { name: "Create Note" });
    const clearButton = page.getByRole("button", { name: "Clear" });

    // Submit empty form to trigger validation
    await createButton.click();

    // Verify validation errors appear
    await expect(page.getByText("Title is required")).toBeVisible();
    await expect(page.getByText("Content is required")).toBeVisible();

    // Click Clear
    await clearButton.click();

    // Verify validation errors are gone
    await expect(page.getByText("Title is required")).not.toBeVisible();
    await expect(page.getByText("Content is required")).not.toBeVisible();
  });

  // SC-203: Clear button does not submit the form
  test("SC-203: does not submit form or navigate away when Clear is clicked", async ({
    page,
  }) => {
    const titleInput = page.getByLabel("Title");
    const contentInput = page.getByLabel("Content");
    const clearButton = page.getByRole("button", { name: "Clear" });

    // Fill valid data
    await titleInput.fill("Test Title");
    await contentInput.fill("Test Content");

    // Click Clear
    await clearButton.click();

    // Verify still on the create note page (no navigation)
    expect(page.url()).toContain("/dashboard/notes/new");

    // Verify fields are empty (form was reset, not submitted)
    await expect(titleInput).toHaveValue("");
    await expect(contentInput).toHaveValue("");
  });
});
