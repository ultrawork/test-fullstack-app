import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers";

test.describe("Теги", () => {
  let email: string;
  const password = "securePassword123";

  test.beforeEach(async ({ page, request }) => {
    email = uniqueEmail("tags");

    // Register via API with retries for reliability
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await request.post("/api/v1/auth/register", {
        data: { name: "Tags User", email, password },
      });
      if (res.status() === 201) break;
      if (res.status() === 400) {
        const body = await res.json();
        if (body.error && body.error.includes("Email already in use")) break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Login via UI
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForLoadState("networkidle");
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
      .getByRole("button", { name: "Select color #10B981" })
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

    // Ждём закрытия диалога подтверждения и проверяем что тег исчез
    await expect(page.getByRole("dialog").getByRole("button", { name: "Delete tag Личное" })).not.toBeVisible();
  });

  // SC-024: Создание тега с дублирующим именем (API тест)
  test("SC-024: дублирование имени тега через API", async ({ page }) => {
    // Use page.request which shares auth cookies from beforeEach login
    // Создаём первый тег
    const first = await page.request.post("/api/v1/tags", {
      data: { name: "Работа", color: "#3B82F6" },
    });
    expect(first.status()).toBe(201);

    // Создаём второй тег с тем же именем
    const second = await page.request.post("/api/v1/tags", {
      data: { name: "Работа", color: "#EF4444" },
    });
    expect(second.status()).toBe(400);
    const body = await second.json();
    expect(body.success).toBe(false);
  });

  // SC-025: Страница управления тегами (/dashboard/tags)
  test("SC-025: страница управления тегами", async ({ page }) => {
    // Создаём теги через API (используем page.request для общих cookies)
    await page.request.post("/api/v1/tags", {
      data: { name: "Работа", color: "#3B82F6" },
    });
    await page.request.post("/api/v1/tags", {
      data: { name: "Срочно", color: "#EF4444" },
    });

    // Открываем страницу тегов
    await page.goto("/dashboard/tags");

    await expect(page.getByText("Manage Tags")).toBeVisible();
    await expect(page.getByText("Работа")).toBeVisible();
    await expect(page.getByText("Срочно")).toBeVisible();
  });
});
