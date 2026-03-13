import { test, expect } from "@playwright/test";
import { registerAndLogin, loginViaUI, uniqueEmail } from "./helpers";

// SC-001: Регистрация нового пользователя
test("SC-001: регистрация нового пользователя", async ({ page }) => {
  const email = uniqueEmail("sc001");
  await page.goto("/register");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("securePassword123");
  await page.getByRole("button", { name: "Create Account" }).click();

  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Test User")).toBeVisible({ timeout: 10000 });
});

// SC-002: Регистрация с невалидными данными
test("SC-002: регистрация с невалидными данными", async ({ page }) => {
  await page.goto("/register");

  // Попытка с пустыми полями — HTML валидация required не даст отправить,
  // но проверим что мы остаёмся на странице
  await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();

  // Заполняем невалидные данные
  await page.getByLabel("Name").fill("A");
  await page.getByLabel("Email").fill("invalid-email");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create Account" }).click();

  // Должны остаться на странице регистрации
  await expect(page).toHaveURL(/\/register/);
});

// SC-003: Вход в систему существующего пользователя
test("SC-003: вход существующего пользователя", async ({ page }) => {
  const email = uniqueEmail("sc003");
  // Сначала регистрируем
  await registerAndLogin(page, {
    name: "Login Test User",
    email,
    password: "securePassword123",
  });

  // Выходим
  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL("**/login");

  // Входим заново
  await loginViaUI(page, { email, password: "securePassword123" });
  await expect(page.getByText("Login Test User")).toBeVisible();
});

// SC-004: Вход с неверными учётными данными
test("SC-004: вход с неверными данными", async ({ page }) => {
  const email = uniqueEmail("sc004");
  // Регистрируем пользователя
  await registerAndLogin(page, {
    name: "Wrong Pass User",
    email,
    password: "securePassword123",
  });
  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL("**/login");

  // Пытаемся войти с неправильным паролем
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrongPassword");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

// SC-005: Выход из системы
test("SC-005: выход из системы", async ({ page }) => {
  const email = uniqueEmail("sc005");
  await registerAndLogin(page, {
    name: "Logout User",
    email,
    password: "securePassword123",
  });

  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL("**/login");

  // Попытка открыть dashboard — редирект на login
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

// SC-006: Защита приватных маршрутов
test("SC-006: защита приватных маршрутов", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/dashboard/notes/new");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/dashboard/tags");
  await expect(page).toHaveURL(/\/login/);
});

// SC-007: Регистрация с уже существующим email
test("SC-007: регистрация с дублирующим email", async ({ request }) => {
  const email = uniqueEmail("sc007");

  // Первая регистрация
  const first = await request.post("/api/v1/auth/register", {
    data: { email, name: "First User", password: "password123" },
  });
  expect(first.status()).toBe(201);

  // Повторная регистрация с тем же email
  const second = await request.post("/api/v1/auth/register", {
    data: { email, name: "Duplicate User", password: "password123" },
  });
  expect(second.status()).toBe(400);
  const body = await second.json();
  expect(body.success).toBe(false);
});
