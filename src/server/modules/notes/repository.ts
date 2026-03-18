import type { Note, Tag, Attachment } from "@/types/note";

/** Фильтры для списка заметок */
export interface NotesListFilter {
  tagIds?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Интерфейс репозитория заметок */
export interface INotesRepository {
  /** Получить заметку по ID */
  getById(id: string): Promise<Note | undefined>;
  /** Получить список заметок с фильтрацией */
  list(filter?: NotesListFilter): Promise<Note[]>;
  /** Полнотекстовый поиск по заметкам */
  search(query: string): Promise<Note[]>;
}

/* ---------- Seed-данные ---------- */

const tags: Tag[] = [
  { id: "tag-1", name: "Работа", color: "#FF5733" },
  { id: "tag-2", name: "Личное", color: "#33B5FF" },
  { id: "tag-3", name: "Код", color: "#28A745" },
  { id: "tag-4", name: "Идеи", color: "#FFC107" },
  { id: "tag-5", name: "Рецепты" },
];

const attachments: Record<string, Attachment[]> = {
  "note-1": [
    {
      id: "att-1",
      type: "image",
      filename: "architecture.png",
      mimeType: "image/png",
      size: 204800,
      url: "/uploads/architecture.png",
      previewUrl: "/uploads/architecture_thumb.png",
      createdAt: new Date("2025-01-15T10:00:00Z"),
    },
  ],
  "note-4": [
    {
      id: "att-2",
      type: "document",
      filename: "recipe.pdf",
      mimeType: "application/pdf",
      size: 512000,
      url: "/uploads/recipe.pdf",
      createdAt: new Date("2025-03-01T12:00:00Z"),
    },
    {
      id: "att-3",
      type: "image",
      filename: "cake.jpg",
      mimeType: "image/jpeg",
      size: 153600,
      url: "/uploads/cake.jpg",
      previewUrl: "/uploads/cake_thumb.jpg",
      createdAt: new Date("2025-03-01T12:05:00Z"),
    },
  ],
};

const seedNotes: Note[] = [
  {
    id: "note-1",
    title: "Архитектура проекта 🏗️",
    content: [
      "## Основные принципы",
      "",
      "**Чистая архитектура** подразумевает разделение на слои:",
      "",
      "- *Domain* — бизнес-логика",
      "- *Application* — сценарии использования",
      "- *Infrastructure* — внешние зависимости",
      "",
      "```typescript",
      "interface Repository<T> {",
      "  getById(id: string): Promise<T | undefined>;",
      "  list(): Promise<T[]>;",
      "}",
      "```",
      "",
      "Смотри вложение с диаграммой 👇",
    ].join("\n"),
    tags: [tags[0], tags[2]],
    attachments: attachments["note-1"],
    createdAt: new Date("2025-01-15T10:00:00Z"),
    updatedAt: new Date("2025-01-20T14:30:00Z"),
  },
  {
    id: "note-2",
    title: "Список покупок 🛒",
    content: [
      "Нужно купить на выходных:",
      "",
      "1. Молоко 🥛",
      "2. Хлеб 🍞",
      "3. Сыр *пармезан*",
      "4. Яблоки — **зелёные**, 1 кг",
      "5. Кофе ☕",
      "",
      "Дополнительно: сахар, масло",
    ].join("\n"),
    tags: [tags[1]],
    attachments: [],
    createdAt: new Date("2025-02-10T08:00:00Z"),
    updatedAt: new Date("2025-02-10T08:00:00Z"),
  },
  {
    id: "note-3",
    title: "Идея: трекер привычек 💡",
    content: [
      "## Концепт",
      "",
      "*Ежедневный трекер* для формирования полезных привычек.",
      "",
      "**Ключевые фичи:**",
      "- Настраиваемые привычки",
      "- Статистика в виде *heatmap*",
      "- Напоминания через push-уведомления",
      "",
      "```json",
      '{  "habit": "Чтение 📖",  "goal": 30,  "unit": "мин" }',
      "```",
      "",
      "Нужно продумать UX для мобильной версии 🤔",
    ].join("\n"),
    tags: [tags[3], tags[2]],
    attachments: [],
    createdAt: new Date("2025-02-20T16:00:00Z"),
    updatedAt: new Date("2025-02-22T09:15:00Z"),
  },
  {
    id: "note-4",
    title: "Рецепт: шоколадный торт 🎂",
    content: [
      "## Ингредиенты",
      "",
      "- 200 г **тёмного шоколада**",
      "- 150 г *сливочного масла*",
      "- 3 яйца",
      "- 100 г сахара",
      "- 80 г муки",
      "",
      "## Приготовление",
      "",
      "1. Растопить шоколад с маслом на водяной бане 🍫",
      "2. Взбить яйца с сахаром до **пышной пены**",
      "3. Аккуратно соединить смеси",
      "4. Добавить муку, перемешать *лопаткой*",
      "5. Выпекать при 180°C — 25 минут ⏲️",
      "",
      "Подавать с ванильным мороженым 🍨",
    ].join("\n"),
    tags: [tags[1], tags[4]],
    attachments: attachments["note-4"],
    createdAt: new Date("2025-03-01T12:00:00Z"),
    updatedAt: new Date("2025-03-01T14:00:00Z"),
  },
  {
    id: "note-5",
    title: "Заметки по TypeScript 📝",
    content: [
      "## Полезные паттерны",
      "",
      "**Discriminated Unions** — мощный инструмент:",
      "",
      "```typescript",
      "type Result<T> =",
      '  | { status: "ok"; data: T }',
      '  | { status: "error"; message: string };',
      "```",
      "",
      "### Utility Types",
      "",
      "- `Partial<T>` — все поля *опциональны*",
      "- `Required<T>` — все поля **обязательны**",
      "- `Pick<T, K>` — выбрать подмножество",
      "- `Omit<T, K>` — исключить поля",
      "",
      "Документация: https://www.typescriptlang.org/docs/ 🔗",
    ].join("\n"),
    tags: [tags[0], tags[2]],
    attachments: [],
    createdAt: new Date("2025-03-10T18:00:00Z"),
    updatedAt: new Date("2025-03-12T11:00:00Z"),
  },
];

/* ---------- Реализация ---------- */

/** In-memory реализация репозитория заметок */
export class InMemoryNotesRepository implements INotesRepository {
  private readonly notes: Note[] = [...seedNotes];

  async getById(id: string): Promise<Note | undefined> {
    return this.notes.find((note) => note.id === id);
  }

  async list(filter?: NotesListFilter): Promise<Note[]> {
    let result = [...this.notes];

    if (filter?.tagIds && filter.tagIds.length > 0) {
      result = result.filter((note) =>
        note.tags.some((tag) => filter.tagIds!.includes(tag.id))
      );
    }

    if (filter?.search) {
      const query = filter.search.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    if (filter?.dateFrom) {
      const from = filter.dateFrom.getTime();
      result = result.filter((note) => note.createdAt.getTime() >= from);
    }

    if (filter?.dateTo) {
      const to = filter.dateTo.getTime();
      result = result.filter((note) => note.createdAt.getTime() <= to);
    }

    return result;
  }

  async search(query: string): Promise<Note[]> {
    return this.list({ search: query });
  }
}

/** Singleton-экземпляр репозитория заметок */
export const notesRepository: INotesRepository = new InMemoryNotesRepository();
