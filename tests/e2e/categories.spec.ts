import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI, registerViaAPI, loginViaAPI, TEST_PASSWORD } from './helpers';

test.describe('Категории', () => {
  // SC-201: Создание категории
  test('SC-201: создание категории', async ({ page }) => {
    const email = uniqueEmail('sc201');
    await registerViaUI(page, email);

    await page.goto('/dashboard/categories');

    // Проверяем форму
    await expect(page.getByText('Add Category')).toBeVisible();
    await expect(page.getByLabel('Category name')).toBeVisible();
    await expect(page.getByLabel('Color')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();

    // Заполняем и создаём
    await page.getByLabel('Category name').fill('Работа');
    await page.getByRole('button', { name: 'Add' }).click();

    // Проверяем появление категории
    await expect(page.getByTestId('categories-page').getByText('Работа')).toBeVisible();
    await expect(page.getByTestId('categories-page').getByText('0 notes')).toBeVisible();

    // Поле ввода очищено
    await expect(page.getByLabel('Category name')).toHaveValue('');
  });

  // SC-202: Дубликат категории (API)
  test('SC-202: создание категории с дублирующимся именем', async ({ request }) => {
    const email = uniqueEmail('sc202');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём категорию
    await request.post('/api/v1/categories', {
      data: { name: 'Работа' },
    });

    // Пытаемся создать дубликат
    const response = await request.post('/api/v1/categories', {
      data: { name: 'работа' },
    });
    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBe('Category with this name already exists');
  });

  // SC-203: Редактирование категории
  test('SC-203: редактирование категории', async ({ page }) => {
    const email = uniqueEmail('sc203');
    await registerViaUI(page, email);

    await page.goto('/dashboard/categories');

    // Создаём категорию
    await page.getByLabel('Category name').fill('Работа');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Работа')).toBeVisible();

    // Нажимаем Edit
    await page.getByRole('button', { name: 'Edit Работа' }).click();

    // Проверяем модальное окно
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel('Category name')).toHaveValue('Работа');

    // Изменяем
    await page.getByRole('dialog').getByLabel('Category name').fill('Проекты');
    await page.getByRole('dialog').getByRole('button', { name: 'Update' }).click();

    // Модалка закрылась, обновлённое имя
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Проекты')).toBeVisible();
  });

  // SC-204: Удаление категории
  test('SC-204: удаление категории', async ({ page }) => {
    const email = uniqueEmail('sc204');
    await registerViaUI(page, email);

    await page.goto('/dashboard/categories');

    // Создаём категорию
    await page.getByLabel('Category name').fill('Для удаления');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Для удаления')).toBeVisible();

    // Нажимаем Delete
    await page.getByRole('button', { name: 'Delete Для удаления' }).click();

    // Проверяем модальное окно
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByText('Are you sure you want to delete this category?'),
    ).toBeVisible();

    // Подтверждаем
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

    // Категория исчезла
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Для удаления')).not.toBeVisible();
  });

  // SC-205: Фильтрация заметок по категории
  test('SC-205: фильтрация заметок по категории', async ({ page, request }) => {
    const email = uniqueEmail('sc205');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём категории через API
    const cat1Resp = await request.post('/api/v1/categories', { data: { name: 'Работа' } });
    const cat1 = await cat1Resp.json();
    const cat2Resp = await request.post('/api/v1/categories', { data: { name: 'Личное' } });
    const cat2 = await cat2Resp.json();

    // Создаём заметки с привязкой к категориям
    await request.post('/api/v1/notes', {
      data: { title: 'Рабочая задача', content: 'Работа', categoryId: cat1.data.id },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Дневник', content: 'Личное', categoryId: cat2.data.id },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Без категории', content: 'Разное' },
    });

    // Логинимся через UI
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/dashboard');

    // Фильтруем по «Работа»
    await page.getByRole('button', { name: /Работа/ }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Рабочая задача')).toBeVisible();
    await expect(page.getByText('Дневник')).not.toBeVisible();

    // Фильтруем по «Личное»
    await page.getByRole('button', { name: /Личное/ }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Дневник')).toBeVisible();
    await expect(page.getByText('Рабочая задача')).not.toBeVisible();

    // Сбрасываем — All Notes
    await page.getByRole('button', { name: 'All Notes' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Рабочая задача')).toBeVisible();
    await expect(page.getByText('Дневник')).toBeVisible();
    await expect(page.getByText('Без категории')).toBeVisible();
  });

  // SC-206: Создание заметки с привязкой к категории
  test('SC-206: создание заметки с категорией', async ({ page, request }) => {
    const email = uniqueEmail('sc206');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём категорию через API
    await request.post('/api/v1/categories', { data: { name: 'Работа' } });

    // Логинимся через UI
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/dashboard');

    // Создаём заметку с категорией
    await page.getByTestId('new-note-link').click();
    await page.getByLabel('Title').fill('Заметка с категорией');
    await page.getByLabel('Content').fill('Тестовое содержимое');
    await page.getByLabel('Category').selectOption({ label: 'Работа' });
    await page.getByRole('button', { name: 'Create Note' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByText('Заметка с категорией')).toBeVisible();
    await expect(page.getByText('Работа')).toBeVisible();
  });

  // SC-207: CRUD категорий через API
  test('SC-207: CRUD категорий через API', async ({ request }) => {
    const email = uniqueEmail('sc207');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создание
    const createResp = await request.post('/api/v1/categories', {
      data: { name: 'API Category', color: '#ff5733' },
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const catId = created.data.id;

    // Получение списка
    const listResp = await request.get('/api/v1/categories');
    expect(listResp.status()).toBe(200);
    const list = await listResp.json();
    const found = list.data.find((c: { name: string }) => c.name === 'API Category');
    expect(found).toBeTruthy();
    expect(found.color).toBe('#ff5733');

    // Обновление
    const updateResp = await request.put(`/api/v1/categories/${catId}`, {
      data: { name: 'Updated Category' },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.name).toBe('Updated Category');

    // Удаление
    const deleteResp = await request.delete(`/api/v1/categories/${catId}`);
    expect(deleteResp.status()).toBe(200);

    // Проверяем удаление
    const listAfter = await request.get('/api/v1/categories');
    const afterBody = await listAfter.json();
    expect(
      afterBody.data.find((c: { name: string }) => c.name === 'Updated Category'),
    ).toBeFalsy();
  });

  // SC-208: Валидация невалидного цвета (API)
  test('SC-208: валидация невалидного цвета категории', async ({ request }) => {
    const email = uniqueEmail('sc208');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    const response = await request.post('/api/v1/categories', {
      data: { name: 'Bad Color', color: 'not-a-color' },
    });
    expect(response.status()).toBe(400);
  });
});
