import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers";

test.describe("Счётчик символов в редакторе заметок", () => {
  const password = "securePassword123";

  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail("charcounter");
    await registerAndLogin(page, {
      name: "CharCounter User",
      email,
      password,
    });
  });

  // SC-050: Счётчик показывает "0 characters" при пустом содержимом
  test("SC-050: счётчик показывает 0 characters при пустом содержимом", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/dashboard/notes/new");

    const counter = page.getByTestId("char-counter");
    await expect(counter).toBeVisible();
    await expect(counter).toHaveText("0 characters");
  });

  // SC-051: Счётчик обновляется в реальном времени при вводе текста
  test("SC-051: счётчик обновляется при вводе текста", async ({ page }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/dashboard/notes/new");

    const counter = page.getByTestId("char-counter");
    const contentField = page.getByLabel("Content");

    // Вводим текст и проверяем обновление счётчика
    await contentField.fill("Hello");
    await expect(counter).toHaveText("5 characters");

    // Вводим больше текста
    await contentField.fill("Hello, World!");
    await expect(counter).toHaveText("13 characters");

    // Очищаем поле — снова 0
    await contentField.fill("");
    await expect(counter).toHaveText("0 characters");
  });

  // SC-052: Счётчик показывает "1 character" (единственное число) для одного символа
  test("SC-052: счётчик показывает 1 character для одного символа", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/dashboard/notes/new");

    const counter = page.getByTestId("char-counter");
    const contentField = page.getByLabel("Content");

    await contentField.fill("A");
    await expect(counter).toHaveText("1 character");
  });

  // SC-053: Счётчик отображается при редактировании существующей заметки
  test("SC-053: счётчик отображается при редактировании существующей заметки", async ({
    page,
  }) => {
    // Создаём заметку
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/dashboard/notes/new");

    await page.getByLabel("Title").fill("Заметка для редактирования");
    await page.getByLabel("Content").fill("Содержимое заметки");
    await page.getByRole("button", { name: "Create Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/.+/);

    // Переходим к редактированию
    await page.getByRole("link", { name: "Edit" }).click();
    await page.waitForURL(/\/edit$/);

    // Счётчик должен показывать длину предзаполненного содержимого
    const counter = page.getByTestId("char-counter");
    await expect(counter).toBeVisible();
    // "Содержимое заметки" = 18 символов
    await expect(counter).toHaveText("18 characters");

    // Изменяем содержимое и проверяем обновление
    await page.getByLabel("Content").fill("Новый текст");
    // "Новый текст" = 11 символов
    await expect(counter).toHaveText("11 characters");
  });

  // SC-054: Счётчик имеет правильные стили (серый мелкий текст) и aria-live
  test("SC-054: счётчик имеет aria-live для доступности", async ({ page }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/dashboard/notes/new");

    const counter = page.getByTestId("char-counter");
    await expect(counter).toBeVisible();
    await expect(counter).toHaveAttribute("aria-live", "polite");
  });
});
