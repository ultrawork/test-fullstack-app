/** Уникальный идентификатор заметки. */
export type NoteId = string;

/**
 * Заметка в системе.
 *
 * Все поля дат хранятся как ISO-строки для совместимости с сериализацией
 * между сервером, клиентом и мобильными приложениями.
 *
 * @property archivedAt — ISO-строка момента архивации или null, если заметка не в архиве.
 * @property createdAt  — ISO-строка момента создания.
 * @property updatedAt  — ISO-строка последнего обновления.
 * @property tags       — Массив строк тегов заметки (может быть пустым).
 */
export interface Note {
  id: NoteId;
  title: string;
  content: string;
  /** ISO-строка или null; null означает «не в архиве». */
  archivedAt: string | null;
  /** ISO-строка момента создания. */
  createdAt: string;
  /** ISO-строка момента последнего обновления. */
  updatedAt: string;
  /** Массив строк тегов заметки; может быть пустым. */
  tags: string[];
}

/**
 * Допустимые поля для обновления заметки.
 * Обновление id, createdAt не разрешено.
 * Теги меняются отдельными функциями/эндпоинтами: addTagToNote, removeTagFromNote.
 */
export type NoteUpdate = Partial<
  Pick<Note, "title" | "content" | "archivedAt">
>;
