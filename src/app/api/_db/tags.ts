/**
 * In-memory хранилище тегов.
 * Начальный набор тегов для демонстрации.
 */
const initialTags: ReadonlyArray<string> = ["work", "personal", "urgent"];

/** Изменяемое состояние in-memory хранилища тегов. */
let tags: string[] = [...initialTags];

/**
 * Возвращает список всех уникальных тегов.
 *
 * @returns Копия массива тегов для защиты от внешней мутации.
 */
export function listTags(): string[] {
  return [...new Set(tags)];
}

/**
 * Сбрасывает состояние хранилища тегов к исходным данным.
 * Используется для обеспечения детерминированности тестов.
 */
export function resetTags(): void {
  tags = [...initialTags];
}
