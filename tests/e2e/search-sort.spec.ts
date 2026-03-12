import { test, expect } from '@playwright/test';
import { uniqueEmail, registerViaUI, registerViaAPI, loginViaAPI, loginViaUI, TEST_PASSWORD } from './helpers';

test.describe('Поиск и сортировка заметок', () => {
  // SC-020: Поиск заметок по ключевому слову
  test('SC-020: поиск заметок по ключевому слову', async ({ page, request }) => {
    const email = uniqueEmail('sc020');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём три заметки через API
    await request.post('/api/v1/notes', {
      data: { title: 'Рецепт пирога', content: 'Нужна мука и яйца' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Список покупок', content: 'Купить мука, масло' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Рабочие задачи', content: 'Сделать отчёт' },
    });

    // Логинимся через UI
    await loginViaUI(page, email);

    // Проверяем, что все 3 заметки отображаются
    await expect(page.getByText('Рецепт пирога')).toBeVisible();
    await expect(page.getByText('Список покупок')).toBeVisible();
    await expect(page.getByText('Рабочие задачи')).toBeVisible();

    // Вводим поисковый запрос
    await page.getByTestId('search-input').fill('мука');

    // Ждём debounce и обновления списка
    await page.waitForTimeout(500);

    // Должны остаться только заметки содержащие "мука"
    await expect(page.getByText('Рецепт пирога')).toBeVisible();
    await expect(page.getByText('Список покупок')).toBeVisible();
    await expect(page.getByText('Рабочие задачи')).not.toBeVisible();

    // Очищаем поиск
    await page.getByTestId('search-input').fill('');
    await page.waitForTimeout(500);

    // Все заметки снова видны
    await expect(page.getByText('Рецепт пирога')).toBeVisible();
    await expect(page.getByText('Список покупок')).toBeVisible();
    await expect(page.getByText('Рабочие задачи')).toBeVisible();
  });

  // SC-021: Сортировка заметок по разным полям
  test('SC-021: сортировка заметок по разным полям', async ({ page, request }) => {
    const email = uniqueEmail('sc021');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём заметки в определённом порядке через API (с задержкой для разных createdAt)
    await request.post('/api/v1/notes', {
      data: { title: 'Альфа', content: 'Первая заметка' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Бета', content: 'Вторая заметка' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Гамма', content: 'Третья заметка' },
    });

    // Логинимся через UI
    await loginViaUI(page, email);

    // По умолчанию выбрано "Date updated"
    const sortSelect = page.getByTestId('sort-select');
    await expect(sortSelect).toHaveValue('updatedAt');

    // Переключаем на "Date created"
    await sortSelect.selectOption('createdAt');
    await page.waitForTimeout(500);

    // Проверяем что селектор изменился
    await expect(sortSelect).toHaveValue('createdAt');

    // Переключаем на "Title"
    await sortSelect.selectOption('title');
    await page.waitForTimeout(500);

    await expect(sortSelect).toHaveValue('title');

    // При сортировке по Title desc: Гамма, Бета, Альфа
    const noteCards = page.getByTestId('note-card');
    await expect(noteCards).toHaveCount(3);

    const titles = await page.getByTestId('note-title-link').allTextContents();
    expect(titles).toEqual(['Гамма', 'Бета', 'Альфа']);

    // Возвращаем на "Date updated"
    await sortSelect.selectOption('updatedAt');
    await page.waitForTimeout(500);
    await expect(sortSelect).toHaveValue('updatedAt');
  });

  // SC-022: Переключение порядка сортировки (asc/desc)
  test('SC-022: переключение порядка сортировки asc/desc', async ({ page, request }) => {
    const email = uniqueEmail('sc022');
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

    await loginViaUI(page, email);

    // Выбираем сортировку по Title
    const sortSelect = page.getByTestId('sort-select');
    await sortSelect.selectOption('title');
    await page.waitForTimeout(500);

    // Проверяем кнопку переключения порядка
    const sortOrderBtn = page.getByTestId('sort-order-button');
    await expect(sortOrderBtn).toBeVisible();

    // По умолчанию desc — проверяем aria-label
    await expect(sortOrderBtn).toHaveAttribute('aria-label', 'Sort descending');

    // Порядок desc: Гамма, Бета, Альфа
    let titles = await page.getByTestId('note-title-link').allTextContents();
    expect(titles).toEqual(['Гамма', 'Бета', 'Альфа']);

    // Нажимаем кнопку — переключаем на asc
    await sortOrderBtn.click();
    await page.waitForTimeout(500);

    await expect(sortOrderBtn).toHaveAttribute('aria-label', 'Sort ascending');

    // Порядок asc: Альфа, Бета, Гамма
    titles = await page.getByTestId('note-title-link').allTextContents();
    expect(titles).toEqual(['Альфа', 'Бета', 'Гамма']);

    // Нажимаем ещё раз — возвращаем desc
    await sortOrderBtn.click();
    await page.waitForTimeout(500);

    await expect(sortOrderBtn).toHaveAttribute('aria-label', 'Sort descending');

    // Порядок снова desc: Гамма, Бета, Альфа
    titles = await page.getByTestId('note-title-link').allTextContents();
    expect(titles).toEqual(['Гамма', 'Бета', 'Альфа']);
  });

  // SC-023: Комбинация поиска и сортировки
  test('SC-023: комбинация поиска и сортировки', async ({ page, request }) => {
    const email = uniqueEmail('sc023');
    await registerViaAPI(request, email);
    await loginViaAPI(request, email);

    // Создаём заметки
    await request.post('/api/v1/notes', {
      data: { title: 'Альфа-задача', content: 'Это задача номер один' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Бета-задача', content: 'Это задача номер два' },
    });
    await request.post('/api/v1/notes', {
      data: { title: 'Гамма-отдых', content: 'Это про отдых' },
    });

    await loginViaUI(page, email);

    // Вводим поиск
    await page.getByTestId('search-input').fill('задача');
    await page.waitForTimeout(500);

    // Должны остаться только 2 заметки с "задача"
    await expect(page.getByText('Альфа-задача')).toBeVisible();
    await expect(page.getByText('Бета-задача')).toBeVisible();
    await expect(page.getByText('Гамма-отдых')).not.toBeVisible();

    // Выбираем сортировку по Title, порядок asc
    const sortSelect = page.getByTestId('sort-select');
    await sortSelect.selectOption('title');
    await page.waitForTimeout(500);

    const sortOrderBtn = page.getByTestId('sort-order-button');
    // Если порядок desc — переключаем на asc
    const ariaLabel = await sortOrderBtn.getAttribute('aria-label');
    if (ariaLabel === 'Sort descending') {
      await sortOrderBtn.click();
      await page.waitForTimeout(500);
    }

    // Проверяем алфавитный порядок: Альфа-задача первая, Бета-задача вторая
    const titles = await page.getByTestId('note-title-link').allTextContents();
    expect(titles).toEqual(['Альфа-задача', 'Бета-задача']);
  });
});
