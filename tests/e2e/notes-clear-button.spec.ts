import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI } from './helpers';

test.describe('Кнопка Clear формы создания заметки', () => {
  // SC-200: Отображение кнопки Clear на форме создания заметки
  test('SC-200: кнопка Clear отображается на форме создания заметки', async ({ page }) => {
    const email = uniqueEmail('sc200');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Проверяем наличие формы
    await expect(page.getByTestId('note-editor-form')).toBeVisible();

    // Проверяем наличие кнопки Clear
    const clearButton = page.getByRole('button', { name: 'Clear' });
    await expect(clearButton).toBeVisible();

    // Проверяем что кнопка расположена рядом с Create Note и Cancel
    await expect(page.getByRole('button', { name: 'Create Note' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  // SC-201: Очистка заполненных полей формы при нажатии Clear
  test('SC-201: очистка заполненных полей формы при нажатии Clear', async ({ page }) => {
    const email = uniqueEmail('sc201');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Заполняем поля формы
    await page.getByLabel('Title').fill('Тестовый заголовок');
    await page.getByLabel('Content').fill('Тестовое содержание');

    // Проверяем что поля заполнены
    await expect(page.getByLabel('Title')).toHaveValue('Тестовый заголовок');
    await expect(page.getByLabel('Content')).toHaveValue('Тестовое содержание');

    // Нажимаем Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Проверяем что поля очищены
    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');

    // Проверяем что Category сброшена на "No category"
    await expect(page.getByTestId('category-select')).toHaveValue('');

    // Проверяем что URL не изменился
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);
  });

  // SC-202: Очистка ошибок валидации при нажатии Clear
  test('SC-202: очистка ошибок валидации при нажатии Clear', async ({ page }) => {
    const email = uniqueEmail('sc202');
    await registerViaUI(page, email);

    await page.goto('/dashboard/notes/new');

    // Нажимаем Create Note с пустыми полями для вызова ошибок валидации
    await page.getByRole('button', { name: 'Create Note' }).click();

    // Проверяем что отображаются ошибки валидации
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Content is required')).toBeVisible();

    // Нажимаем Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Проверяем что ошибки валидации исчезли
    await expect(page.getByText('Title is required')).not.toBeVisible();
    await expect(page.getByText('Content is required')).not.toBeVisible();

    // Проверяем что поля остаются пустыми
    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');
  });

  // SC-203: Кнопка Clear не отправляет форму
  test('SC-203: кнопка Clear не отправляет форму', async ({ page }) => {
    const email = uniqueEmail('sc203');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Заполняем поля
    await page.getByLabel('Title').fill('Тест');
    await page.getByLabel('Content').fill('Содержание');

    // Нажимаем Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Ждём чтобы убедиться что навигации не произошло
    await page.waitForTimeout(2000);

    // URL не изменился — пользователь остаётся на странице создания
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);

    // Поля очищены, заметка не создана
    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');
  });
});
