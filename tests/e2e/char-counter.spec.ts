import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers";

test.describe("Счётчик символов в редакторе заметок", () => {
  const password = "securePassword123";

  test.beforeEach(async ({ page, request }) => {
    const email = uniqueEmail("charcounter");

    // Register via API with retries for reliability
    let regResponse;
    for (let attempt = 0; attempt < 5; attempt++) {
      regResponse = await request.post("/api/v1/auth/register", {
        data: { name: "CharCounter User", email, password },
      });
      if (regResponse.status() === 201) break;
      if (regResponse.status() === 400) {
        const body = await regResponse.json();
        if (body.error && body.error.includes("Email already in use")) break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Login via UI — wait for hydration first
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const emailInput = page.getByLabel("Email");
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    // Wait for dashboard to fully render (AuthGuard + data fetch)
    await page.getByRole("link", { name: "New Note" }).waitFor({ state: "visible", timeout: 15000 });
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
    await page.waitForLoadState("networkidle");

    const counter = page.getByTestId("char-counter");
    const contentField = page.getByLabel("Content");

    // Wait for NoteEditor to fully hydrate before interacting
    await contentField.waitFor({ state: "visible", timeout: 15000 });
    await counter.waitFor({ state: "visible", timeout: 15000 });

    // Вводим текст и проверяем обновление счётчика
    await contentField.fill("Hello");
    await expect(counter).toHaveText("5 characters", { timeout: 5000 });

    // Вводим больше текста
    await contentField.fill("Hello, World!");
    await expect(counter).toHaveText("13 characters", { timeout: 5000 });

    // Очищаем поле — снова 0
    await contentField.fill("");
    await expect(counter).toHaveText("0 characters", { timeout: 5000 });
  });

  // SC-052: Счётчик показывает "1 character" (единственное число) для одного символа
  test("SC-052: счётчик показывает 1 character для одного символа", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/dashboard/notes/new");
    await page.waitForLoadState("networkidle");

    const counter = page.getByTestId("char-counter");
    const contentField = page.getByLabel("Content");

    // Wait for NoteEditor to fully hydrate before interacting
    await contentField.waitFor({ state: "visible", timeout: 15000 });
    await counter.waitFor({ state: "visible", timeout: 15000 });

    await contentField.fill("A");
    await expect(counter).toHaveText("1 character", { timeout: 5000 });
  });

  // SC-053: Счётчик отображается при редактировании существующей заметки
  test("SC-053: счётчик отображается при редактировании существующей заметки", async ({
    page,
  }) => {
    // Создаём заметку через API (используя cookies из page context)
    const noteContent = "Содержимое заметки";
    const createResponse = await page.request.post("/api/v1/notes", {
      data: {
        title: "Заметка для редактирования",
        content: noteContent,
      },
    });
    const createBody = await createResponse.json();
    const noteId = createBody.data.id;

    // Переходим к редактированию напрямую
    await page.goto(`/dashboard/notes/${noteId}/edit`);
    await page.waitForLoadState("networkidle");

    // Ждём загрузки формы редактирования
    const contentField = page.getByLabel("Content");
    await contentField.waitFor({ state: "visible", timeout: 15000 });

    // Счётчик должен показывать длину предзаполненного содержимого
    const counter = page.getByTestId("char-counter");
    await counter.waitFor({ state: "visible", timeout: 15000 });
    // "Содержимое заметки" = 18 символов
    await expect(counter).toHaveText("18 characters", { timeout: 10000 });

    // Изменяем содержимое и проверяем обновление
    await contentField.fill("Новый текст");
    // "Новый текст" = 11 символов
    await expect(counter).toHaveText("11 characters", { timeout: 5000 });
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
