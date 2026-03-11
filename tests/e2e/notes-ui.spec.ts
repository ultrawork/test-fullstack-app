import { test, expect } from "@playwright/test";

const APP_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || APP_URL;

/**
 * Вспомогательная функция: создать заметку через API
 */
async function createNoteViaAPI(
  request: import("@playwright/test").APIRequestContext,
  title: string,
  content?: string,
) {
  const body: Record<string, string> = { title };
  if (content !== undefined) {
    body.content = content;
  }
  const response = await request.post(`${API_URL}/api/v1/notes`, {
    data: body,
  });
  expect(response.status()).toBe(201);
  return response.json();
}

/**
 * Вспомогательная функция: удалить все заметки через API
 */
async function deleteAllNotes(
  request: import("@playwright/test").APIRequestContext,
) {
  const response = await request.get(`${API_URL}/api/v1/notes`);
  const notes = await response.json();
  for (const note of notes) {
    await request.delete(`${API_URL}/api/v1/notes/${note.id}`);
  }
}

test.beforeEach(async ({ request }) => {
  // Очистка всех заметок перед каждым тестом
  await deleteAllNotes(request);
});

// SC-001: Отображение пустого списка заметок
test("SC-001: отображение пустого списка заметок", async ({ page }) => {
  await page.goto("/");

  // Проверяем заголовок
  await expect(page.getByTestId("app-title")).toHaveText("Notes App");

  // Проверяем сообщение о пустом списке
  await expect(page.getByTestId("empty-notes-message")).toHaveText(
    "No notes yet. Create your first note!",
  );

  // Проверяем, что список заметок не отображается
  await expect(page.getByTestId("notes-list")).not.toBeVisible();
});

// SC-002: Отображение списка заметок
test("SC-002: отображение списка заметок", async ({ page, request }) => {
  // Создаём 3 заметки через API
  await createNoteViaAPI(request, "Первая заметка", "Содержимое первой заметки");
  await createNoteViaAPI(request, "Вторая заметка", "Содержимое второй заметки");
  await createNoteViaAPI(request, "Заметка без содержимого");

  await page.goto("/");

  // Ждём загрузку списка
  await expect(page.getByTestId("notes-list")).toBeVisible();

  // Проверяем, что отображается 3 карточки
  const cards = page.getByTestId("note-card");
  await expect(cards).toHaveCount(3);

  // Проверяем, что каждая карточка содержит заголовок
  await expect(page.getByText("Первая заметка")).toBeVisible();
  await expect(page.getByText("Вторая заметка")).toBeVisible();
  await expect(page.getByText("Заметка без содержимого")).toBeVisible();

  // Проверяем, что карточки с содержимым показывают текст
  await expect(page.getByText("Содержимое первой заметки")).toBeVisible();
  await expect(page.getByText("Содержимое второй заметки")).toBeVisible();

  // Проверяем наличие кнопок закрепления на каждой карточке
  const pinButtons = page.getByRole("button", { name: "Pin note" });
  await expect(pinButtons).toHaveCount(3);

  // Проверяем наличие кнопок удаления
  await expect(
    page.getByRole("button", { name: "Delete note: Первая заметка" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete note: Вторая заметка" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Delete note: Заметка без содержимого",
    }),
  ).toBeVisible();
});

