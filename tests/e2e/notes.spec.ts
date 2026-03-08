import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers";

test.describe("Заметки", () => {
  let email: string;
  const password = "securePassword123";

  test.beforeEach(async ({ page }) => {
    email = uniqueEmail("notes");
    await registerAndLogin(page, {
      name: "Notes User",
      email,
      password,
    });
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

    // Нажимаем Create без заполнения полей
    await page.getByRole("button", { name: "Create Note" }).click();

    // Должны остаться на странице создания
    await expect(page).toHaveURL(/\/dashboard\/notes\/new/);
  });

  // SC-012: Просмотр заметки
  test("SC-012: просмотр заметки", async ({ page }) => {
    // Сначала создаём заметку
    await page.getByRole("link", { name: "New Note" }).click();
    await page.getByLabel("Title").fill("Заметка для просмотра");
    await page.getByLabel("Content").fill("Содержимое заметки");
    await page.getByRole("button", { name: "Create Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/.+/);

    // Проверяем элементы на странице просмотра
    await expect(page.getByText("Заметка для просмотра")).toBeVisible();
    await expect(page.getByText("Содержимое заметки")).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delete" }),
    ).toBeVisible();
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

    await expect(page.getByText("Рецепт торта")).toBeVisible();
    await expect(page.getByText("Рецепт пиццы")).toBeVisible();
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
