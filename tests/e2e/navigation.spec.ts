import { test, expect } from "@playwright/test";

// SC-001: Отображение главной страницы
test("SC-001: главная страница отображает заголовок, ссылку и демо-кнопку", async ({
  page,
}) => {
  await page.goto("/");

  // Проверяем заголовок «Notes App»
  await expect(page.getByTestId("home-title")).toHaveText("Notes App");

  // Проверяем ссылку «Перейти в Избранное»
  const favoritesLink = page.getByTestId("home-favorites-link");
  await expect(favoritesLink).toBeVisible();
  await expect(favoritesLink).toHaveText("Перейти в Избранное");

  // Проверяем демо-секцию с текстом «Демо:» и кнопкой сердца
  const demoSection = page.getByTestId("demo-section");
  await expect(demoSection).toBeVisible();
  await expect(demoSection.getByText("Демо:")).toBeVisible();

  // Проверяем что кнопка сердца не активна
  const heartButton = page.getByTestId("favorite-button-demo-1");
  await expect(heartButton).toBeVisible();
  await expect(heartButton).toHaveAttribute("aria-pressed", "false");
});

// SC-002: Навигационная панель — переходы между страницами
test("SC-002: навигация между главной и избранным через навигационную панель", async ({
  page,
}) => {
  await page.goto("/");

  // Проверяем навигационную панель
  const navHome = page.getByTestId("nav-home");
  const navFavorites = page.getByTestId("nav-favorites");
  await expect(navHome).toBeVisible();
  await expect(navFavorites).toBeVisible();
  await expect(navHome).toHaveText("Главная");
  await expect(navFavorites).toHaveText("Избранное");

  // Переходим на страницу избранного
  await navFavorites.click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByTestId("favorites-title")).toHaveText("Избранное");

  // Возвращаемся на главную
  await page.getByTestId("nav-home").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("home-title")).toHaveText("Notes App");
});

// SC-003: Переход в избранное через ссылку на главной странице
test("SC-003: переход в избранное через ссылку в теле главной страницы", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByTestId("home-favorites-link").click();
  await expect(page).toHaveURL(/\/favorites$/);
});
