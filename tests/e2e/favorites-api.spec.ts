import { test, expect } from "@playwright/test";

// Базовый URL для прямых API-запросов (минуя Next.js прокси)
const getApiUrl = (baseURL: string | undefined) =>
  process.env.API_URL || baseURL || "http://localhost:4000";

// SC-101: Получение пустого списка избранного (GET)
test("SC-101: GET /api/v1/favorites возвращает пустой список", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  const response = await request.get(`${apiUrl}/api/v1/favorites`);

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toEqual({ success: true, data: [] });
});

// SC-102: Добавление записи в избранное (POST)
test("SC-102: POST /api/v1/favorites добавляет запись", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  // Добавляем запись
  const postResponse = await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { id: "note-1", title: "Тестовая запись" },
  });

  expect(postResponse.status()).toBe(201);
  const postBody = await postResponse.json();
  expect(postBody.success).toBe(true);
  expect(postBody.data.id).toBe("note-1");
  expect(postBody.data.title).toBe("Тестовая запись");
  expect(postBody.data.createdAt).toBeTruthy();

  // Проверяем через GET
  const getResponse = await request.get(`${apiUrl}/api/v1/favorites`);
  expect(getResponse.status()).toBe(200);
  const getBody = await getResponse.json();
  expect(getBody.data).toHaveLength(1);
  expect(getBody.data[0].id).toBe("note-1");
});

// SC-103: Добавление дубликата в избранное (POST, 409)
test("SC-103: POST дубликата возвращает 409", async ({ request, baseURL }) => {
  const apiUrl = getApiUrl(baseURL);

  // Добавляем запись
  const firstResponse = await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { id: "dup-1", title: "Запись" },
  });
  expect(firstResponse.status()).toBe(201);

  // Повторная попытка с тем же id
  const secondResponse = await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { id: "dup-1", title: "Запись" },
  });

  expect(secondResponse.status()).toBe(409);
  const body = await secondResponse.json();
  expect(body).toEqual({
    success: false,
    error: "Item already in favorites",
  });
});

// SC-104: Валидация входных данных при добавлении (POST, 400)
test("SC-104: POST с невалидными данными возвращает 400", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  // Невалидный JSON
  const invalidJsonResponse = await request.post(
    `${apiUrl}/api/v1/favorites`,
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

  // Без поля id
  const noIdResponse = await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { title: "Без id" },
  });
  expect(noIdResponse.status()).toBe(400);
  const noIdBody = await noIdResponse.json();
  expect(noIdBody).toEqual({
    success: false,
    error: "Field 'id' is required and must be a string",
  });

  // Без поля title
  const noTitleResponse = await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { id: "test-1" },
  });
  expect(noTitleResponse.status()).toBe(400);
  const noTitleBody = await noTitleResponse.json();
  expect(noTitleBody).toEqual({
    success: false,
    error: "Field 'title' is required and must be a string",
  });
});

// SC-105: Удаление конкретной записи из избранного (DELETE по ID)
test("SC-105: DELETE /api/v1/favorites/:id удаляет запись", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  // Добавляем запись
  await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { id: "del-1", title: "Удаляемая" },
  });

  // Удаляем
  const deleteResponse = await request.delete(
    `${apiUrl}/api/v1/favorites/del-1`,
  );
  expect(deleteResponse.status()).toBe(200);
  const deleteBody = await deleteResponse.json();
  expect(deleteBody.success).toBe(true);
  expect(deleteBody.data.id).toBe("del-1");

  // Проверяем что список пуст
  const getResponse = await request.get(`${apiUrl}/api/v1/favorites`);
  const getBody = await getResponse.json();
  expect(getBody.data).toHaveLength(0);
});

// SC-106: Удаление несуществующей записи (DELETE, 404)
test("SC-106: DELETE несуществующей записи возвращает 404", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  const response = await request.delete(
    `${apiUrl}/api/v1/favorites/nonexistent-id`,
  );

  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body).toEqual({
    success: false,
    error: "Item not found in favorites",
  });
});

// SC-107: Очистка всех записей избранного (DELETE all)
test("SC-107: DELETE /api/v1/favorites очищает все записи", async ({
  request,
  baseURL,
}) => {
  const apiUrl = getApiUrl(baseURL);

  // Добавляем две записи
  await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { id: "clear-1", title: "Первая" },
  });
  await request.post(`${apiUrl}/api/v1/favorites`, {
    data: { id: "clear-2", title: "Вторая" },
  });

  // Очищаем всё
  const deleteResponse = await request.delete(`${apiUrl}/api/v1/favorites`);
  expect(deleteResponse.status()).toBe(200);
  const deleteBody = await deleteResponse.json();
  expect(deleteBody).toEqual({ success: true, data: null });

  // Проверяем что список пуст
  const getResponse = await request.get(`${apiUrl}/api/v1/favorites`);
  const getBody = await getResponse.json();
  expect(getBody.data).toHaveLength(0);
});
