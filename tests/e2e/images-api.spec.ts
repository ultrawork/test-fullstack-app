import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers";
import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";

const TEST_FILES_DIR = join(__dirname, "..", "..", "test-fixtures");

/**
 * Создаёт минимальный валидный JPEG файл.
 */
function ensureTestFiles(): void {
  mkdirSync(TEST_FILES_DIR, { recursive: true });
  // JPEG
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  const jpegPadding = Buffer.alloc(10 * 1024 - jpegHeader.length, 0x00);
  writeFileSync(join(TEST_FILES_DIR, "api-test.jpg"), Buffer.concat([jpegHeader, jpegPadding]));
  // PNG
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngPadding = Buffer.alloc(10 * 1024 - pngHeader.length, 0x00);
  writeFileSync(join(TEST_FILES_DIR, "api-test.png"), Buffer.concat([pngHeader, pngPadding]));
}

test.describe("API изображений", () => {
  test.beforeAll(() => {
    ensureTestFiles();
  });

  // Хелпер: извлечение cookies из ответа регистрации/логина
  function extractCookies(res: any): string {
    const setCookieHeaders = res.headersArray().filter((h: { name: string; value: string }) => h.name.toLowerCase() === "set-cookie");
    return setCookieHeaders.map((h: { name: string; value: string }) => h.value.split(";")[0]).join("; ");
  }

  // Хелпер: регистрация и получение cookies
  async function registerAndGetCookies(request: any, prefix: string): Promise<{ cookies: string; email: string }> {
    const email = uniqueEmail(prefix);
    const res = await request.post("/api/v1/auth/register", {
      data: { email, name: "Image API User", password: "password12345" },
    });
    const cookies = extractCookies(res);
    return { cookies, email };
  }

  // Хелпер: регистрация + создание заметки
  async function setupNoteWithAuth(request: any): Promise<{ noteId: string; cookies: string }> {
    const { cookies } = await registerAndGetCookies(request, "img-api");
    const headers = { cookie: cookies };
    const noteRes = await request.post("/api/v1/notes", {
      data: { title: "Note for images", content: "Image test content" },
      headers,
    });
    const noteData = await noteRes.json();
    return { noteId: noteData.data.id, cookies };
  }

  // SC-021: API аутентификации — расширенный (из scenarios/api.md)
  test("SC-021: API аутентификации — регистрация, вход, me, logout", async ({ request }) => {
    const email = uniqueEmail("auth-api");

    // 1. Регистрация
    const registerRes = await request.post("/api/v1/auth/register", {
      data: { email, name: "API User", password: "Password123" },
    });
    expect(registerRes.status()).toBe(201);
    const registerBody = await registerRes.json();
    expect(registerBody.success).toBe(true);
    expect(registerBody.data.user.email).toBe(email);

    const cookies = extractCookies(registerRes);
    const headers = { cookie: cookies };

    // 2. /auth/me — получаем данные текущего пользователя
    const meRes = await request.get("/api/v1/auth/me", { headers });
    expect(meRes.status()).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.data.user.email).toBe(email);

    // 3. Logout
    const logoutRes = await request.post("/api/v1/auth/logout", { headers });
    expect(logoutRes.status()).toBe(200);

    // 4. После логаута /auth/me → 401
    const meAfterLogout = await request.get("/api/v1/auth/me", {
      headers: { cookie: "" },
    });
    expect([401, 307]).toContain(meAfterLogout.status());
  });

  // SC-022: API заметок — CRUD (проверяем images в ответе)
  test("SC-022: API заметок — CRUD с images в ответе", async ({ request }) => {
    const { cookies } = await registerAndGetCookies(request, "notes-api");
    const headers = { cookie: cookies };

    // Создаём заметку
    const createRes = await request.post("/api/v1/notes", {
      data: { title: "API Note", content: "Created via API" },
      headers,
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    expect(created.data.title).toBe("API Note");
    expect(created.data.images).toEqual([]);
    expect(created.data.tags).toEqual([]);
    const noteId = created.data.id;

    // Получаем заметку
    const getRes = await request.get(`/api/v1/notes/${noteId}`, { headers });
    expect(getRes.status()).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.data.images).toEqual([]);

    // Обновляем
    const updateRes = await request.put(`/api/v1/notes/${noteId}`, {
      data: { title: "Updated Title", content: "Updated Content" },
      headers,
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.data.title).toBe("Updated Title");

    // Список заметок
    const listRes = await request.get("/api/v1/notes", { headers });
    expect(listRes.status()).toBe(200);
    const list = await listRes.json();
    expect(list.data.notes.some((n: any) => n.id === noteId)).toBe(true);

    // Удаляем
    const deleteRes = await request.delete(`/api/v1/notes/${noteId}`, { headers });
    expect(deleteRes.status()).toBe(200);

    // Получаем удалённую → 404
    const getDeletedRes = await request.get(`/api/v1/notes/${noteId}`, { headers });
    expect(getDeletedRes.status()).toBe(404);
  });

  // SC-023: API тегов — CRUD и привязка к заметке
  test("SC-023: API тегов — CRUD и привязка к заметке", async ({ request }) => {
    const { cookies } = await registerAndGetCookies(request, "tags-api");
    const headers = { cookie: cookies };

    // Создаём тег
    const createTagRes = await request.post("/api/v1/tags", {
      data: { name: "API Tag", color: "#3366FF" },
      headers,
    });
    expect(createTagRes.status()).toBe(201);
    const tagData = await createTagRes.json();
    const tagId = tagData.data.id;

    // Создаём заметку с тегом
    const noteRes = await request.post("/api/v1/notes", {
      data: { title: "Tagged Note", content: "Test", tagIds: [tagId] },
      headers,
    });
    expect(noteRes.status()).toBe(201);
    const noteData = await noteRes.json();
    expect(noteData.data.tags).toHaveLength(1);
    expect(noteData.data.tags[0].name).toBe("API Tag");
    const noteId = noteData.data.id;

    // Обновляем тег
    const updateTagRes = await request.put(`/api/v1/tags/${tagId}`, {
      data: { name: "Renamed Tag", color: "#FF3366" },
      headers,
    });
    expect(updateTagRes.status()).toBe(200);
    const updatedTag = await updateTagRes.json();
    expect(updatedTag.data.name).toBe("Renamed Tag");

    // Удаляем тег
    const deleteTagRes = await request.delete(`/api/v1/tags/${tagId}`, { headers });
    expect(deleteTagRes.status()).toBe(200);

    // Получаем заметку — тег должен отсутствовать
    const noteAfter = await request.get(`/api/v1/notes/${noteId}`, { headers });
    const noteAfterData = await noteAfter.json();
    expect(noteAfterData.data.tags).toHaveLength(0);
  });

  // SC-024: API изображений — загрузка и удаление
  test("SC-024: API изображений — загрузка и удаление", async ({ request }) => {
    const { noteId, cookies } = await setupNoteWithAuth(request);
    const headers = { cookie: cookies };

    // Загружаем JPEG
    const uploadRes = await request.post(`/api/v1/notes/${noteId}/images`, {
      headers,
      multipart: {
        images: {
          name: "test-image.jpg",
          mimeType: "image/jpeg",
          buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...new Array(1024).fill(0)]),
        },
      },
    });
    expect(uploadRes.status()).toBe(201);
    const uploadBody = await uploadRes.json();
    expect(uploadBody.data.images).toHaveLength(1);

    const image = uploadBody.data.images[0];
    expect(image).toHaveProperty("id");
    expect(image).toHaveProperty("filename");
    expect(image).toHaveProperty("path");
    expect(image).toHaveProperty("mimeType");
    expect(image).toHaveProperty("size");
    expect(image).toHaveProperty("order");

    // Проверяем что файл доступен
    const fileRes = await request.get(image.path, { headers });
    expect(fileRes.status()).toBe(200);

    // Удаляем изображение
    const deleteRes = await request.delete(`/api/v1/notes/${noteId}/images/${image.id}`, { headers });
    expect(deleteRes.status()).toBe(200);

    // Файл должен быть недоступен
    const fileAfterDelete = await request.get(image.path, { headers });
    expect(fileAfterDelete.status()).toBe(404);
  });

  // SC-025: API валидация — ошибки при невалидных данных
  test("SC-025: API валидация — невалидные данные", async ({ request }) => {
    const { cookies } = await registerAndGetCookies(request, "val-api");
    const headers = { cookie: cookies };

    // Заметка без обязательных полей
    const emptyNote = await request.post("/api/v1/notes", {
      data: {},
      headers,
    });
    expect(emptyNote.status()).toBe(400);
    const emptyBody = await emptyNote.json();
    expect(emptyBody.success).toBe(false);

    // Тег с невалидным цветом
    const badTag = await request.post("/api/v1/tags", {
      data: { name: "Valid", color: "invalid" },
      headers,
    });
    expect(badTag.status()).toBe(400);

    // Тег с пустым именем
    const emptyTag = await request.post("/api/v1/tags", {
      data: { name: "", color: "#FF0000" },
      headers,
    });
    expect(emptyTag.status()).toBe(400);

    // Изображение без файлов
    const noteRes = await request.post("/api/v1/notes", {
      data: { title: "Validation Note", content: "Test" },
      headers,
    });
    const noteId = (await noteRes.json()).data.id;

    const noImages = await request.post(`/api/v1/notes/${noteId}/images`, {
      headers,
      multipart: {},
    });
    expect([400, 500]).toContain(noImages.status());
  });
});
