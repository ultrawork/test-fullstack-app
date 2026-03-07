import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI } from './helpers';

test.describe('Навигация и лендинг', () => {
  // SC-301: Лендинг — отображение и навигация
  test('SC-301: лендинг — отображение и навигация', async ({ page }) => {
    await page.goto('/');

    // Проверяем контент
    await expect(page.getByRole('heading', { name: 'Notes App' })).toBeVisible();
    await expect(page.getByText('A private, self-hosted notes application.')).toBeVisible();
    await expect(page.getByTestId('sign-in-link')).toBeVisible();
    await expect(page.getByTestId('create-account-link')).toBeVisible();

    // Кликаем Sign in
    await page.getByTestId('sign-in-link').click();
    await expect(page).toHaveURL(/\/login/);

    // Возвращаемся
    await page.goto('/');

    // Кликаем Create account
    await page.getByTestId('create-account-link').click();
    await expect(page).toHaveURL(/\/register/);
  });

  // SC-302: Навигация между login и register
  test('SC-302: навигация между login и register', async ({ page }) => {
    await page.goto('/login');

    // Кликаем на ссылку Register
    await page.getByTestId('register-link').click();
    await expect(page).toHaveURL(/\/register/);

    // Кликаем на ссылку Sign in
    await page.getByTestId('login-link').click();
    await expect(page).toHaveURL(/\/login/);
  });

  // SC-303: Навигация по дашборду — sidebar
  test('SC-303: навигация по дашборду — sidebar', async ({ page }) => {
    const email = uniqueEmail('sc303');
    await registerViaUI(page, email);

    // Проверяем sidebar
    await expect(page.getByTestId('new-note-link')).toBeVisible();
    await expect(page.getByTestId('manage-categories-link')).toBeVisible();

    // Кликаем New Note
    await page.getByTestId('new-note-link').click();
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);

    // Кликаем Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Кликаем Manage Categories
    await page.getByTestId('manage-categories-link').click();
    await expect(page).toHaveURL(/\/dashboard\/categories/);
  });

  // SC-304: Шапка — отображение email и логотип
  test('SC-304: шапка — email и логотип', async ({ page }) => {
    const email = uniqueEmail('sc304');
    await registerViaUI(page, email);

    // Проверяем шапку
    await expect(page.getByTestId('header-logo')).toBeVisible();
    await expect(page.getByTestId('header-logo')).toHaveText('Notes App');
    await expect(page.getByTestId('user-email')).toContainText(email);
    await expect(page.getByTestId('sign-out-button')).toBeVisible();

    // Кликаем на логотип
    await page.getByTestId('header-logo').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // SC-305: Пустое состояние — нет заметок
  test('SC-305: пустое состояние — нет заметок', async ({ page }) => {
    const email = uniqueEmail('sc305');
    await registerViaUI(page, email);

    // Проверяем пустое состояние
    await expect(page.getByText('No notes yet')).toBeVisible();
    await expect(page.getByText('Create your first note to get started.')).toBeVisible();

    // Кликаем New Note в пустом состоянии
    await page.getByTestId('empty-state').getByRole('button', { name: 'New Note' }).click();
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);
  });
});
