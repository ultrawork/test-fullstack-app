import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * E2E тесты для функциональности экспорта заметки в текстовый файл.
 * Сценарии SC-004 — SC-007.
 */

// SC-004: Карточка заметки отображает данные и кнопку экспорта
test("SC-004: карточка заметки отображает все элементы и кнопку экспорта", async ({
  page,
}) => {
  await page.goto("/test-note/simple");

  // Карточка заметки отображается
  const card = page.getByTestId("note-card");
  await expect(card).toBeVisible();

  // Заголовок заметки в теге h2
  const title = page.getByTestId("note-title");
  await expect(title).toBeVisible();
  await expect(title).toHaveText("My Note");

  // Даты создания и обновления (теги <time>)
  const times = card.locator("time");
  await expect(times).toHaveCount(2);
  await expect(times.nth(0)).toContainText("Created:");
  await expect(times.nth(1)).toContainText("Updated:");

  // Содержимое заметки в секции
  const content = page.getByTestId("note-content");
  await expect(content).toBeVisible();
  await expect(content).toHaveText("Note body text");

  // Футер с кнопкой экспорта
  const footer = page.getByTestId("note-footer");
  await expect(footer).toBeVisible();

  // Кнопка экспорта с aria-label и иконкой
  const exportButton = page.getByTestId("export-button");
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toHaveAttribute(
    "aria-label",
    "Export note as text file",
  );
  await expect(exportButton).toContainText("Export");

  // SVG-иконка внутри кнопки
  const svg = exportButton.locator("svg");
  await expect(svg).toBeVisible();
});

// SC-005: Экспорт заметки скачивает .txt файл
test("SC-005: нажатие кнопки Export инициирует скачивание .txt файла", async ({
  page,
}) => {
  await page.goto("/test-note/simple");

  // Ожидаем событие скачивания при клике на кнопку Export
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-button").click();
  const download = await downloadPromise;

  // Файл имеет расширение .txt
  const filename = download.suggestedFilename();
  expect(filename).toMatch(/\.txt$/);

  // Имя файла соответствует заголовку заметки (пробелы заменены на _)
  expect(filename).toBe("My_Note.txt");

  // Файл не пустой
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const fileContent = fs.readFileSync(filePath!, "utf-8");
  expect(fileContent.length).toBeGreaterThan(0);
});

// SC-006: Формат экспортированного файла содержит метаданные и контент
test("SC-006: экспортированный файл содержит метаданные и контент в правильном формате", async ({
  page,
}) => {
  await page.goto("/test-note/simple");

  // Скачиваем файл
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-button").click();
  const download = await downloadPromise;

  const filePath = await download.path();
  const rawContent = fs.readFileSync(filePath!, "utf-8");

  // BOM-маркер в начале файла (U+FEFF)
  expect(rawContent.charCodeAt(0)).toBe(0xfeff);

  // Убираем BOM для проверки содержимого
  const content = rawContent.replace(/^\uFEFF/, "");
  const lines = content.split("\n");

  // Первая строка: Title
  expect(lines[0]).toBe("Title: My Note");

  // Вторая строка: Created
  expect(lines[1]).toBe("Created: 2024-01-15T10:00:00Z");

  // Третья строка: Updated
  expect(lines[2]).toBe("Updated: 2024-01-16T12:00:00Z");

  // Разделитель ---
  expect(lines[3]).toBe("---");

  // Содержимое после разделителя
  expect(lines[4]).toBe("Note body text");

  // Строки Category: и Tags: отсутствуют (заметка без категории и тегов)
  expect(content).not.toContain("Category:");
  expect(content).not.toContain("Tags:");
});

// SC-007: Экспорт заметки с категорией и тегами включает дополнительные метаданные
test("SC-007: экспорт заметки с категорией и тегами включает метаданные", async ({
  page,
}) => {
  await page.goto("/test-note/with-meta");

  // Проверяем отображение категории и тегов в карточке
  const category = page.getByTestId("note-category");
  await expect(category).toBeVisible();
  await expect(category).toHaveText("Work");

  const tagsContainer = page.getByTestId("note-tags");
  await expect(tagsContainer).toBeVisible();
  await expect(tagsContainer).toContainText("important");
  await expect(tagsContainer).toContainText("project");

  // Скачиваем файл
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-button").click();
  const download = await downloadPromise;

  const filePath = await download.path();
  const rawContent = fs.readFileSync(filePath!, "utf-8");
  const content = rawContent.replace(/^\uFEFF/, "");
  const lines = content.split("\n");

  // Метаданные перед разделителем
  expect(lines[0]).toBe("Title: Work Note");
  expect(lines[1]).toBe("Created: 2024-01-15T10:00:00Z");
  expect(lines[2]).toBe("Updated: 2024-01-16T12:00:00Z");
  expect(lines[3]).toBe("Category: Work");
  expect(lines[4]).toBe("Tags: important, project");

  // Разделитель
  expect(lines[5]).toBe("---");

  // Содержимое после разделителя
  expect(lines[6]).toBe("Task list");
});
