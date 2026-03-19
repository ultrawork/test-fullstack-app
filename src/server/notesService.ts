import type { Note, NoteId } from "@/types/note";
import { findNote, updateNote } from "@/app/api/_db/notes";

/** Ошибка: заметка не найдена. */
export class NotFoundError extends Error {
  constructor(id: NoteId) {
    super(`Note not found: ${id}`);
    this.name = "NotFoundError";
  }
}

/**
 * Архивирует заметку по идентификатору.
 * Идемпотентна: повторный вызов для уже архивированной заметки
 * возвращает её без изменений.
 *
 * @param id — идентификатор заметки.
 * @returns Копия архивированной заметки.
 * @throws {NotFoundError} Если заметка не найдена.
 */
export function archiveNote(id: NoteId): Note {
  const note = findNote(id);
  if (!note) {
    throw new NotFoundError(id);
  }

  if (note.archivedAt !== null) {
    return note;
  }

  const updated = updateNote(id, { archivedAt: new Date().toISOString() });
  return updated!;
}

/**
 * Разархивирует заметку по идентификатору.
 * Идемпотентна: повторный вызов для неархивированной заметки
 * возвращает её без изменений.
 *
 * @param id — идентификатор заметки.
 * @returns Копия разархивированной заметки.
 * @throws {NotFoundError} Если заметка не найдена.
 */
export function unarchiveNote(id: NoteId): Note {
  const note = findNote(id);
  if (!note) {
    throw new NotFoundError(id);
  }

  if (note.archivedAt === null) {
    return note;
  }

  const updated = updateNote(id, { archivedAt: null });
  return updated!;
}
