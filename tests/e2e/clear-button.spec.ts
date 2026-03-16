import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI } from './helpers';

test.describe('Кнопка Clear в форме заметки', () => {
  // SC-001: Кнопка «Clear» отображается в форме создания заметки
  test('SC-001: кнопка Clear отображается в форме создания заметки', async ({ page }) => {
    const email = uniqueEmail('sc-clear-001');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Кнопка Clear видима
    const clearButton = page.getByRole('button', { name: 'Clear' });
    await expect(clearButton).toBeVisible();

    // Проверяем порядок кнопок: Create Note, Clear, Cancel
    const buttons = page.locator('[data-testid="note-editor-form"] .flex.gap-3 button');
    await expect(buttons.nth(0)).toHaveText(/Create Note/);
    await expect(buttons.nth(1)).toHaveText('Clear');
    await expect(buttons.nth(2)).toHaveText('Cancel');
  });

  // SC-002: Кнопка «Clear» сбрасывает все поля формы
  test('SC-002: кнопка Clear сбрасывает все поля формы', async ({ page }) => {
    const email = uniqueEmail('sc-clear-002');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Заполняем поля
    await page.getByLabel('Title').fill('Тестовый заголовок');
    await page.getByLabel('Content').fill('Тестовое содержание');

    // Проверяем что поля заполнены
    await expect(page.getByLabel('Title')).toHaveValue('Тестовый заголовок');
    await expect(page.getByLabel('Content')).toHaveValue('Тестовое содержание');

    // Нажимаем Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Поля должны быть пустыми
    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');
    await expect(page.getByTestId('category-select')).toHaveValue('');

    // URL не изменился
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);
  });

  // SC-003: Кнопка «Clear» очищает ошибки валидации
  test('SC-003: кнопка Clear очищает ошибки валидации', async ({ page }) => {
    const email = uniqueEmail('sc-clear-003');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Сабмитим пустую форму для вызова ошибок валидации
    await page.getByRole('button', { name: 'Create Note' }).click();

    // Ошибки валидации должны появиться
    await expect(page.getByRole('alert').first()).toBeVisible();

    // Нажимаем Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Ошибки валидации должны исчезнуть
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  // SC-004: Кнопка «Clear» не отправляет форму
  test('SC-004: кнопка Clear не отправляет форму', async ({ page }) => {
    const email = uniqueEmail('sc-clear-004');
    await registerViaUI(page, email);

    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Заполняем форму
    await page.getByLabel('Title').fill('Тестовый заголовок');
    await page.getByLabel('Content').fill('Тестовое содержание');

    // Нажимаем Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // URL не изменился — форма не отправлена
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);

    // Возвращаемся на дашборд и проверяем что заметка НЕ создана
    await page.goto('/dashboard');
    await expect(page.getByText('Тестовый заголовок')).not.toBeVisible();
  });

  // SC-005: Кнопка «Clear» в форме редактирования сбрасывает поля в пустое состояние
  test('SC-005: кнопка Clear в форме редактирования сбрасывает поля', async ({ page }) => {
    const email = uniqueEmail('sc-clear-005');
    await registerViaUI(page, email);

    // Создаём заметку
    await page.getByTestId('new-note-link').click();
    await page.getByLabel('Title').fill('Заметка для редактирования');
    await page.getByLabel('Content').fill('Содержимое заметки');
    await page.getByRole('button', { name: 'Create Note' }).click();
    await page.waitForURL('**/dashboard');

    // Открываем заметку
    await page.getByTestId('note-title-link').filter({ hasText: 'Заметка для редактирования' }).click();

    // Нажимаем Edit
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.waitForURL(/\/dashboard\/notes\/.*\/edit/);

    // Проверяем что поля заполнены данными заметки
    await expect(page.getByLabel('Title')).toHaveValue('Заметка для редактирования');
    await expect(page.getByLabel('Content')).toHaveValue('Содержимое заметки');

    // Нажимаем Clear
    await page.getByRole('button', { name: 'Clear' }).click();

    // Все поля должны быть пустыми (не восстановлены к исходным значениям)
    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');
    await expect(page.getByTestId('category-select')).toHaveValue('');

    // URL не изменился
    await expect(page).toHaveURL(/\/dashboard\/notes\/.*\/edit/);
  });
});
