import type { Note, NoteUpdate } from "@/types/note";

/**
 * Исходный неизменяемый набор заметок.
 * Используется для сброса состояния БД в тестах через resetDb().
 */
const initialNotes: ReadonlyArray<Note> = [
  {
    id: "note-1",
    title: "Первая заметка",
    content: "Содержимое первой заметки.",
    archivedAt: null,
    createdAt: "2024-01-01T10:00:00.000Z",
    updatedAt: "2024-01-01T10:00:00.000Z",
  },
  {
    id: "note-2",
    title: "Вторая заметка",
    content: "Содержимое второй заметки.",
    archivedAt: null,
    createdAt: "2024-01-02T10:00:00.000Z",
    updatedAt: "2024-01-02T10:00:00.000Z",
  },
  {
    id: "note-3",
    title: "Архивная заметка",
    content: "Эта заметка находится в архиве.",
    archivedAt: "2024-02-15T12:00:00.000Z",
    createdAt: "2024-01-03T10:00:00.000Z",
    updatedAt: "2024-02-15T12:00:00.000Z",
  },
  {
    id: "note-4",
    title: "Четвёртая заметка",
    content: "Содержимое четвёртой заметки.",
    archivedAt: null,
    createdAt: "2024-01-04T10:00:00.000Z",
    updatedAt: "2024-01-04T10:00:00.000Z",
  },
];

/** Изменяемое состояние in-memory БД. */
let notes: Note[] = initialNotes.map((n) => ({ ...n }));

/**
 * Возвращает все заметки.
 * Фильтрация по archivedAt выполняется на стороне потребителя (сервиса/хэндлера).
 *
 * @returns Копии всех заметок для защиты от внешней мутации.
 */
export function listNotes(): Note[] {
  return notes.map((n) => ({ ...n }));
}

/**
 * Ищет заметку по идентификатору.
 *
 * @param id — идентификатор заметки.
 * @returns Копия найденной заметки или undefined, если заметка не найдена.
 */
export function findNote(id: string): Note | undefined {
  const note = notes.find((n) => n.id === id);
  return note ? { ...note } : undefined;
}

/**
 * Обновляет разрешённые поля заметки (title, content, archivedAt).
 * Автоматически обновляет поле updatedAt.
 *
 * @param id     — идентификатор заметки.
 * @param update — объект с обновляемыми полями.
 * @returns Копия обновлённой заметки или undefined, если заметка не найдена.
 */
export function updateNote(id: string, update: NoteUpdate): Note | undefined {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return undefined;

  const updated: Note = {
    ...notes[index],
    ...update,
    updatedAt: new Date().toISOString(),
  };
  notes[index] = updated;
  return { ...updated };
}

/**
 * Сбрасывает состояние БД к исходным данным.
 * Используется для обеспечения детерминированности тестов.
 */
export function resetDb(): void {
  notes = initialNotes.map((n) => ({ ...n }));
}