// SC-003: Закрепление и открепление заметки через UI
test("SC-003: закрепление и открепление заметки через UI", async ({
  page,
  request,
}) => {
  await createNoteViaAPI(request, "Заметка A", "Текст A");
  await createNoteViaAPI(request, "Заметка B", "Текст B");

  await page.goto("/");
  await expect(page.getByTestId("notes-list")).toBeVisible();

  // Находим карточку "Заметка A" и кнопку Pin на ней
  const noteCardA = page
    .getByTestId("note-card")
    .filter({ hasText: "Заметка A" });

  // Шаг 2: Нажать кнопку закрепления на "Заметка A"
  const pinButtonA = noteCardA.getByRole("button", { name: "Pin note" });
  await pinButtonA.click();

  // Проверяем, что кнопка стала "Unpin note" с aria-pressed="true"
  const unpinButtonA = noteCardA.getByRole("button", { name: "Unpin note" });
  await expect(unpinButtonA).toHaveAttribute("aria-pressed", "true");

  // Проверяем визуальное отличие — синяя обводка и голубой фон
  const articleA = noteCardA.locator("article");
  await expect(articleA).toHaveClass(/border-blue-300/);
  await expect(articleA).toHaveClass(/bg-blue-50/);

  // Шаг 4: Нажать кнопку открепления
  await unpinButtonA.click();

  // Проверяем, что кнопка вернулась к "Pin note" с aria-pressed="false"
  const pinButtonAgain = noteCardA.getByRole("button", { name: "Pin note" });
  await expect(pinButtonAgain).toHaveAttribute("aria-pressed", "false");

  // Проверяем возврат к обычному стилю
  await expect(articleA).toHaveClass(/border-gray-200/);
  await expect(articleA).toHaveClass(/bg-white/);
});

// SC-004: Закреплённые заметки отображаются вверху списка
test("SC-004: закреплённые заметки отображаются вверху списка", async ({
  page,
  request,
}) => {
  // Создаём 3 заметки в указанном порядке
  await createNoteViaAPI(request, "Заметка 1", "Первая");
  await createNoteViaAPI(request, "Заметка 2", "Вторая");
  await createNoteViaAPI(request, "Заметка 3", "Третья");

  await page.goto("/");
  await expect(page.getByTestId("notes-list")).toBeVisible();

  // Проверяем исходный порядок (новые первыми): Заметка 3, Заметка 2, Заметка 1
  const cardTitles = page.getByTestId("note-title");
  await expect(cardTitles.nth(0)).toHaveText("Заметка 3");
  await expect(cardTitles.nth(1)).toHaveText("Заметка 2");
  await expect(cardTitles.nth(2)).toHaveText("Заметка 1");

  // Шаг 3: Закрепляем "Заметка 1" (последнюю)
  const noteCard1 = page
    .getByTestId("note-card")
    .filter({ hasText: "Заметка 1" });
  await noteCard1.getByRole("button", { name: "Pin note" }).click();

  // Ждём, пока "Заметка 1" переместится на первое место
  await expect(cardTitles.nth(0)).toHaveText("Заметка 1");

  // Проверяем, что "Заметка 1" визуально выделена
  const firstCard = page.getByTestId("note-card").nth(0);
  const firstArticle = firstCard.locator("article");
  await expect(firstArticle).toHaveClass(/border-blue-300/);
  await expect(firstArticle).toHaveClass(/bg-blue-50/);

  // Остальные заметки идут после закреплённых
  await expect(cardTitles.nth(1)).toHaveText("Заметка 3");
  await expect(cardTitles.nth(2)).toHaveText("Заметка 2");
});

// SC-005: Удаление заметки через UI
test("SC-005: удаление заметки через UI", async ({ page, request }) => {
  await createNoteViaAPI(request, "Удаляемая заметка", "Текст");

  await page.goto("/");
  await expect(page.getByTestId("notes-list")).toBeVisible();

  // Убеждаемся, что карточка отображается
  await expect(page.getByText("Удаляемая заметка")).toBeVisible();

  // Нажимаем кнопку удаления
  await page
    .getByRole("button", { name: "Delete note: Удаляемая заметка" })
    .click();

  // Проверяем, что карточка исчезла и показывается сообщение о пустом списке
  await expect(page.getByTestId("empty-notes-message")).toBeVisible();
  await expect(page.getByTestId("empty-notes-message")).toHaveText(
    "No notes yet. Create your first note!",
  );

  // Проверяем через API, что заметок нет
  const response = await request.get(`${API_URL}/api/v1/notes`);
  const notes = await response.json();
  expect(notes).toHaveLength(0);
});
