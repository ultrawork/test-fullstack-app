import { test, expect } from "@playwright/test";

// SC-020: GET /api/v1/notes возвращает все заметки
test("SC-020: API возвращает все 5 заметок", async ({ request }) => {
  const apiUrl = process.env.API_URL || process.env.BASE_URL || "http://localhost:4000";
  const response = await request.get(`${apiUrl}/api/v1/notes`);

  expect(response.status()).toBe(200);

  const json = await response.json();
  expect(json.success).toBe(true);
  expect(json.data.total).toBe(5);
  expect(json.data.notes).toHaveLength(5);

  // Проверяем структуру каждой заметки
  for (const note of json.data.notes) {
    expect(note).toHaveProperty("id");
    expect(note).toHaveProperty("title");
    expect(note).toHaveProperty("content");
    expect(note).toHaveProperty("createdAt");
    expect(note).toHaveProperty("updatedAt");
  }

  // Проверяем сортировку — первая «Рецепт пасты», последняя «Добро пожаловать»
  expect(json.data.notes[0].title).toBe("Рецепт пасты");
  expect(json.data.notes[4].title).toBe("Добро пожаловать в Notes App");
});

// SC-021: GET /api/v1/notes?search=query фильтрует заметки
test("SC-021: API фильтрует заметки по search параметру", async ({ request }) => {
  const apiUrl = process.env.API_URL || process.env.BASE_URL || "http://localhost:4000";

  // Поиск по заголовку
  const res1 = await request.get(`${apiUrl}/api/v1/notes?search=покупок`);
  const json1 = await res1.json();

  expect(res1.status()).toBe(200);
  expect(json1.success).toBe(true);
  expect(json1.data.total).toBe(1);
  expect(json1.data.notes[0].title).toBe("Список покупок");

  // Поиск по содержимому
  const res2 = await request.get(`${apiUrl}/api/v1/notes?search=масло`);
  const json2 = await res2.json();

  expect(res2.status()).toBe(200);
  expect(json2.data.total).toBe(1);
  expect(json2.data.notes[0].title).toBe("Список покупок");
});

// SC-022: API — поиск без учёта регистра
test("SC-022: API поиск case-insensitive", async ({ request }) => {
  const apiUrl = process.env.API_URL || process.env.BASE_URL || "http://localhost:4000";

  const variants = ["РЕЦЕПТ", "рецепт", "Рецепт"];

  for (const query of variants) {
    const response = await request.get(`${apiUrl}/api/v1/notes?search=${encodeURIComponent(query)}`);
    const json = await response.json();

    expect(response.status()).toBe(200);
    expect(json.data.total).toBe(1);
    expect(json.data.notes[0].title).toBe("Рецепт пасты");
  }
});

// SC-023: API — граничные случаи параметра search
test("SC-023: API граничные случаи search параметра", async ({ request }) => {
  const apiUrl = process.env.API_URL || process.env.BASE_URL || "http://localhost:4000";

  // Пустая строка
  const res1 = await request.get(`${apiUrl}/api/v1/notes?search=`);
  const json1 = await res1.json();
  expect(json1.data.total).toBe(5);

  // Только пробелы
  const res2 = await request.get(`${apiUrl}/api/v1/notes?search=${encodeURIComponent("   ")}`);
  const json2 = await res2.json();
  expect(json2.data.total).toBe(5);

  // Несуществующий текст
  const res3 = await request.get(`${apiUrl}/api/v1/notes?search=${encodeURIComponent("xyzнесуществующий")}`);
  const json3 = await res3.json();
  expect(json3.data.total).toBe(0);
  expect(json3.data.notes).toHaveLength(0);

  // Без параметра search
  const res4 = await request.get(`${apiUrl}/api/v1/notes`);
  const json4 = await res4.json();
  expect(json4.data.total).toBe(5);
});
