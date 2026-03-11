import { test, expect } from "@playwright/test";

// SC-010: Поиск фильтрует заметки по заголовку и содержимому
test("SC-010: поиск по заголовку и содержимому", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  const searchInput = page.getByTestId("search-input");

  // Ждём загрузки 5 заметок
  await expect(notesList.locator("article")).toHaveCount(5);

  // Поиск по заголовку — «покупок»
  await searchInput.fill("покупок");
  await expect(notesList.locator("article")).toHaveCount(1, { timeout: 5000 });
  await expect(notesList.locator("article h2")).toHaveText("Список покупок");

  // Очищаем поле
  await searchInput.fill("");
  await expect(notesList.locator("article")).toHaveCount(5, { timeout: 5000 });

  // Поиск по содержимому — «пармезан»
  await searchInput.fill("пармезан");
  await expect(notesList.locator("article")).toHaveCount(1, { timeout: 5000 });
  await expect(notesList.locator("article h2")).toHaveText("Рецепт пасты");
});

// SC-011: Поиск без учёта регистра
test("SC-011: поиск case-insensitive", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  const searchInput = page.getByTestId("search-input");

  await expect(notesList.locator("article")).toHaveCount(5);

  // Верхний регистр
  await searchInput.fill("РЕЦЕПТ");
  await expect(notesList.locator("article")).toHaveCount(1, { timeout: 5000 });
  await expect(notesList.locator("article h2")).toHaveText("Рецепт пасты");

  // Нижний регистр
  await searchInput.fill("рецепт");
  await expect(notesList.locator("article")).toHaveCount(1, { timeout: 5000 });
  await expect(notesList.locator("article h2")).toHaveText("Рецепт пасты");
});

// SC-012: Заглушка «Ничего не найдено»
test("SC-012: заглушка при отсутствии результатов", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  const searchInput = page.getByTestId("search-input");

  await expect(notesList.locator("article")).toHaveCount(5);

  // Вводим несуществующий текст
  await searchInput.fill("xyzнесуществующийтекст123");
  await expect(notesList).toContainText("Ничего не найдено", { timeout: 5000 });

  // Карточки отсутствуют
  await expect(notesList.locator("article")).toHaveCount(0);
});

// SC-013: Очистка поиска возвращает все заметки
test("SC-013: кнопка очистки сбрасывает фильтр", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  const searchInput = page.getByTestId("search-input");

  await expect(notesList.locator("article")).toHaveCount(5);

  // Вводим поисковый запрос
  await searchInput.fill("рецепт");
  await expect(notesList.locator("article")).toHaveCount(1, { timeout: 5000 });

  // Нажимаем кнопку очистки
  const clearButton = page.getByLabel("Очистить поиск");
  await clearButton.click();

  // Проверяем, что поле пустое
  await expect(searchInput).toHaveValue("");

  // Все заметки снова отображаются
  await expect(notesList.locator("article")).toHaveCount(5, { timeout: 5000 });

  // Кнопка очистки исчезла
  await expect(clearButton).not.toBeVisible();
});

// SC-014: Поиск по совпадению в нескольких заметках
test("SC-014: поиск находит совпадения в нескольких заметках", async ({ page }) => {
  await page.goto("/");

  const notesList = page.getByTestId("notes-list");
  const searchInput = page.getByTestId("search-input");

  await expect(notesList.locator("article")).toHaveCount(5);

  // «заметк» — встречается в заголовках и контенте нескольких заметок
  await searchInput.fill("заметк");
  await expect(notesList.locator("article")).toHaveCount(3, { timeout: 5000 });
});
