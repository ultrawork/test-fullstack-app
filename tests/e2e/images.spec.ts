import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers";
import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";

/**
 * Создаёт временный тестовый JPEG файл заданного размера.
 */
function createTestJpeg(dir: string, name: string, sizeKb: number = 10): string {
  const filePath = join(dir, name);
  // Минимальный валидный JPEG: начинается с FF D8 FF
  const header = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  const padding = Buffer.alloc(sizeKb * 1024 - header.length, 0x00);
  writeFileSync(filePath, Buffer.concat([header, padding]));
  return filePath;
}

/**
 * Создаёт временный тестовый PNG файл.
 */
function createTestPng(dir: string, name: string, sizeKb: number = 10): string {
  const filePath = join(dir, name);
  // Минимальный валидный PNG: magic bytes
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const padding = Buffer.alloc(sizeKb * 1024 - header.length, 0x00);
  writeFileSync(filePath, Buffer.concat([header, padding]));
  return filePath;
}

const TEST_FILES_DIR = join(__dirname, "..", "..", "test-fixtures");

test.describe("Изображения", () => {
  const password = "securePassword123";

  test.beforeAll(() => {
    // Создаём директорию для тестовых файлов
    mkdirSync(TEST_FILES_DIR, { recursive: true });
    createTestJpeg(TEST_FILES_DIR, "test-image.jpg", 10);
    createTestPng(TEST_FILES_DIR, "test-image.png", 10);
    createTestJpeg(TEST_FILES_DIR, "image1.jpg", 10);
    createTestJpeg(TEST_FILES_DIR, "image2.jpg", 10);
    createTestJpeg(TEST_FILES_DIR, "image3.jpg", 10);
    createTestJpeg(TEST_FILES_DIR, "image4.jpg", 10);
    createTestJpeg(TEST_FILES_DIR, "image5.jpg", 10);
    createTestJpeg(TEST_FILES_DIR, "image6.jpg", 10);
  });

  test.beforeEach(async ({ page, request }) => {
    const email = uniqueEmail("images");

    // Register via API with retries for reliability
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await request.post("/api/v1/auth/register", {
        data: { name: "Images User", email, password },
      });
      if (res.status() === 201) break;
      if (res.status() === 400) {
        const body = await res.json();
        if (body.error && body.error.includes("Email already in use")) break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Login via UI — wait for full hydration before interacting
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const emailInput = page.getByLabel("Email");
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.fill(email);
    await page.getByLabel("Password").fill(password);

    const signInButton = page.getByRole("button", { name: "Sign In" });
    await signInButton.waitFor({ state: "visible", timeout: 10000 });
    await signInButton.click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForLoadState("networkidle");
  });

  // SC-016: Загрузка изображений при редактировании заметки
  test("SC-016: загрузка изображения при редактировании заметки", async ({ page }) => {
    // Создаём заметку
    const newNoteLink = page.getByRole("link", { name: "New Note" });
    await newNoteLink.waitFor({ state: "visible", timeout: 10000 });
    await newNoteLink.click();
    await page.waitForURL("**/dashboard/notes/new");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Title").fill("Заметка с фото (edit)");
    await page.getByLabel("Content").fill("Тест загрузки при редактировании");
    await page.getByRole("button", { name: "Create Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/.+/);
    await page.waitForLoadState("networkidle");

    // Переходим на страницу редактирования
    const editLink = page.getByRole("link", { name: "Edit" });
    await editLink.waitFor({ state: "visible", timeout: 10000 });
    await editLink.click();
    await page.waitForURL(/\/edit$/);
    await page.waitForLoadState("networkidle");

    // Загружаем файл через input[type=file]
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: "attached", timeout: 10000 });
    await fileInput.setInputFiles(join(TEST_FILES_DIR, "test-image.jpg"));

    // Ожидаем появление pending-превью
    await expect(page.getByAltText("Pending upload test-image.jpg")).toBeVisible({ timeout: 10000 });

    // Нажимаем Upload (immediateUpload = true для редактирования)
    await page.getByRole("button", { name: /Upload 1 image/ }).click();

    // Ждём завершения загрузки — изображение перемещается из pending в existing
    await expect(page.getByRole("button", { name: /Upload/ })).not.toBeVisible({ timeout: 10000 });

    // Сохраняем заметку
    await page.getByRole("button", { name: "Update Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/[^/]+$/);
    await page.waitForLoadState("networkidle");

    // На странице просмотра должна быть галерея с изображением
    await expect(page.locator('section[aria-label="Image gallery"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('section[aria-label="Image gallery"] img')).toBeVisible({ timeout: 10000 });
  });

  // SC-017: Загрузка изображений при создании новой заметки
  test("SC-017: загрузка изображений при создании новой заметки", async ({ page }) => {
    const newNoteLink = page.getByRole("link", { name: "New Note" });
    await newNoteLink.waitFor({ state: "visible", timeout: 10000 });
    await newNoteLink.click();
    await page.waitForURL("**/dashboard/notes/new");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Title").fill("Заметка с фото");
    await page.getByLabel("Content").fill("Тест загрузки изображений");

    // Добавляем 2 файла (JPEG и PNG)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: "attached", timeout: 10000 });
    await fileInput.setInputFiles([
      join(TEST_FILES_DIR, "test-image.jpg"),
      join(TEST_FILES_DIR, "test-image.png"),
    ]);

    // Проверяем что pending-превью отображаются
    await expect(page.getByAltText("Pending upload test-image.jpg")).toBeVisible({ timeout: 10000 });
    await expect(page.getByAltText("Pending upload test-image.png")).toBeVisible({ timeout: 10000 });

    // Создаём заметку (pendingImages загрузятся после создания)
    await page.getByRole("button", { name: "Create Note" }).click();

    // Должны перейти на страницу просмотра
    await page.waitForURL(/\/dashboard\/notes\/.+/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Оба изображения должны отображаться в галерее
    await expect(page.locator('section[aria-label="Image gallery"]')).toBeVisible({ timeout: 10000 });
    const galleryImages = page.locator('section[aria-label="Image gallery"] img');
    await expect(galleryImages).toHaveCount(2, { timeout: 10000 });

    // Проверяем thumbnails на дашборде
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[role="group"][aria-label="Image attachments"] img').first()).toBeVisible({ timeout: 10000 });
  });

  // SC-018: Удаление изображения из заметки
  test("SC-018: удаление изображения из заметки", async ({ page }) => {
    // Создаём заметку с изображением — wait for auth hydration first
    const newNoteLink = page.getByRole("link", { name: "New Note" });
    await newNoteLink.waitFor({ state: "visible", timeout: 10000 });
    await newNoteLink.click();
    await page.waitForURL("**/dashboard/notes/new");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Title").fill("Заметка для удаления фото");
    await page.getByLabel("Content").fill("Тест удаления");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: "attached", timeout: 10000 });
    await fileInput.setInputFiles(join(TEST_FILES_DIR, "test-image.jpg"));

    // Wait for pending preview before creating
    await expect(page.getByAltText("Pending upload test-image.jpg")).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Create Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/.+/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Убеждаемся что изображение есть
    await expect(page.locator('section[aria-label="Image gallery"] img')).toBeVisible({ timeout: 10000 });

    // Переходим в редактирование
    const editLink = page.getByRole("link", { name: "Edit" });
    await editLink.waitFor({ state: "visible", timeout: 10000 });
    await editLink.click();
    await page.waitForURL(/\/edit$/);
    await page.waitForLoadState("networkidle");

    // Нажимаем кнопку удаления изображения
    const removeButton = page.getByRole("button", { name: /Remove image/ });
    await expect(removeButton).toBeVisible({ timeout: 10000 });
    await removeButton.click();

    // Сохраняем
    await page.getByRole("button", { name: "Update Note" }).click();
    await page.waitForURL(/\/dashboard\/notes\/[^/]+$/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Галерея должна исчезнуть (нет изображений)
    await expect(page.locator('section[aria-label="Image gallery"]')).not.toBeVisible({ timeout: 10000 });
  });

  // SC-019: Валидация загрузки — неподдерживаемый формат
  test("SC-019: валидация загрузки — неподдерживаемый формат", async ({ page }) => {
    // Создаём тестовый GIF файл
    const gifPath = join(TEST_FILES_DIR, "test-invalid.gif");
    writeFileSync(gifPath, Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]));

    await page.getByRole("link", { name: "New Note" }).click();
    await page.getByLabel("Title").fill("Тест валидации");
    await page.getByLabel("Content").fill("Невалидный формат");

    // Загружаем GIF — accept атрибут ограничивает выбор, но проверим через API
    // Пробуем загрузить — если accept блокирует, файл не добавится
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(gifPath);

    // Должна появиться ошибка валидации или файл не будет добавлен
    const errorAlert = page.getByRole("alert");
    const hasPending = page.getByAltText(/Pending upload/);

    // Одно из двух: ошибка показана или файл не появился
    const errorVisible = await errorAlert.isVisible().catch(() => false);
    const pendingVisible = await hasPending.isVisible().catch(() => false);

    // Если ошибка — проверяем текст
    if (errorVisible) {
      await expect(errorAlert).toContainText(/Invalid file type|Only JPEG and PNG/);
    }
    // Если нет ошибки — файл просто не должен быть в pending
    expect(errorVisible || !pendingVisible).toBe(true);
  });

  // SC-020: Ограничение на максимум 5 изображений
  test("SC-020: ограничение на максимум 5 изображений", async ({ page }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.getByLabel("Title").fill("Тест лимита изображений");
    await page.getByLabel("Content").fill("Максимум 5 фото");

    const fileInput = page.locator('input[type="file"]');

    // Загружаем 5 изображений
    await fileInput.setInputFiles([
      join(TEST_FILES_DIR, "image1.jpg"),
      join(TEST_FILES_DIR, "image2.jpg"),
      join(TEST_FILES_DIR, "image3.jpg"),
      join(TEST_FILES_DIR, "image4.jpg"),
      join(TEST_FILES_DIR, "image5.jpg"),
    ]);

    // Счётчик должен показывать 5/5
    await expect(page.getByText("Images (5/5)")).toBeVisible();

    // Drop-zone должна исчезнуть (canAddMore = false)
    await expect(page.getByRole("button", { name: "Drop images here or click to select" })).not.toBeVisible();

    // После 5 изображений элемент загрузки должен быть скрыт (canAddMore = false)
    await expect(page.locator('input[type="file"]')).toBeHidden();
    await expect(page.getByText("Images (5/5)")).toBeVisible();
  });
});
