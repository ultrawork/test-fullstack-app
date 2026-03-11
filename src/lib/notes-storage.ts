import type { Note } from "@/types/note";

const notes = new Map<string, Note>();

const seedNotes: Note[] = [
  {
    id: "1",
    title: "Добро пожаловать в Notes App",
    content:
      "Это ваше первое приветственное сообщение. Здесь вы можете хранить свои заметки и идеи.",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Список покупок",
    content: "Молоко, хлеб, яйца, масло, сыр, помидоры, огурцы",
    createdAt: "2025-01-16T12:30:00.000Z",
    updatedAt: "2025-01-16T14:00:00.000Z",
  },
  {
    id: "3",
    title: "Идеи для проекта",
    content:
      "Реализовать поиск заметок, добавить теги, создать систему категорий, интеграция с облаком",
    createdAt: "2025-01-17T09:15:00.000Z",
    updatedAt: "2025-01-17T09:15:00.000Z",
  },
  {
    id: "4",
    title: "Заметка о встрече",
    content:
      "Обсудить план на следующий квартал. Подготовить презентацию. Пригласить команду разработки.",
    createdAt: "2025-01-18T16:45:00.000Z",
    updatedAt: "2025-01-19T08:00:00.000Z",
  },
  {
    id: "5",
    title: "Рецепт пасты",
    content:
      "Спагетти 400г, томатный соус, чеснок 3 зубчика, базилик, пармезан. Варить пасту 8 минут.",
    createdAt: "2025-01-20T11:00:00.000Z",
    updatedAt: "2025-01-20T11:00:00.000Z",
  },
];

function ensureSeeded(): void {
  if (notes.size === 0) {
    for (const note of seedNotes) {
      notes.set(note.id, note);
    }
  }
}

export function getAllNotes(): Note[] {
  ensureSeeded();
  return Array.from(notes.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function searchNotes(query: string): Note[] {
  const allNotes = getAllNotes();

  if (!query.trim()) {
    return allNotes;
  }

  const lowerQuery = query.toLowerCase();

  return allNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery),
  );
}
