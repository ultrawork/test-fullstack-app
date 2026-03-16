import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI } from './helpers';

test.describe('Clear button in note editor form', () => {
  // SC-200: Clear button is displayed on the new note page
  test('SC-200: Clear button is visible on new note page', async ({ page }) => {
    const email = uniqueEmail('sc200');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Verify Clear button exists
    const clearButton = page.getByRole('button', { name: 'Clear' });
    await expect(clearButton).toBeVisible();

    // Verify button order: Create Note, Clear, Cancel
    const createButton = page.getByRole('button', { name: 'Create Note' });
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await expect(createButton).toBeVisible();
    await expect(cancelButton).toBeVisible();
  });

  // SC-201: Clear button clears all filled form fields
  test('SC-201: Clear button clears filled form fields', async ({ page }) => {
    const email = uniqueEmail('sc201');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Fill in the form fields
    await page.getByLabel('Title').fill('Тестовая заметка');
    await page.getByLabel('Content').fill('Содержимое заметки');

    // Verify fields are filled
    await expect(page.getByLabel('Title')).toHaveValue('Тестовая заметка');
    await expect(page.getByLabel('Content')).toHaveValue('Содержимое заметки');

    // Click Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Verify all fields are empty
    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');

    // Verify category select is reset to "No category"
    await expect(page.getByTestId('category-select')).toHaveValue('');

    // Verify we stayed on the same page
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);
  });

  // SC-202: Clear button clears validation errors
  test('SC-202: Clear button clears validation errors', async ({ page }) => {
    const email = uniqueEmail('sc202');
    await registerViaUI(page, email);

    await page.goto('/dashboard/notes/new');

    // Submit empty form to trigger validation errors
    await page.getByRole('button', { name: 'Create Note' }).click();

    // Verify validation errors are shown
    const alerts = page.getByRole('alert');
    await expect(alerts.first()).toBeVisible();

    // Click Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Verify validation errors are gone
    await expect(page.getByRole('alert')).not.toBeVisible();
  });

  // SC-203: Clear button does not submit the form
  test('SC-203: Clear button does not submit the form', async ({ page }) => {
    const email = uniqueEmail('sc203');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Fill in the form
    await page.getByLabel('Title').fill('Не должна сохраниться');
    await page.getByLabel('Content').fill('Тестовое содержимое');

    // Click Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Verify URL stays on new note page (form was NOT submitted)
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);

    // Verify fields are cleared (not submitted)
    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');
  });
});
