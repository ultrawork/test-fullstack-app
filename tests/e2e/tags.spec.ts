import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers";

test.describe("Теги", () => {
  let email: string;
  const password = "securePassword123";

  test.beforeEach(async ({ page }) => {
    email = uniqueEmail("tags");
    await registerAndLogin(page, {
      name: "Tags User",
      email,
      password,
    });
  });

  // SC-020: Создание нового тега
  test("SC-020: создание нового тега через модальное окно", async ({
    page,
  }) => {
    // Открываем модальное окно тегов
    await page.getByRole("button", { name: "Manage tags" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Нажимаем Create New Tag
    await modal.getByRole("button", { name: "Create New Tag" }).click();

    // Заполняем форму
    await modal.getByLabel("Tag name").fill("Работа");

    // Выбираем синий цвет из предустановленных
    await modal
      .getByRole("button", { name: "Select color #3B82F6" })
      .click();

    // Создаём
    await modal.getByRole("button", { name: "Create Tag" }).click();

    // Тег должен появиться в списке
    await expect(modal.getByText("Работа")).toBeVisible();
    await expect(modal.getByText("0 notes")).toBeVisible();
  });

  // SC-021: Создание тега с невалидными данными
  test("SC-021: создание тега без имени", async ({ page }) => {
    await page.getByRole("button", { name: "Manage tags" }).click();
    const modal = page.getByRole("dialog");

    await modal.getByRole("button", { name: "Create New Tag" }).click();

    // Пытаемся создать без имени — поле required, очищаем и отправляем
    await modal.getByLabel("Tag name").fill("");
    await modal.getByRole("button", { name: "Create Tag" }).click();

    // Должны остаться на форме (кнопка Create Tag всё ещё видна)
    await expect(
      modal.getByRole("button", { name: "Create Tag" }),
    ).toBeVisible();
  });

  // SC-022: Редактирование тега
  test("SC-022: редактирование тега", async ({ page }) => {
    // Сначала создаём тег
    await page.getByRole("button", { name: "Manage tags" }).click();
    const modal = page.getByRole("dialog");

    await modal.getByRole("button", { name: "Create New Tag" }).click();
    await modal.getByLabel("Tag name").fill("Работа");
    await modal.getByRole("button", { name: "Create Tag" }).click();
    await expect(modal.getByText("Работа")).toBeVisible();

    // Нажимаем Edit рядом с тегом
    await modal
      .getByRole("button", { name: "Edit tag Работа" })
      .click();

    // Редактируем
    await modal.getByLabel("Tag name").fill("Личное");
    await modal
      .getByRole("button", { name: "Select color #22C55E" })
      .first()
      .click();
    await modal.getByRole("button", { name: "Update Tag" }).click();

    // Проверяем обновлённый тег
    await expect(modal.getByText("Личное")).toBeVisible();
  });

  // SC-023: Удаление тега
  test("SC-023: удаление тега", async ({ page }) => {
    // Создаём тег
    await page.getByRole("button", { name: "Manage tags" }).click();
    const modal = page.getByRole("dialog");

    await modal.getByRole("button", { name: "Create New Tag" }).click();
    await modal.getByLabel("Tag name").fill("Личное");
    await modal.getByRole("button", { name: "Create Tag" }).click();
    await expect(modal.getByText("Личное")).toBeVisible();

    // Удаляем
    await modal
      .getByRole("button", { name: "Delete tag Личное" })
      .click();

    // Подтверждаем удаление в диалоге подтверждения
    const deleteDialog = page.getByRole("dialog").last();
    await deleteDialog.getByRole("button", { name: "Delete" }).click();

    // Тег должен исчезнуть
    await expect(modal.getByText("Личное")).not.toBeVisible();
  });

  // SC-024: Создание тега с дублирующим именем (API тест)
  test("SC-024: дублирование имени тега через API", async ({ request }) => {
    const testEmail = uniqueEmail("sc024");

    // Регистрируемся через API
    await request.post("/api/v1/auth/register", {
      data: {
        email: testEmail,
        name: "Tag Dup User",
        password: "password12345",
      },
    });

    // Создаём первый тег
    const first = await request.post("/api/v1/tags", {
      data: { name: "Работа", color: "#3B82F6" },
    });
    expect(first.status()).toBe(201);

    // Создаём второй тег с тем же именем
    const second = await request.post("/api/v1/tags", {
      data: { name: "Работа", color: "#EF4444" },
    });
    expect(second.status()).toBe(400);
    const body = await second.json();
    expect(body.success).toBe(false);
  });

  // SC-025: Страница управления тегами (/dashboard/tags)
  test("SC-025: страница управления тегами", async ({ page, request }) => {
    // Создаём теги через API
    await request.post("/api/v1/tags", {
      data: { name: "Работа", color: "#3B82F6" },
    });
    await request.post("/api/v1/tags", {
      data: { name: "Срочно", color: "#EF4444" },
    });

    // Открываем страницу тегов
    await page.goto("/dashboard/tags");

    await expect(page.getByText("Manage Tags")).toBeVisible();
    await expect(page.getByText("Работа")).toBeVisible();
    await expect(page.getByText("Срочно")).toBeVisible();
  });
});
