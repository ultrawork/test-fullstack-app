import { test, expect } from "@playwright/test";

// SC-001: Главная страница загружается и отображает список заметок
test("SC-001: главная страница отображает список из 5 заметок", async ({ page }) => {
  await page.goto("/");

  // Проверяем заголовок
  await expect(page.getByRole("heading", { name: "Notes App", exact: true })).toBeVisible();

  // Проверяем поле поиска
  await expect(page.getByTestId("search-input")).toBeVisible();

  // Проверяем контейнер списка заметок
  const notesList = page.getByTestId("notes-list");
  await expect(notesList).toBeVisible();

  // Проверяем 5 карточек заметок
  const articles = notesList.locator("article");
  await expect(articles).toHaveCount(5);
});

// SC-002: Карточка заметки отображает заголовок, контент и дату
test("SC-002: карточка заметки содержит заголовок, контент и дату", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  await expect(notesList.locator("article").first()).toBeVisible();

  // Находим карточку «Список покупок»
  const card = notesList.locator("article", { hasText: "Список покупок" });
  await expect(card).toBeVisible();

  // Проверяем заголовок в h2
  await expect(card.locator("h2")).toHaveText("Список покупок");

  // Проверяем контент
  await expect(card.locator("p")).toContainText("Молоко, хлеб, яйца, масло, сыр, помидоры, огурцы");

  // Проверяем наличие даты (элемент time)
  await expect(card.locator("time")).toBeVisible();

  // Проверяем семантику — article элемент
  await expect(card).toBeVisible();
});

// SC-003: Контент до 150 символов не обрезается
test("SC-003: короткий контент отображается полностью без многоточия", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  await expect(notesList.locator("article").first()).toBeVisible();

  // «Заметка о встрече» — контент 90 символов, не обрезается
  const card = notesList.locator("article", { hasText: "Заметка о встрече" });
  const contentText = await card.locator("p").textContent();

  // Проверяем, что символ многоточия отсутствует
  expect(contentText).not.toContain("…");

  // Проверяем, что контент полный
  expect(contentText).toContain("Обсудить план на следующий квартал");
});

// SC-004: Заметки отсортированы по дате обновления (новые первые)
test("SC-004: заметки отсортированы по дате обновления", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  await expect(notesList.locator("article").first()).toBeVisible();

  const titles = await notesList.locator("article h2").allTextContents();

  // Ожидаемый порядок по убыванию updatedAt
  expect(titles).toEqual([
    "Рецепт пасты",
    "Заметка о встрече",
    "Идеи для проекта",
    "Список покупок",
    "Добро пожаловать в Notes App",
  ]);
});
