import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

// SC-401: Пустое состояние страницы архива
test("SC-401: страница архива показывает пустое состояние", async ({
  page,
}) => {
  await page.goto("/archive");

  await expect(page.getByTestId("archive-title")).toHaveText("Архив");

  const emptySection = page.getByTestId("empty-archive");
  await expect(emptySection).toBeVisible();
  await expect(page.getByText("Архив пуст")).toBeVisible();
  await expect(
    page.getByText("Архивируйте записи, чтобы они появились здесь"),
  ).toBeVisible();
});

// SC-402: Архивация записи через демо-кнопку
test("SC-402: архивация записи через демо-кнопку", async ({ page }) => {
  await page.goto("/");

  const archiveButton = page.getByTestId("archive-button-demo-1");

  await expect(archiveButton).toHaveAttribute("aria-pressed", "false");

  await archiveButton.click();

  await expect(archiveButton).toHaveAttribute("aria-pressed", "true");

  await page.goto("/archive");

  await expect(page.getByText("Демо запись")).toBeVisible();
});

// SC-403: Восстановление записи из архива через кнопку на карточке
test("SC-403: восстановление записи через кнопку на карточке", async ({
  page,
}) => {
  await page.goto("/");

  const archiveButton = page.getByTestId("archive-button-demo-1");
  await archiveButton.click();
  await expect(archiveButton).toHaveAttribute("aria-pressed", "true");

  await page.goto("/archive");

  await expect(page.getByTestId("archive-card-demo-1")).toBeVisible();

  await page.getByTestId("restore-note-demo-1").click();

  await expect(page.getByTestId("empty-archive")).toBeVisible();
  await expect(page.getByText("Архив пуст")).toBeVisible();
});

// SC-404: Навигация между главной и архивом
test("SC-404: навигация между главной и архивом", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("nav-archive").click();
  await expect(page.getByTestId("archive-title")).toBeVisible();

  await page.getByTestId("nav-home").click();
  await expect(page.getByTestId("home-title")).toBeVisible();
});

// SC-405: Ссылка на архив с главной страницы
test("SC-405: ссылка на архив с главной страницы", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("home-archive-link").click();
  await expect(page.getByTestId("archive-title")).toBeVisible();
});

// SC-406: Сохранение архива между перезагрузками страницы (localStorage)
test("SC-406: архив сохраняется после перезагрузки страницы", async ({
  page,
}) => {
  await page.goto("/");

  const archiveButton = page.getByTestId("archive-button-demo-1");
  await archiveButton.click();
  await expect(archiveButton).toHaveAttribute("aria-pressed", "true");

  await page.goto("/archive");
  await expect(page.getByText("Демо запись")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Демо запись")).toBeVisible();
});
