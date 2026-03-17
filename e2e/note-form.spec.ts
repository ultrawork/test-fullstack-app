import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// SC-001: Successful note creation
test("SC-001: creates a note and shows success message without clearing fields", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { level: 1, name: "Notes App" })
  ).toBeVisible();

  await page.getByLabel("Title").fill("Test note");
  await page.getByLabel("Content").fill("Test note content");
  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText("Note has been created")).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue("Test note");
  await expect(page.getByLabel("Content")).toHaveValue("Test note content");
});

// SC-002: Validation errors on empty submit
test("SC-002: shows validation errors when submitting empty form", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText("Title is required")).toBeVisible();
  await expect(page.getByText("Content is required")).toBeVisible();
  await expect(page.getByText("Note has been created")).not.toBeVisible();

  await expect(page.getByLabel("Title")).toHaveAttribute(
    "aria-invalid",
    "true"
  );
  await expect(page.getByLabel("Content")).toHaveAttribute(
    "aria-invalid",
    "true"
  );
});

// SC-003: Typing clears validation error for that field
test("SC-003: clears field error when user starts typing", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Create Note" }).click();
  await expect(page.getByText("Title is required")).toBeVisible();
  await expect(page.getByText("Content is required")).toBeVisible();

  await page.getByLabel("Title").fill("Some title");

  await expect(page.getByText("Title is required")).not.toBeVisible();
  await expect(page.getByText("Content is required")).toBeVisible();
});

// SC-004: Clear button resets form after successful submit
test("SC-004: Clear button resets fields, status after submit", async ({
  page,
}) => {
  await page.getByLabel("Title").fill("My Note");
  await page.getByLabel("Content").fill("Some content");
  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText("Note has been created")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("");
  await expect(page.getByLabel("Content")).toHaveValue("");
  await expect(page.getByText("Note has been created")).not.toBeVisible();
});

// SC-005: Clear button removes validation errors
test("SC-005: Clear button removes validation errors", async ({ page }) => {
  await page.getByRole("button", { name: "Create Note" }).click();
  await expect(page.getByText("Title is required")).toBeVisible();
  await expect(page.getByText("Content is required")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();

  await expect(page.getByText("Title is required")).not.toBeVisible();
  await expect(page.getByText("Content is required")).not.toBeVisible();
});

// SC-006: Partial validation — only one field filled
test("SC-006: shows error only for empty field when one field is filled", async ({
  page,
}) => {
  await page.getByLabel("Title").fill("My Title");
  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText("Content is required")).toBeVisible();
  await expect(page.getByText("Title is required")).not.toBeVisible();
  await expect(page.getByText("Note has been created")).not.toBeVisible();
});
