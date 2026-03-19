import type { Note } from "@/types/note";
import { listNotes, resetDb } from "@/app/api/_db/notes";

/**
 * Ошибка, выбрасываемая когда заметка не найдена.
 */
export class NotFoundError extends Error {
  constructor(id: string) {
    super(`Note not found: ${id}`);
    this.name = "NotFoundError";
  }
}

/** Опции фильтрации для получения заметок. */
interface GetNotesOptions {
  includeArchived?: boolean;
}

/**
 * Возвращает заметки с фильтрацией по статусу архивации.
 *
 * @param options.includeArchived — если true, возвращает все заметки включая архивные.
 *                                  По умолчанию false — только активные.
 * @returns Отфильтрованный массив заметок.
 */
export function getNotes(options: GetNotesOptions = {}): Note[] {
  const { includeArchived = false } = options;
  const all = listNotes();

  if (includeArchived) {
    return all;
  }

  return all.filter((note) => note.archivedAt === null);
}

/**
 * Сбрасывает состояние хранилища заметок к исходным данным.
 * Используется для обеспечения детерминированности тестов.
 */
export function resetNotes(): void {
  resetDb();
}
