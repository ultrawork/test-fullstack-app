import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI, registerViaAPI, loginViaAPI, TEST_PASSWORD } from './helpers';

test.describe('Аутентификация', () => {
  // SC-001: Регистрация нового пользователя
  test('SC-001: регистрация нового пользователя', async ({ page }) => {
    const email = uniqueEmail('sc001');

    await page.goto('/register');

    // Проверяем наличие формы
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();

    // Заполняем форму
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();

    // Проверяем редирект на дашборд
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('user-email')).toContainText(email);
    await expect(page.getByRole('heading', { name: 'My Notes' })).toBeVisible();
  });

  // SC-002: Регистрация — валидация формы
  test('SC-002: валидация формы регистрации', async ({ page }) => {
    await page.goto('/register');

    // Шаг 1: пустые поля
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // Шаг 2: невалидный email
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // Шаг 3: короткий пароль
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // Шаг 4: пароли не совпадают
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill('DifferentPass');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // Остаёмся на странице регистрации
    await expect(page).toHaveURL(/\/register/);
  });

  // SC-003: Регистрация с уже занятым email
  test('SC-003: регистрация с дублирующимся email', async ({ request }) => {
    const email = uniqueEmail('sc003');

    // Создаём пользователя
    await registerViaAPI(request, email);

    // Пытаемся зарегистрировать с тем же email
    const response = await request.post('/api/v1/auth/register', {
      data: { email, password: TEST_PASSWORD, confirmPassword: TEST_PASSWORD },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBe('Email already registered');
  });

  // SC-004: Вход в систему с валидными данными
  test('SC-004: вход с валидными данными', async ({ page, request }) => {
    const email = uniqueEmail('sc004');
    await registerViaAPI(request, email);

    await page.goto('/login');

    // Проверяем форму
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    // Заполняем и отправляем
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Проверяем дашборд
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('user-email')).toContainText(email);
    await expect(page.getByRole('heading', { name: 'My Notes' })).toBeVisible();
  });

  // SC-005: Вход с невалидными учётными данными
  test('SC-005: вход с невалидными данными', async ({ request }) => {
    const email = uniqueEmail('sc005');
    await registerViaAPI(request, email);

    // Неверный пароль
    const resp1 = await request.post('/api/v1/auth/login', {
      data: { email, password: 'WrongPassword' },
    });
    expect(resp1.status()).toBe(401);
    const body1 = await resp1.json();
    expect(body1.error).toBe('Invalid credentials');

    // Несуществующий пользователь
    const resp2 = await request.post('/api/v1/auth/login', {
      data: { email: 'nonexistent@example.com', password: TEST_PASSWORD },
    });
    expect(resp2.status()).toBe(401);
    const body2 = await resp2.json();
    expect(body2.error).toBe('Invalid credentials');
  });

  // SC-006: Выход из системы
  test('SC-006: выход из системы', async ({ page }) => {
    const email = uniqueEmail('sc006');
    await registerViaUI(page, email);

    // Нажимаем Sign out
    await page.getByTestId('sign-out-button').click();

    // Ждём редирект на /login
    await page.waitForURL('**/login');

    // Пытаемся зайти на дашборд — должен редиректнуть
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
  });

  // SC-007: Защита маршрутов
  test('SC-007: редирект неавторизованного пользователя', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login');

    await page.goto('/dashboard/notes/new');
    await page.waitForURL('**/login');

    await page.goto('/dashboard/categories');
    await page.waitForURL('**/login');
  });

  // SC-008: Защита API — запросы без токена
  test('SC-008: API запросы без авторизации', async ({ request }) => {
    const resp1 = await request.get('/api/v1/notes');
    expect(resp1.status()).toBe(401);

    const resp2 = await request.post('/api/v1/notes', {
      data: { title: 'test', content: 'test' },
    });
    expect(resp2.status()).toBe(401);

    const resp3 = await request.get('/api/v1/categories');
    expect(resp3.status()).toBe(401);
  });
});
