import { test, expect } from "@playwright/test";

const getApiUrl = (baseURL: string | undefined): string =>
  process.env.API_URL || baseURL || "http://localhost:4000";

// SC-301: Получение пустого списка архивных записей (GET)
test("SC-301: GET /api/v1/notes/archived возвращает пустой список", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  const response = await request.get(`${apiUrl}/api/v1/notes/archived`);

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toEqual({ success: true, data: [] });
});

// SC-302: Архивация записи (POST)
test("SC-302: POST /api/v1/notes/:id/archive архивирует запись", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  const postResponse = await request.post(
    `${apiUrl}/api/v1/notes/note-1/archive`,
    {
      data: { title: "Тестовая запись", content: "Содержимое записи" },
    },
  );

  expect(postResponse.status()).toBe(201);
  const postBody = await postResponse.json();
  expect(postBody.success).toBe(true);
  expect(postBody.data.id).toBe("note-1");
  expect(postBody.data.title).toBe("Тестовая запись");
  expect(postBody.data.content).toBe("Содержимое записи");
  expect(postBody.data.archivedAt).toBeTruthy();

  const getResponse = await request.get(`${apiUrl}/api/v1/notes/archived`);
  expect(getResponse.status()).toBe(200);
  const getBody = await getResponse.json();
  expect(getBody.data).toHaveLength(1);
  expect(getBody.data[0].id).toBe("note-1");
});

// SC-303: Архивация дубликата (POST, 409)
test("SC-303: POST дубликата возвращает 409", async ({ request, baseURL }) => {
  const apiUrl = getApiUrl(baseURL);

  const firstResponse = await request.post(
    `${apiUrl}/api/v1/notes/dup-1/archive`,
    {
      data: { title: "Запись", content: "Содержимое" },
    },
  );
  expect(firstResponse.status()).toBe(201);

  const secondResponse = await request.post(
    `${apiUrl}/api/v1/notes/dup-1/archive`,
    {
      data: { title: "Запись", content: "Содержимое" },
    },
  );

  expect(secondResponse.status()).toBe(409);
  const body = await secondResponse.json();
  expect(body).toEqual({
    success: false,
    error: "Note is already archived",
  });
});

// SC-304: Восстановление записи из архива (POST restore)
test("SC-304: POST /api/v1/notes/:id/restore восстанавливает запись", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  await request.post(`${apiUrl}/api/v1/notes/restore-1/archive`, {
    data: { title: "Восстановляемая", content: "Содержимое" },
  });

  const restoreResponse = await request.post(
    `${apiUrl}/api/v1/notes/restore-1/restore`,
  );
  expect(restoreResponse.status()).toBe(200);
  const restoreBody = await restoreResponse.json();
  expect(restoreBody.success).toBe(true);
  expect(restoreBody.data.id).toBe("restore-1");

  const getResponse = await request.get(`${apiUrl}/api/v1/notes/archived`);
  const getBody = await getResponse.json();
  const found = getBody.data.find(
    (item: { id: string }) => item.id === "restore-1",
  );
  expect(found).toBeUndefined();
});

// SC-305: Восстановление несуществующей записи (POST, 404)
test("SC-305: POST restore несуществующей записи возвращает 404", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  const response = await request.post(
    `${apiUrl}/api/v1/notes/nonexistent-id/restore`,
  );

  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body).toEqual({
    success: false,
    error: "Note not found in archive",
  });
});

// SC-306: Валидация входных данных при архивации (POST, 400)
test("SC-306: POST с невалидными данными возвращает 400", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  const invalidJsonResponse = await request.post(
    `${apiUrl}/api/v1/notes/val-1/archive`,
    {
      data: "not json",
      headers: { "Content-Type": "text/plain" },
    },
  );
  expect(invalidJsonResponse.status()).toBe(400);
  const invalidJsonBody = await invalidJsonResponse.json();
  expect(invalidJsonBody).toEqual({
    success: false,
    error: "Invalid JSON body",
  });

  const noTitleResponse = await request.post(
    `${apiUrl}/api/v1/notes/val-2/archive`,
    {
      data: { content: "Без заголовка" },
    },
  );
  expect(noTitleResponse.status()).toBe(400);
  const noTitleBody = await noTitleResponse.json();
  expect(noTitleBody).toEqual({
    success: false,
    error: "Field 'title' is required and must be a string",
  });

  const noContentResponse = await request.post(
    `${apiUrl}/api/v1/notes/val-3/archive`,
    {
      data: { title: "Без содержимого" },
    },
  );
  expect(noContentResponse.status()).toBe(400);
  const noContentBody = await noContentResponse.json();
  expect(noContentBody).toEqual({
    success: false,
    error: "Field 'content' is required and must be a string",
  });
});
