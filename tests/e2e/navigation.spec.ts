import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers";

// SC-050: Главная страница (лендинг)
test("SC-050: главная страница", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Notes App")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
});

// SC-051: Навигация из лендинга к авторизации
test("SC-051: навигация с лендинга к формам входа/регистрации", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/");
  await page.getByRole("link", { name: "Sign Up" }).click();
  await expect(page).toHaveURL(/\/register/);
});

// SC-052: Навигация по dashboard
test("SC-052: навигация по dashboard", async ({ page, request }) => {
  const email = uniqueEmail("sc052");
  const password = "securePassword123";

  // Register via API with retries for reliability
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await request.post("/api/v1/auth/register", {
      data: { name: "Nav User", email, password },
    });
    if (res.status() === 201) break;
    if (res.status() === 400) {
      const body = await res.json();
      if (body.error && body.error.includes("Email already in use")) break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Login via UI
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForLoadState("networkidle");

  // Создаём заметку для навигации
  await page.getByRole("link", { name: "New Note" }).click();
  await expect(page).toHaveURL(/\/dashboard\/notes\/new/);

  await page.getByLabel("Title").fill("Тест навигации");
  await page.getByLabel("Content").fill("Контент");
  await page.getByRole("button", { name: "Create Note" }).click();
  await page.waitForURL(/\/dashboard\/notes\/.+/);

  // Нажимаем Edit
  await page.getByRole("link", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);

  // Cancel возвращает назад
  await page.getByRole("button", { name: "Cancel" }).click();

  // Нажимаем Notes App — возврат на dashboard
  await page.getByRole("link", { name: "Notes App" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

// SC-053: Переключение между логином и регистрацией
test("SC-053: переключение между логином и регистрацией", async ({
  page,
}) => {
  await page.goto("/login");

  // Переход на регистрацию
  await page.getByRole("link", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/register/);

  // Назад на логин
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/login/);
});
