import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaAPI, loginViaAPI, TEST_PASSWORD } from './helpers';

test.describe('API тесты', () => {
  // SC-040: Аутентификация через API (регистрация, вход, профиль, выход)
  test('SC-040: полный цикл аутентификации через API', async ({ request }) => {
    const email = uniqueEmail('sc040');

    // Регистрация
    const registerResp = await request.post('/api/v1/auth/register', {
      data: { email, password: TEST_PASSWORD, confirmPassword: TEST_PASSWORD },
    });
    expect(registerResp.status()).toBe(201);
    const registerBody = await registerResp.json();
    expect(registerBody.data.user.email).toBe(email);

    // Получение профиля (cookies сохраняются в контексте request)
    const meResp = await request.get('/api/v1/auth/me');
    expect(meResp.status()).toBe(200);
    const meBody = await meResp.json();
    expect(meBody.data.user.email).toBe(email);

    // Выход
    const logoutResp = await request.post('/api/v1/auth/logout');
    expect(logoutResp.status()).toBe(200);
    const logoutBody = await logoutResp.json();
    expect(logoutBody.data.message).toBe('Logged out');
  });

  // SC-041: CRUD заметок через API
  test('SC-041: CRUD заметок через API', async ({ request }) => {
    const email = uniqueEmail('sc041');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создание
    const createResp = await request.post('/api/v1/notes', {
      data: { title: 'API Note', content: 'API Content' },
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    expect(created.data.title).toBe('API Note');
    const noteId = created.data.id;
    expect(noteId).toBeTruthy();

    // Чтение
    const getResp = await request.get(`/api/v1/notes/${noteId}`);
    expect(getResp.status()).toBe(200);
    const fetched = await getResp.json();
    expect(fetched.data.title).toBe('API Note');
    expect(fetched.data.content).toBe('API Content');

    // Обновление
    const updateResp = await request.put(`/api/v1/notes/${noteId}`, {
      data: { title: 'Updated Note' },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.title).toBe('Updated Note');
    expect(updated.data.content).toBe('API Content');

    // Удаление
    const deleteResp = await request.delete(`/api/v1/notes/${noteId}`);
    expect(deleteResp.status()).toBe(200);
    const deleteBody = await deleteResp.json();
    expect(deleteBody.data.message).toBe('Note deleted');

    // Проверяем что заметка удалена
    const checkResp = await request.get(`/api/v1/notes/${noteId}`);
    expect(checkResp.status()).toBe(404);
  });

  // SC-042: Фильтрация, поиск и сортировка заметок через API
  test('SC-042: фильтрация, поиск и сортировка через API', async ({ request }) => {
    const email = uniqueEmail('sc042');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём заметки
    await request.post('/api/v1/notes', {
      data: { title: 'Альфа', content: 'Первая' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Бета', content: 'Вторая' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Гамма', content: 'Третья' },
    });

    // Сортировка по title asc
    const ascResp = await request.get('/api/v1/notes?sortBy=title&sortOrder=asc');
    expect(ascResp.status()).toBe(200);
    const ascBody = await ascResp.json();
    const ascTitles = ascBody.data.map((n: { title: string }) => n.title);
    expect(ascTitles).toEqual(['Альфа', 'Бета', 'Гамма']);

    // Сортировка по title desc
    const descResp = await request.get('/api/v1/notes?sortBy=title&sortOrder=desc');
    expect(descResp.status()).toBe(200);
    const descBody = await descResp.json();
    const descTitles = descBody.data.map((n: { title: string }) => n.title);
    expect(descTitles).toEqual(['Гамма', 'Бета', 'Альфа']);

    // Сортировка по createdAt desc (последняя созданная первой)
    const createdResp = await request.get('/api/v1/notes?sortBy=createdAt&sortOrder=desc');
    expect(createdResp.status()).toBe(200);
    const createdBody = await createdResp.json();
    expect(createdBody.data[0].title).toBe('Гамма');

    // Поиск по содержимому
    const searchResp = await request.get('/api/v1/notes?search=Первая');
    expect(searchResp.status()).toBe(200);
    const searchBody = await searchResp.json();
    expect(searchBody.data.length).toBe(1);
    expect(searchBody.data[0].title).toBe('Альфа');

    // Пагинация
    const pageResp = await request.get('/api/v1/notes?page=1&limit=2');
    expect(pageResp.status()).toBe(200);
    const pageBody = await pageResp.json();
    expect(pageBody.data.length).toBe(2);
    expect(pageBody.total).toBe(3);
    expect(pageBody.page).toBe(1);
    expect(pageBody.limit).toBe(2);
  });

  // SC-043: CRUD категорий через API
  test('SC-043: CRUD категорий через API', async ({ request }) => {
    const email = uniqueEmail('sc043');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создание
    const createResp = await request.post('/api/v1/categories', {
      data: { name: 'Работа', color: '#ef4444' },
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    expect(created.data.name).toBe('Работа');
    expect(created.data.color).toBe('#ef4444');
    const catId = created.data.id;

    // Получение списка
    const listResp = await request.get('/api/v1/categories');
    expect(listResp.status()).toBe(200);
    const listBody = await listResp.json();
    const found = listBody.data.find((c: { name: string }) => c.name === 'Работа');
    expect(found).toBeTruthy();
    expect(found._count.notes).toBe(0);

    // Обновление
    const updateResp = await request.put(`/api/v1/categories/${catId}`, {
      data: { name: 'Проекты' },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.name).toBe('Проекты');

    // Дубликат имени
    const dupResp = await request.post('/api/v1/categories', {
      data: { name: 'Проекты' },
    });
    expect(dupResp.status()).toBe(409);
    const dupBody = await dupResp.json();
    expect(dupBody.error).toBe('Category with this name already exists');

    // Удаление
    const deleteResp = await request.delete(`/api/v1/categories/${catId}`);
    expect(deleteResp.status()).toBe(200);
    const deleteBody = await deleteResp.json();
    expect(deleteBody.data.message).toBe('Category deleted');
  });

  // SC-044: Обработка ошибок API (валидация, авторизация, не найдено)
  test('SC-044: обработка ошибок API', async ({ request }) => {
    // Запрос без авторизации
    const unauthResp = await request.get('/api/v1/notes');
    expect(unauthResp.status()).toBe(401);
    const unauthBody = await unauthResp.json();
    expect(unauthBody.error).toBe('Unauthorized');

    // Авторизуемся
    const email = uniqueEmail('sc044');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создание заметки без обязательных полей
    const invalidResp = await request.post('/api/v1/notes', {
      data: { title: '', content: '' },
    });
    expect(invalidResp.status()).toBe(400);

    // Получение несуществующей заметки
    const notFoundResp = await request.get('/api/v1/notes/00000000-0000-0000-0000-000000000000');
    expect(notFoundResp.status()).toBe(404);

    // Невалидные параметры сортировки
    const invalidSortResp = await request.get('/api/v1/notes?sortBy=invalid');
    expect(invalidSortResp.status()).toBe(400);
  });
});
