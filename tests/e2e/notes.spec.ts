import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers";

test.describe("Заметки", () => {
  const password = "securePassword123";

  test.beforeEach(async ({ page, request }) => {
    const email = uniqueEmail("notes");

    // Register via API with retries for reliability
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await request.post("/api/v1/auth/register", {
        data: { name: "Notes User", email, password },
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
    // Wait for auth hydration — AuthGuard fetches /auth/me before rendering dashboard
    await expect(page.getByRole("heading", { name: "My Notes" })).toBeVisible({ timeout: 15000 });
  });

  // SC-010: Создание новой заметки
  test("SC-010: создание новой заметки", async ({ page }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/dashboard/notes/new");

    await page.getByLabel("Title").fill("Моя первая заметка");
    await page.getByLabel("Content").fill("Это текст заметки для тестирования");
    await page.getByRole("button", { name: "Create Note" }).click();

    // Должны перейти на страницу просмотра заметки
    await page.waitForURL(/\/dashboard\/notes\/.+/);
    await expect(page.getByText("Моя первая заметка")).toBeVisible();
    await expect(
      page.getByText("Это текст заметки для тестирования"),
    ).toBeVisible();
  });

  // SC-011: Создание заметки без обязательных полей
  test("SC-011: создание заметки без обязательных полей", async ({ page }) => {
    await page.goto("/dashboard/notes/new");
    // Wait for auth hydration — AuthGuard fetches /auth/me before rendering the form
    await expect(page.getByRole("heading", { name: "Create Note" })).toBeVisible({ timeout: 15000 });

    // Нажимаем Create без заполнения полей
    await page.getByRole("button", { name: "Create Note" }).click();

    // Должны остаться на странице создания
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);
  });

  // SC-012: Просмотр заметки
  test("SC-012: просмотр заметки", async ({ page }) => {
    // Создаём заметку через API с cookies браузера для надёжности
    const createRes = await page.request.post("/api/v1/notes", {
      data: { title: "Заметка для просмотра", content: "Содержимое заметки" },
    });
    const body = await createRes.json();
    const noteId = body.data.id;

    // Переходим на страницу просмотра заметки
    await page.goto(`/dashboard/notes/${noteId}`);
    await page.waitForLoadState("networkidle");

    // Ждём загрузки заметки (AuthGuard + fetchNote)
    await expect(page.getByText("Заметка для просмотра")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Содержимое заметки")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: "Edit" })).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: "Delete" }),
    ).toBeVisible({ timeout: 10000 });
  });

  // SC-013: Редактирование заметки
  test("SC-013: редактирование заметки", async ({ page }) => {
    // Создаём заметку
    await page.getByRole("link", { name: "New Note" }).click();
    await page.getByLabel("Title").fill("Моя первая заметка");
    await page.getByLabel("Content").fill("Исходный текст");
    await page.getByRole("button", { name: "Create Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/.+/);

    // Нажимаем Edit
    await page.getByRole("link", { name: "Edit" }).click();
    await page.waitForURL(/\/edit$/);

    // Редактируем
    await page.getByLabel("Title").fill("Обновлённая заметка");
    await page.getByLabel("Content").fill("Обновлённый текст");
    await page.getByRole("button", { name: "Update Note" }).click();

    // Проверяем обновлённые данные
    await page.waitForURL(/\/dashboard\/notes\/[^/]+$/);
    await expect(page.getByText("Обновлённая заметка")).toBeVisible();
    await expect(page.getByText("Обновлённый текст")).toBeVisible();
  });

  // SC-014: Удаление заметки
  test("SC-014: удаление заметки", async ({ page }) => {
    // Создаём заметку
    await page.getByRole("link", { name: "New Note" }).click();
    await page.getByLabel("Title").fill("Заметка для удаления");
    await page.getByLabel("Content").fill("Будет удалена");
    await page.getByRole("button", { name: "Create Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/.+/);

    // Удаляем
    await page.getByRole("button", { name: "Delete" }).first().click();

    // Подтверждаем в модальном окне
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Delete" }).click();

    // Должны вернуться на dashboard
    await page.waitForURL("**/dashboard");
    await expect(page.getByText("Заметка для удаления")).not.toBeVisible();
  });

  // SC-015: Отмена удаления заметки
  test("SC-015: отмена удаления заметки", async ({ page }) => {
    // Создаём заметку
    await page.getByRole("link", { name: "New Note" }).click();
    await page.getByLabel("Title").fill("Заметка не удаляется");
    await page.getByLabel("Content").fill("Останется на месте");
    await page.getByRole("button", { name: "Create Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/.+/);

    // Нажимаем Delete, потом Cancel
    await page.getByRole("button", { name: "Delete" }).first().click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Cancel" }).click();

    // Заметка осталась
    await expect(page.getByText("Заметка не удаляется")).toBeVisible();
  });

  // SC-016: Поиск заметок по тексту
  test("SC-016: поиск заметок по тексту", async ({ page }) => {
    // Создаём несколько заметок
    for (const title of [
      "Рецепт торта",
      "Список покупок",
      "Рецепт пиццы",
    ]) {
      await page.getByRole("link", { name: "New Note" }).click();
      await page.getByLabel("Title").fill(title);
      await page.getByLabel("Content").fill(`Содержимое: ${title}`);
      await page.getByRole("button", { name: "Create Note" }).click();
      await page.waitForURL(/\/dashboard\/notes\/.+/);
      await page.goto("/dashboard");
    }

    // Поиск
    await page.getByRole("searchbox", { name: "Search notes" }).fill("Рецепт");

    // Ждём debounce
    await page.waitForTimeout(500);

    await expect(page.getByText("Рецепт торта").first()).toBeVisible();
    await expect(page.getByText("Рецепт пиццы").first()).toBeVisible();
    await expect(page.getByText("Список покупок")).not.toBeVisible();
  });

  // SC-017: Отображение пустого состояния
  test("SC-017: пустое состояние без заметок", async ({ page }) => {
    await expect(page.getByText("No notes found")).toBeVisible();
    await expect(page.getByText("Create your first note")).toBeVisible();
  });

  // SC-018: Отмена создания заметки
  test("SC-018: отмена создания заметки", async ({ page }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.getByLabel("Title").fill("Черновик");
    await page.getByRole("button", { name: "Cancel" }).click();

    // Должны вернуться на dashboard
    await page.waitForURL("**/dashboard");
    await expect(page.getByText("Черновик")).not.toBeVisible();
  });
});
