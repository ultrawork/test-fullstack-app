import { test, expect } from "@playwright/test";
import { registerAndLogin, loginViaUI, uniqueEmail } from "./helpers";

// SC-001: Регистрация нового пользователя
test("SC-001: регистрация нового пользователя", async ({ page }) => {
  const email = uniqueEmail("sc001");
  await page.goto("/register");
  // Wait for hydration so React event handlers are attached
  await page.waitForLoadState("networkidle");

  const nameInput = page.getByLabel("Name");
  await nameInput.waitFor({ state: "visible", timeout: 10000 });
  await nameInput.fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("securePassword123");

  await page.getByRole("button", { name: "Create Account" }).click();

  await page.waitForURL("**/dashboard", { timeout: 15000 });
  // Wait for the dashboard to fully render (AuthGuard fetches user via /auth/me)
  await expect(page.getByText("Test User")).toBeVisible({ timeout: 15000 });
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
test("SC-003: вход существующего пользователя", async ({ page, request }) => {
  const email = uniqueEmail("sc003");

  // Регистрируем пользователя через API с retry для надёжности
  let regResponse;
  for (let attempt = 0; attempt < 5; attempt++) {
    regResponse = await request.post("/api/v1/auth/register", {
      data: { name: "Login Test User", email, password: "securePassword123" },
    });
    if (regResponse.status() === 201) break;
    if (regResponse.status() === 400) {
      const errBody = await regResponse.json();
      if (errBody.error && errBody.error.includes("Email already in use")) break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  expect([201, 400]).toContain(regResponse!.status());

  // Входим через UI
  await loginViaUI(page, { email, password: "securePassword123" });
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Login Test User")).toBeVisible({ timeout: 15000 });

  // Выходим
  const logoutButton = page.getByRole("button", { name: "Logout" });
  await expect(logoutButton).toBeVisible({ timeout: 10000 });
  await logoutButton.click();
  await page.waitForURL("**/login", { timeout: 10000 });

  // Входим заново
  await loginViaUI(page, { email, password: "securePassword123" });
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Login Test User")).toBeVisible({ timeout: 15000 });
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
  const logoutBtn = page.getByRole("button", { name: "Logout" });
  await expect(logoutBtn).toBeVisible({ timeout: 10000 });
  await logoutBtn.click();
  await page.waitForURL("**/login", { timeout: 10000 });

  // Пытаемся войти с неправильным паролем
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrongPassword");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByTestId("login-error")).toBeVisible({ timeout: 10000 });
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

  await page.waitForLoadState("networkidle");
  const logoutButton = page.getByRole("button", { name: "Logout" });
  await expect(logoutButton).toBeVisible({ timeout: 10000 });
  await logoutButton.click();
  await page.waitForURL("**/login", { timeout: 10000 });

  // Попытка открыть dashboard — редирект на login
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
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

  // Первая регистрация — retry для надёжности при проблемах с запуском сервера/БД
  let first;
  for (let attempt = 0; attempt < 5; attempt++) {
    first = await request.post("/api/v1/auth/register", {
      data: { email, name: "First User", password: "password123" },
    });
    if (first.status() === 201) break;
    // If we get 400 "Email already in use", the user was created on a prior attempt
    if (first.status() === 400) {
      const errBody = await first.json();
      if (errBody.error && errBody.error.includes("Email already in use")) break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  // Accept 201 (created) or 400 (already exists from a prior attempt that saved but errored on response)
  expect([201, 400]).toContain(first!.status());

  // Повторная регистрация с тем же email — должна вернуть ошибку
  const second = await request.post("/api/v1/auth/register", {
    data: { email, name: "Duplicate User", password: "password123" },
  });
  expect(second.status()).toBe(400);
  const body = await second.json();
  expect(body.success).toBe(false);
});
