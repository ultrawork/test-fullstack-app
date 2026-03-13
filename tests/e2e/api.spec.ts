import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers";

test.describe("API тесты", () => {
  // Хелпер: регистрация + получение авторизованного контекста
  async function getAuthContext(request: typeof test extends never ? never : any) {
    const email = uniqueEmail("api");
    const res = await request.post("/api/v1/auth/register", {
      data: { email, name: "API User", password: "password12345" },
    });
    const setCookieHeaders = res.headersArray().filter((h: { name: string; value: string }) => h.name.toLowerCase() === "set-cookie");
    const cookieString = setCookieHeaders.map((h: { name: string; value: string }) => h.value.split(";")[0]).join("; ");
    return { email, cookies: cookieString };
  }

  // SC-040: CRUD заметок через API
  test("SC-040: CRUD заметок через API", async ({ request }) => {
    const { cookies } = await getAuthContext(request);
    const headers = { cookie: cookies };

    // 1. Создать заметку
    const createRes = await request.post("/api/v1/notes", {
      data: { title: "API Note", content: "Created via API" },
      headers,
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    expect(created.data.title).toBe("API Note");
    const noteId = created.data.id;

    // 3. Получить заметку
    const getRes = await request.get(`/api/v1/notes/${noteId}`, { headers });
    expect(getRes.status()).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.data.title).toBe("API Note");
    expect(fetched.data.content).toBe("Created via API");

    // 4. Обновить заметку
    const updateRes = await request.put(`/api/v1/notes/${noteId}`, {
      data: { title: "Updated API Note" },
      headers,
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.data.title).toBe("Updated API Note");

    // 5. Удалить заметку
    const deleteRes = await request.delete(`/api/v1/notes/${noteId}`, { headers });
    expect(deleteRes.status()).toBe(200);

    // 6. Попытка получить удалённую заметку
    const getDeletedRes = await request.get(`/api/v1/notes/${noteId}`, { headers });
    expect(getDeletedRes.status()).toBe(404);
  });

  // SC-041: CRUD тегов через API
  test("SC-041: CRUD тегов через API", async ({ request }) => {
    const { cookies } = await getAuthContext(request);
    const headers = { cookie: cookies };

    // 1. Создать тег
    const createRes = await request.post("/api/v1/tags", {
      data: { name: "API Tag", color: "#FF5733" },
      headers,
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    expect(created.data.name).toBe("API Tag");
    expect(created.data.color).toBe("#FF5733");
    const tagId = created.data.id;

    // 3. Получить все теги — проверить наличие
    const listRes = await request.get("/api/v1/tags", { headers });
    expect(listRes.status()).toBe(200);
    const list = await listRes.json();
    expect(list.data.tags.some((t: any) => t.name === "API Tag")).toBe(true);

    // 4. Обновить тег
    const updateRes = await request.put(`/api/v1/tags/${tagId}`, {
      data: { name: "Updated Tag", color: "#33FF57" },
      headers,
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.data.name).toBe("Updated Tag");
    expect(updated.data.color).toBe("#33FF57");

    // 5. Удалить тег
    const deleteRes = await request.delete(`/api/v1/tags/${tagId}`, { headers });
    expect(deleteRes.status()).toBe(200);

    // 6. Проверить отсутствие тега
    const listAfter = await request.get("/api/v1/tags", { headers });
    const afterBody = await listAfter.json();
    expect(afterBody.data.tags.some((t: any) => t.name === "Updated Tag")).toBe(
      false,
    );
  });

  // SC-042: Привязка тегов к заметке
  test("SC-042: привязка тегов к заметке через API", async ({ request }) => {
    const { cookies } = await getAuthContext(request);
    const headers = { cookie: cookies };

    // Создаём теги
    const tagARes = await request.post("/api/v1/tags", {
      data: { name: "Tag A", color: "#FF0000" },
      headers,
    });
    const tagA = await tagARes.json();
    const tagAId = tagA.data.id;

    const tagBRes = await request.post("/api/v1/tags", {
      data: { name: "Tag B", color: "#00FF00" },
      headers,
    });
    const tagB = await tagBRes.json();
    const tagBId = tagB.data.id;

    // Создаём заметку с тегами
    const noteRes = await request.post("/api/v1/notes", {
      data: {
        title: "Tagged Note",
        content: "Content",
        tagIds: [tagAId, tagBId],
      },
      headers,
    });
    expect(noteRes.status()).toBe(201);
    const note = await noteRes.json();
    const noteId = note.data.id;
    expect(note.data.tags).toHaveLength(2);

    // Получаем заметку — должны быть оба тега
    const getRes = await request.get(`/api/v1/notes/${noteId}`, { headers });
    const fetched = await getRes.json();
    const tagNames = fetched.data.tags.map((t: any) => t.name);
    expect(tagNames).toContain("Tag A");
    expect(tagNames).toContain("Tag B");

    // Обновляем теги — оставляем только Tag A
    const updateTagsRes = await request.put(
      `/api/v1/notes/${noteId}/tags`,
      {
        data: { tagIds: [tagAId] },
        headers,
      },
    );
    expect(updateTagsRes.status()).toBe(200);

    // Проверяем — только 1 тег
    const getAfter = await request.get(`/api/v1/notes/${noteId}`, { headers });
    const afterData = await getAfter.json();
    expect(afterData.data.tags).toHaveLength(1);
    expect(afterData.data.tags[0].name).toBe("Tag A");
  });

  // SC-043: Фильтрация заметок по тегам
  test("SC-043: фильтрация заметок по тегам через API", async ({
    request,
  }) => {
    const { cookies } = await getAuthContext(request);
    const headers = { cookie: cookies };

    // Создаём тег
    const tagRes = await request.post("/api/v1/tags", {
      data: { name: "FilterTag", color: "#FF0000" },
      headers,
    });
    const tag = await tagRes.json();
    const tagId = tag.data.id;

    // Создаём заметку с тегом
    await request.post("/api/v1/notes", {
      data: {
        title: "Note With Tag",
        content: "Has tag",
        tagIds: [tagId],
      },
      headers,
    });

    // Создаём заметку без тега
    await request.post("/api/v1/notes", {
      data: { title: "Note Without Tag", content: "No tag" },
      headers,
    });

    // Фильтруем по тегу
    const filterRes = await request.get(
      `/api/v1/notes?tagIds=${tagId}`,
      { headers },
    );
    expect(filterRes.status()).toBe(200);
    const filtered = await filterRes.json();
    const titles = filtered.data.notes.map((n: any) => n.title);
    expect(titles).toContain("Note With Tag");
    expect(titles).not.toContain("Note Without Tag");
  });

  // SC-044: Поиск заметок через API
  test("SC-044: поиск заметок через API", async ({ request }) => {
    await getAuthContext(request);

    await request.post("/api/v1/notes", {
      data: { title: "Meeting Notes", content: "Discussion" },
    });
    await request.post("/api/v1/notes", {
      data: { title: "Shopping List", content: "Items" },
    });

    const searchRes = await request.get("/api/v1/notes?search=Meeting");
    expect(searchRes.status()).toBe(200);
    const result = await searchRes.json();
    const titles = result.data.notes.map((n: any) => n.title);
    expect(titles).toContain("Meeting Notes");
    expect(titles).not.toContain("Shopping List");
  });

  // SC-045: Защита API от неавторизованного доступа
  test("SC-045: неавторизованный доступ к API", async ({ request }) => {
    // Создаём новый контекст без cookies
    const res1 = await request.get("/api/v1/notes", {
      headers: { cookie: "" },
    });
    // Middleware может возвращать redirect (307) или 401
    expect([401, 307]).toContain(res1.status());

    const res2 = await request.get("/api/v1/tags", {
      headers: { cookie: "" },
    });
    expect([401, 307]).toContain(res2.status());

    const res3 = await request.post("/api/v1/notes", {
      data: { title: "Test", content: "Test" },
      headers: { cookie: "" },
    });
    expect([401, 307]).toContain(res3.status());
  });

  // SC-046: Валидация данных тега через API
  test("SC-046: валидация данных тега через API", async ({ request }) => {
    await getAuthContext(request);

    // Пустое имя
    const emptyName = await request.post("/api/v1/tags", {
      data: { name: "", color: "#FF0000" },
    });
    expect(emptyName.status()).toBe(400);

    // Имя > 50 символов
    const longName = await request.post("/api/v1/tags", {
      data: { name: "a".repeat(51), color: "#FF0000" },
    });
    expect(longName.status()).toBe(400);

    // Невалидный цвет
    const badColor = await request.post("/api/v1/tags", {
      data: { name: "Valid Name", color: "not-a-color" },
    });
    expect(badColor.status()).toBe(400);
  });
});
