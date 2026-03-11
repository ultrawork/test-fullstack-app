import { test, expect } from "@playwright/test";

const APP_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || APP_URL;

/**
 * Вспомогательная функция: удалить все заметки через API
 */
async function deleteAllNotes(
  request: import("@playwright/test").APIRequestContext,
) {
  const response = await request.get(`${API_URL}/api/v1/notes`);
  const notes = await response.json();
  for (const note of notes) {
    await request.delete(`${API_URL}/api/v1/notes/${note.id}`);
  }
}

test.beforeEach(async ({ request }) => {
  // Очистка всех заметок перед каждым тестом
  await deleteAllNotes(request);
});

// SC-006: CRUD заметки через API
test("SC-006: CRUD заметки через API", async ({ request }) => {
  // Шаг 1: Создать заметку
  const createResponse = await request.post(`${API_URL}/api/v1/notes`, {
    data: {
      title: "Тестовая заметка",
      content: "Содержимое тестовой заметки",
    },
  });
  expect(createResponse.status()).toBe(201);
  const createdNote = await createResponse.json();
  expect(createdNote.title).toBe("Тестовая заметка");
  expect(createdNote.content).toBe("Содержимое тестовой заметки");
  expect(createdNote.isPinned).toBe(false);
  expect(createdNote.id).toBeTruthy();
  expect(createdNote.createdAt).toBeTruthy();
  expect(createdNote.updatedAt).toBeTruthy();

  const noteId = createdNote.id;

  // Шаг 3: Получить заметку по ID
  const getResponse = await request.get(`${API_URL}/api/v1/notes/${noteId}`);
  expect(getResponse.status()).toBe(200);
  const fetchedNote = await getResponse.json();
  expect(fetchedNote.title).toBe("Тестовая заметка");
  expect(fetchedNote.content).toBe("Содержимое тестовой заметки");

  // Шаг 4: Обновить заметку
  const updateResponse = await request.put(
    `${API_URL}/api/v1/notes/${noteId}`,
    {
      data: {
        title: "Обновлённый заголовок",
        content: "Обновлённое содержимое",
      },
    },
  );
  expect(updateResponse.status()).toBe(200);
  const updatedNote = await updateResponse.json();
  expect(updatedNote.title).toBe("Обновлённый заголовок");
  expect(updatedNote.content).toBe("Обновлённое содержимое");

  // Шаг 5: Получить список всех заметок
  const listResponse = await request.get(`${API_URL}/api/v1/notes`);
  expect(listResponse.status()).toBe(200);
  const allNotes = await listResponse.json();
  expect(allNotes).toHaveLength(1);
  expect(allNotes[0].title).toBe("Обновлённый заголовок");

  // Шаг 6: Удалить заметку
  const deleteResponse = await request.delete(
    `${API_URL}/api/v1/notes/${noteId}`,
  );
  expect(deleteResponse.status()).toBe(200);
  const deleteBody = await deleteResponse.json();
  expect(deleteBody.success).toBe(true);

  // Шаг 7: Проверить, что список пуст
  const emptyListResponse = await request.get(`${API_URL}/api/v1/notes`);
  expect(emptyListResponse.status()).toBe(200);
  const emptyNotes = await emptyListResponse.json();
  expect(emptyNotes).toHaveLength(0);
});

// SC-007: Создание заметки без содержимого
test("SC-007: создание заметки без содержимого", async ({ request }) => {
  const response = await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: "Только заголовок" },
  });
  expect(response.status()).toBe(201);
  const note = await response.json();
  expect(note.content).toBe("");
  expect(note.isPinned).toBe(false);
  expect(note.id).toBeTruthy();
  expect(note.createdAt).toBeTruthy();
  expect(note.updatedAt).toBeTruthy();
});

