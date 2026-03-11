import { test, expect } from "@playwright/test";

// SC-001: Отображение навигационной панели
test("SC-001: навигационная панель отображается с двумя ссылками", async ({
  page,
}) => {
  await page.goto("/");

  // Проверяем наличие навигационной панели
  const nav = page.locator('nav[aria-label="Главная навигация"]');
  await expect(nav).toBeVisible();

  // Проверяем ссылку «Главная»
  const homeLink = page.getByTestId("nav-home");
  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveText("Главная");
  await expect(homeLink).toHaveAttribute("href", "/");

  // Проверяем ссылку «Архив»
  const archiveLink = page.getByTestId("nav-archive");
  await expect(archiveLink).toBeVisible();
  await expect(archiveLink).toHaveText("Архив");
  await expect(archiveLink).toHaveAttribute("href", "/archive");
});

// SC-002: Навигация между страницами
test("SC-002: навигация между главной и архивом работает", async ({ page }) => {
  await page.goto("/");

  // Переход на архив
  await page.getByTestId("nav-archive").click();
  await expect(page).toHaveURL(/\/archive/);
  await expect(page.getByTestId("archive-title")).toHaveText("Архив");

  // Возврат на главную
  await page.getByTestId("nav-home").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("home-title")).toHaveText("Notes App");
});

// SC-003: Главная страница — структура и элементы
test("SC-003: главная страница содержит все основные элементы", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("archive-storage"));
  await page.goto("/");

  // Заголовок
  await expect(page.getByTestId("home-title")).toHaveText("Notes App");

  // Ссылка на архив
  const archiveLink = page.getByTestId("home-archive-link");
  await expect(archiveLink).toBeVisible();
  await expect(archiveLink).toHaveText("Перейти в Архив");

  // Демо-секция с кнопкой архивации
  await expect(page.getByTestId("demo-section")).toBeVisible();
  await expect(page.getByTestId("archive-button-demo-1")).toBeVisible();
});

// SC-004: Ссылка «Перейти в Архив» на главной странице
test("SC-004: ссылка «Перейти в Архив» ведёт на /archive", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByTestId("home-archive-link").click();
  await expect(page).toHaveURL(/\/archive/);
});
