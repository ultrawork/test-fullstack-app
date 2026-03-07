import { type Page, type APIRequestContext } from '@playwright/test';

/**
 * Генерирует уникальный email для тестов
 */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

const TEST_PASSWORD = 'TestPass123';

/**
 * Регистрирует нового пользователя через API и возвращает cookies
 */
export async function registerViaAPI(
  request: APIRequestContext,
  email: string,
  password = TEST_PASSWORD,
): Promise<void> {
  await request.post('/api/v1/auth/register', {
    data: { email, password, confirmPassword: password },
  });
}

/**
 * Логинит пользователя через API и возвращает контекст с cookies
 */
export async function loginViaAPI(
  request: APIRequestContext,
  email: string,
  password = TEST_PASSWORD,
): Promise<void> {
  await request.post('/api/v1/auth/login', {
    data: { email, password },
  });
}

/**
 * Регистрирует и логинит пользователя через UI
 */
export async function registerViaUI(page: Page, email: string, password = TEST_PASSWORD): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL('**/dashboard');
}

/**
 * Логинит пользователя через UI
 */
export async function loginViaUI(page: Page, email: string, password = TEST_PASSWORD): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
}

export { TEST_PASSWORD };