// SC-008: Валидация при создании и обновлении заметки
test("SC-008: валидация при создании и обновлении заметки", async ({
  request,
}) => {
  // Создаём заметку для тестов PUT
  const createResp = await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: "Existing note", content: "Text" },
  });
  const existingNote = await createResp.json();
  const noteId = existingNote.id;

  // Шаг 1: POST без title
  const resp1 = await request.post(`${API_URL}/api/v1/notes`, {
    data: {},
  });
  expect(resp1.status()).toBe(400);
  expect((await resp1.json()).error).toBe("Title is required");

  // Шаг 2: POST с title не строкой
  const resp2 = await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: 123 },
  });
  expect(resp2.status()).toBe(400);
  expect((await resp2.json()).error).toBe("Title is required");

  // Шаг 3: POST с content не строкой
  const resp3 = await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: "ok", content: 42 },
  });
  expect(resp3.status()).toBe(400);
  expect((await resp3.json()).error).toBe("Content must be a string");

  // Шаг 4: POST с невалидным JSON
  const resp4 = await request.fetch(`${API_URL}/api/v1/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: "{broken",
  });
  expect(resp4.status()).toBe(400);
  expect((await resp4.json()).error).toBe("Invalid JSON");

  // Шаг 5: PUT с title не строкой
  const resp5 = await request.put(`${API_URL}/api/v1/notes/${noteId}`, {
    data: { title: 123 },
  });
  expect(resp5.status()).toBe(400);
  expect((await resp5.json()).error).toBe("Title must be a string");

  // Шаг 6: PUT с content не строкой
  const resp6 = await request.put(`${API_URL}/api/v1/notes/${noteId}`, {
    data: { content: false },
  });
  expect(resp6.status()).toBe(400);
  expect((await resp6.json()).error).toBe("Content must be a string");
});

// SC-009: Toggle pin/unpin через API
test("SC-009: toggle pin/unpin через API", async ({ request }) => {
  // Создаём заметку
  const createResp = await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: "Pin test", content: "Test" },
  });
  const note = await createResp.json();
  const noteId = note.id;

  // Шаг 1: PATCH pin (false -> true)
  const patchResp1 = await request.patch(
    `${API_URL}/api/v1/notes/${noteId}/pin`,
  );
  expect(patchResp1.status()).toBe(200);
  const patched1 = await patchResp1.json();
  expect(patched1.isPinned).toBe(true);

  // Шаг 2: GET для проверки
  const getResp1 = await request.get(`${API_URL}/api/v1/notes/${noteId}`);
  expect(getResp1.status()).toBe(200);
  expect((await getResp1.json()).isPinned).toBe(true);

  // Шаг 3: PATCH pin (true -> false)
  const patchResp2 = await request.patch(
    `${API_URL}/api/v1/notes/${noteId}/pin`,
  );
  expect(patchResp2.status()).toBe(200);
  const patched2 = await patchResp2.json();
  expect(patched2.isPinned).toBe(false);

  // Шаг 4: GET для проверки
  const getResp2 = await request.get(`${API_URL}/api/v1/notes/${noteId}`);
  expect(getResp2.status()).toBe(200);
  expect((await getResp2.json()).isPinned).toBe(false);
});

// SC-010: Сортировка заметок — закреплённые первыми
test("SC-010: сортировка заметок — закреплённые первыми", async ({
  request,
}) => {
  // Создаём 3 заметки
  const respA = await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: "Note A" },
  });
  const noteA = await respA.json();

  await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: "Note B" },
  });

  await request.post(`${API_URL}/api/v1/notes`, {
    data: { title: "Note C" },
  });

  // Шаг 1: Проверяем порядок по умолчанию (новые первыми)
  const listResp1 = await request.get(`${API_URL}/api/v1/notes`);
  const notes1 = await listResp1.json();
  expect(notes1[0].title).toBe("Note C");
  expect(notes1[1].title).toBe("Note B");
  expect(notes1[2].title).toBe("Note A");

  // Шаг 2: Закрепляем Note A (самую старую)
  const pinResp = await request.patch(
    `${API_URL}/api/v1/notes/${noteA.id}/pin`,
  );
  expect(pinResp.status()).toBe(200);

  // Шаг 3: Проверяем новый порядок — Note A первая (закреплённая)
  const listResp2 = await request.get(`${API_URL}/api/v1/notes`);
  const notes2 = await listResp2.json();
  expect(notes2[0].title).toBe("Note A");
  expect(notes2[0].isPinned).toBe(true);
  expect(notes2[1].title).toBe("Note C");
  expect(notes2[2].title).toBe("Note B");
});

// SC-011: Операции с несуществующей заметкой
test("SC-011: операции с несуществующей заметкой", async ({ request }) => {
  const fakeId = "non-existent-id";

  // GET несуществующей заметки
  const getResp = await request.get(`${API_URL}/api/v1/notes/${fakeId}`);
  expect(getResp.status()).toBe(404);
  expect((await getResp.json()).error).toBe("Note not found");

  // PUT несуществующей заметки
  const putResp = await request.put(`${API_URL}/api/v1/notes/${fakeId}`, {
    data: { title: "Updated" },
  });
  expect(putResp.status()).toBe(404);
  expect((await putResp.json()).error).toBe("Note not found");

  // DELETE несуществующей заметки
  const deleteResp = await request.delete(
    `${API_URL}/api/v1/notes/${fakeId}`,
  );
  expect(deleteResp.status()).toBe(404);
  expect((await deleteResp.json()).error).toBe("Note not found");

  // PATCH pin несуществующей заметки
  const patchResp = await request.patch(
    `${API_URL}/api/v1/notes/${fakeId}/pin`,
  );
  expect(patchResp.status()).toBe(404);
  expect((await patchResp.json()).error).toBe("Note not found");
});
