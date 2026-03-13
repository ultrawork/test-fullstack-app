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

    // Wait for auth hydration to complete — Header renders only after AuthGuard resolves
    await page
      .getByRole("button", { name: "Manage tags" })
      .waitFor({ state: "visible", timeout: 15000 });
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
    // Wait for auth hydration and dashboard to be fully ready
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Manage tags" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10000 });

    await modal.getByRole("button", { name: "Create New Tag" }).click();

    // Wait for form to be fully rendered
    const nameInput = modal.getByLabel("Tag name");
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Пытаемся создать без имени — поле required, очищаем и отправляем
    await nameInput.fill("");

    const submitButton = modal.getByRole("button", { name: "Create Tag" });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Должны остаться на форме (кнопка Create Tag всё ещё видна)
    await expect(submitButton).toBeVisible();
  });

  // SC-022: Редактирование тега
  test("SC-022: редактирование тега", async ({ page }) => {
    // Wait for auth hydration and dashboard to be fully ready
    await page.waitForLoadState("networkidle");

    // Сначала создаём тег
    await page.getByRole("button", { name: "Manage tags" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10000 });

    await modal.getByRole("button", { name: "Create New Tag" }).click();

    // Wait for form to be fully rendered
    const nameInput = modal.getByLabel("Tag name");
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill("Работа");
    await modal.getByRole("button", { name: "Create Tag" }).click();

    // Wait for tag to appear in list after creation
    await expect(modal.getByText("Работа")).toBeVisible({ timeout: 10000 });

    // Нажимаем Edit рядом с тегом
    const editButton = modal.getByRole("button", { name: "Edit tag Работа" });
    await expect(editButton).toBeVisible({ timeout: 5000 });
    await editButton.click();

    // Wait for edit form to be fully rendered
    const editNameInput = modal.getByLabel("Tag name");
    await expect(editNameInput).toBeVisible({ timeout: 5000 });

    // Редактируем
    await editNameInput.fill("Личное");
    await modal
      .getByRole("button", { name: "Select color #10B981" })
      .first()
      .click();
    await modal.getByRole("button", { name: "Update Tag" }).click();

    // Проверяем обновлённый тег
    await expect(modal.getByText("Личное")).toBeVisible({ timeout: 10000 });
  });

  // SC-023: Удаление тега
  test("SC-023: удаление тега", async ({ page }) => {
    // Wait for auth hydration and dashboard to be fully ready
    await page.waitForLoadState("networkidle");

    // Создаём тег
    await page.getByRole("button", { name: "Manage tags" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10000 });

    await modal.getByRole("button", { name: "Create New Tag" }).click();

    // Wait for form to be fully rendered
    const nameInput = modal.getByLabel("Tag name");
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill("Личное");
    await modal.getByRole("button", { name: "Create Tag" }).click();

    // Wait for tag to appear in list after creation
    await expect(modal.getByText("Личное")).toBeVisible({ timeout: 10000 });

    // Удаляем
    const deleteButton = modal.getByRole("button", { name: "Delete tag Личное" });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    await deleteButton.click();

    // Подтверждаем удаление в диалоге подтверждения
    const confirmDeleteButton = page.getByRole("button", { name: "Delete" }).last();
    await expect(confirmDeleteButton).toBeVisible({ timeout: 5000 });
    await confirmDeleteButton.click();

    // Ждём закрытия диалога подтверждения и проверяем что тег исчез
    await expect(modal.getByText("Личное")).not.toBeVisible({ timeout: 10000 });
  });

  // SC-024: Создание тега с дублирующим именем (API тест)
  test("SC-024: дублирование имени тега через API", async ({ page }) => {
    // Use page.evaluate with fetch() to ensure httpOnly cookies are sent by the browser
    // Создаём первый тег
    const firstStatus = await page.evaluate(async () => {
      const res = await fetch("/api/v1/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Работа", color: "#3B82F6" }),
      });
      return res.status;
    });
    expect(firstStatus).toBe(201);

    // Создаём второй тег с тем же именем
    const secondResult = await page.evaluate(async () => {
      const res = await fetch("/api/v1/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Работа", color: "#EF4444" }),
      });
      return { status: res.status, body: await res.json() };
    });
    expect(secondResult.status).toBe(400);
    expect(secondResult.body.success).toBe(false);
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
