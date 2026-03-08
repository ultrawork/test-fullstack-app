import { type Page, type APIRequestContext } from "@playwright/test";

const BASE_URL = "http://localhost:4000";

/**
 * Регистрирует нового пользователя через API и возвращает cookies.
 */
export async function registerUser(
  request: APIRequestContext,
  data: { email: string; name: string; password: string },
): Promise<void> {
  await request.post(`${BASE_URL}/api/v1/auth/register`, {
    data,
  });
}

/**
 * Логин через API и возврат cookies.
 */
export async function loginUser(
  request: APIRequestContext,
  data: { email: string; password: string },
): Promise<void> {
  await request.post(`${BASE_URL}/api/v1/auth/login`, {
    data,
  });
}

/**
 * Регистрация + навигация на dashboard через UI.
 */
export async function registerAndLogin(
  page: Page,
  user: { name: string; email: string; password: string },
): Promise<void> {
  await page.goto("/register");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.waitForURL("**/dashboard");
}

/**
 * Логин через UI.
 */
export async function loginViaUI(
  page: Page,
  user: { email: string; password: string },
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");
}

/**
 * Генерирует уникальный email для изоляции тестов.
 */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
}
