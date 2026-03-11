import { test, expect } from "@playwright/test";

// Очищаем серверное хранилище и localStorage перед каждым тестом
test.beforeEach(async ({ page, request }) => {
  await request.delete("/api/v1/favorites");
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

// SC-201: Пустое состояние страницы избранного
test("SC-201: страница избранного показывает пустое состояние", async ({
  page,
}) => {
  await page.goto("/favorites");

  // Заголовок «Избранное»
  await expect(page.getByTestId("favorites-title")).toHaveText("Избранное");

  // Пустое состояние
  const emptySection = page.getByTestId("empty-favorites");
  await expect(emptySection).toBeVisible();
  await expect(page.getByText("Список избранного пуст")).toBeVisible();
  await expect(
    page.getByText(
      "Добавьте записи в избранное, чтобы они появились здесь",
    ),
  ).toBeVisible();

  // Кнопка «Очистить всё» НЕ отображается
  await expect(page.getByTestId("clear-all-button")).not.toBeVisible();
});

// SC-202: Добавление записи в избранное через демо-кнопку
test("SC-202: добавление записи через демо-кнопку сердца", async ({
  page,
}) => {
  await page.goto("/");

  const heartButton = page.getByTestId("favorite-button-demo-1");

  // Кнопка не активна
  await expect(heartButton).toHaveAttribute("aria-pressed", "false");

  // Нажимаем — добавляем в избранное
  await heartButton.click();

  // Ждём обновления состояния
  await expect(heartButton).toHaveAttribute("aria-pressed", "true");

  // Переходим на страницу избранного
  await page.goto("/favorites");

  // Проверяем что запись «Демо запись» появилась
  await expect(page.getByText("Демо запись")).toBeVisible();
});

// SC-203: Удаление записи из избранного через кнопку на карточке
test("SC-203: удаление записи через кнопку X на карточке", async ({
  page,
}) => {
  await page.goto("/");

  // Добавляем запись через демо-кнопку
  const heartButton = page.getByTestId("favorite-button-demo-1");
  await heartButton.click();
  await expect(heartButton).toHaveAttribute("aria-pressed", "true");

  // Переходим на страницу избранного
  await page.goto("/favorites");

  // Проверяем что карточка отображается
  await expect(page.getByTestId("favorite-card-demo-1")).toBeVisible();

  // Нажимаем кнопку удаления на карточке
  await page.getByTestId("remove-favorite-demo-1").click();

  // Ожидаем пустое состояние
  await expect(page.getByTestId("empty-favorites")).toBeVisible();
  await expect(page.getByText("Список избранного пуст")).toBeVisible();
});

// SC-204: Снятие отметки избранного через повторное нажатие на кнопку сердца
test("SC-204: повторное нажатие на сердце снимает отметку избранного", async ({
  page,
}) => {
  await page.goto("/");

  const heartButton = page.getByTestId("favorite-button-demo-1");

  // Добавляем
  await heartButton.click();
  await expect(heartButton).toHaveAttribute("aria-pressed", "true");

  // Удаляем повторным нажатием
  await heartButton.click();
  await expect(heartButton).toHaveAttribute("aria-pressed", "false");

  // Проверяем что страница избранного пуста
  await page.goto("/favorites");
  await expect(page.getByTestId("empty-favorites")).toBeVisible();
});

// SC-205: Кнопка «Очистить всё» на странице избранного
test("SC-205: кнопка «Очистить всё» удаляет все записи", async ({ page }) => {
  await page.goto("/");

  // Добавляем запись
  const heartButton = page.getByTestId("favorite-button-demo-1");
  await heartButton.click();
  await expect(heartButton).toHaveAttribute("aria-pressed", "true");

  // Переходим на страницу избранного
  await page.goto("/favorites");

  // Проверяем кнопку «Очистить всё»
  const clearButton = page.getByTestId("clear-all-button");
  await expect(clearButton).toBeVisible();
  await expect(clearButton).toHaveText("Очистить всё");

  // Нажимаем «Очистить всё»
  await clearButton.click();

  // Ожидаем пустое состояние
  await expect(page.getByTestId("empty-favorites")).toBeVisible();

  // Кнопка «Очистить всё» исчезла
  await expect(page.getByTestId("clear-all-button")).not.toBeVisible();
});

// SC-206: Отображение даты создания на карточке избранного
test("SC-206: карточка избранного отображает дату в русском формате", async ({
  page,
}) => {
  await page.goto("/");

  // Добавляем запись
  const heartButton = page.getByTestId("favorite-button-demo-1");
  await heartButton.click();
  await expect(heartButton).toHaveAttribute("aria-pressed", "true");

  // Переходим на страницу избранного
  await page.goto("/favorites");

  // Проверяем карточку
  const card = page.getByTestId("favorite-card-demo-1");
  await expect(card).toBeVisible();
  await expect(card.getByText("Демо запись")).toBeVisible();

  // Проверяем наличие элемента <time> с датой в формате DD.MM.YYYY
  const timeElement = card.locator("time");
  await expect(timeElement).toBeVisible();
  const dateText = await timeElement.textContent();
  // Русский формат даты: ДД.ММ.ГГГГ
  expect(dateText).toMatch(/\d{2}\.\d{2}\.\d{4}/);
});

// SC-207: Сохранение избранного между перезагрузками страницы (localStorage)
test("SC-207: избранное сохраняется после перезагрузки страницы", async ({
  page,
}) => {
  await page.goto("/");

  // Добавляем запись
  const heartButton = page.getByTestId("favorite-button-demo-1");
  await heartButton.click();
  await expect(heartButton).toHaveAttribute("aria-pressed", "true");

  // Переходим на избранное
  await page.goto("/favorites");
  await expect(page.getByText("Демо запись")).toBeVisible();

  // Перезагружаем страницу
  await page.reload();

  // Запись всё ещё отображается
  await expect(page.getByText("Демо запись")).toBeVisible();
});
