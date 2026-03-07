import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI, registerViaAPI, loginViaAPI, loginViaUI, TEST_PASSWORD } from './helpers';

test.describe('Заметки', () => {
  // SC-101: Создание заметки
  test('SC-101: создание заметки', async ({ page }) => {
    const email = uniqueEmail('sc101');
    await registerViaUI(page, email);

    // Нажимаем New Note в sidebar
    await page.getByTestId('new-note-link').click();
    await page.waitForURL('**/dashboard/notes/new');

    // Проверяем форму
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Content')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Note' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // Заполняем
    await page.getByLabel('Title').fill('Тестовая заметка');
    await page.getByLabel('Content').fill('Содержимое тестовой заметки для E2E');
    await page.getByRole('button', { name: 'Create Note' }).click();

    // Проверяем возврат на дашборд и наличие заметки
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('Тестовая заметка')).toBeVisible();
  });

  // SC-102: Валидация обязательных полей
  test('SC-102: валидация обязательных полей при создании', async ({ page }) => {
    const email = uniqueEmail('sc102');
    await registerViaUI(page, email);

    await page.goto('/dashboard/notes/new');

    // Оставляем поля пустыми и нажимаем Create Note
    await page.getByRole('button', { name: 'Create Note' }).click();

    // Должны появиться ошибки валидации
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);
  });

  // SC-103: Просмотр заметки
  test('SC-103: просмотр заметки', async ({ page }) => {
    const email = uniqueEmail('sc103');
    await registerViaUI(page, email);

    // Создаём заметку
    await page.getByTestId('new-note-link').click();
    await page.getByLabel('Title').fill('Тестовая заметка');
    await page.getByLabel('Content').fill('Содержимое тестовой заметки для E2E');
    await page.getByRole('button', { name: 'Create Note' }).click();
    await page.waitForURL('**/dashboard');

    // Кликаем на заголовок заметки
    await page.getByTestId('note-title-link').filter({ hasText: 'Тестовая заметка' }).click();

    // Проверяем страницу просмотра
    await expect(page.getByTestId('note-view')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Тестовая заметка' })).toBeVisible();
    await expect(page.getByText('Содержимое тестовой заметки для E2E')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  });

  // SC-104: Редактирование заметки
  test('SC-104: редактирование заметки', async ({ page }) => {
    const email = uniqueEmail('sc104');
    await registerViaUI(page, email);

    // Создаём заметку
    await page.getByTestId('new-note-link').click();
    await page.getByLabel('Title').fill('Тестовая заметка');
    await page.getByLabel('Content').fill('Старое содержимое');
    await page.getByRole('button', { name: 'Create Note' }).click();
    await page.waitForURL('**/dashboard');

    // Открываем заметку
    await page.getByTestId('note-title-link').filter({ hasText: 'Тестовая заметка' }).click();

    // Нажимаем Edit
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.waitForURL(/\/dashboard\/notes\/.*\/edit/);

    // Проверяем заполненные поля и изменяем
    await expect(page.getByLabel('Title')).toHaveValue('Тестовая заметка');
    await page.getByLabel('Title').fill('Обновлённая заметка');
    await page.getByLabel('Content').fill('Обновлённое содержимое');
    await page.getByRole('button', { name: 'Update Note' }).click();

    // Проверяем возврат и обновлённый заголовок
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('Обновлённая заметка')).toBeVisible();
  });

  // SC-105: Удаление заметки
  test('SC-105: удаление заметки', async ({ page }) => {
    const email = uniqueEmail('sc105');
    await registerViaUI(page, email);

    // Создаём заметку
    await page.getByTestId('new-note-link').click();
    await page.getByLabel('Title').fill('Заметка для удаления');
    await page.getByLabel('Content').fill('Контент');
    await page.getByRole('button', { name: 'Create Note' }).click();
    await page.waitForURL('**/dashboard');

    // Нажимаем кнопку удаления на карточке
    await page.getByTestId('note-delete-button').click();

    // Проверяем модальное окно
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete "Заметка для удаления"?')).toBeVisible();

    // Подтверждаем удаление
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

    // Проверяем что заметка исчезла
    await expect(page.getByText('Заметка для удаления')).not.toBeVisible();
  });

  // SC-106: Отмена удаления заметки
  test('SC-106: отмена удаления заметки', async ({ page }) => {
    const email = uniqueEmail('sc106');
    await registerViaUI(page, email);

    // Создаём заметку
    await page.getByTestId('new-note-link').click();
    await page.getByLabel('Title').fill('Заметка останется');
    await page.getByLabel('Content').fill('Контент');
    await page.getByRole('button', { name: 'Create Note' }).click();
    await page.waitForURL('**/dashboard');

    // Нажимаем удаление
    await page.getByTestId('note-delete-button').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Нажимаем Cancel
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    // Модалка закрылась, заметка на месте
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Заметка останется')).toBeVisible();
  });

  // SC-107: Поиск заметок
  test('SC-107: поиск заметок', async ({ page }) => {
    const email = uniqueEmail('sc107');
    await registerViaUI(page, email);

    // Создаём три заметки
    for (const [title, content] of [
      ['Рецепт борща', 'Свёкла, морковь, капуста'],
      ['Список дел', 'Купить продукты'],
      ['Идеи для проекта', 'Новая фича'],
    ]) {
      await page.getByTestId('new-note-link').click();
      await page.getByLabel('Title').fill(title);
      await page.getByLabel('Content').fill(content);
      await page.getByRole('button', { name: 'Create Note' }).click();
      await page.waitForURL('**/dashboard');
    }

    // Вводим поиск
    await page.getByTestId('search-input').fill('борщ');

    // Ждём debounce (300ms) и обновления
    await page.waitForTimeout(500);

    // Должна остаться только «Рецепт борща»
    await expect(page.getByText('Рецепт борща')).toBeVisible();
    await expect(page.getByText('Список дел')).not.toBeVisible();
    await expect(page.getByText('Идеи для проекта')).not.toBeVisible();
  });

  // SC-108: Поиск по содержимому (API)
  test('SC-108: поиск по содержимому заметок через API', async ({ request }) => {
    const email = uniqueEmail('sc108');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём заметку
    await request.post('/api/v1/notes', {
      data: { title: 'Список дел', content: 'Купить продукты' },
    });

    // Ищем по содержимому
    const response = await request.get('/api/v1/notes?search=продукты');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.some((n: { title: string }) => n.title === 'Список дел')).toBe(true);
  });

  // SC-109: CRUD заметок через API
  test('SC-109: CRUD заметок через API', async ({ request }) => {
    const email = uniqueEmail('sc109');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создание
    const createResp = await request.post('/api/v1/notes', {
      data: { title: 'API Note', content: 'API Content' },
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const noteId = created.data.id;

    // Получение
    const getResp = await request.get(`/api/v1/notes/${noteId}`);
    expect(getResp.status()).toBe(200);
    const fetched = await getResp.json();
    expect(fetched.data.title).toBe('API Note');

    // Обновление
    const updateResp = await request.put(`/api/v1/notes/${noteId}`, {
      data: { title: 'Updated Note', content: 'Updated Content' },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.title).toBe('Updated Note');

    // Удаление
    const deleteResp = await request.delete(`/api/v1/notes/${noteId}`);
    expect(deleteResp.status()).toBe(200);

    // Проверяем удаление
    const checkResp = await request.get(`/api/v1/notes/${noteId}`);
    expect(checkResp.status()).toBe(404);
  });
});
