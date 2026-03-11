import type { Note } from "@/types/note";

const MAX_CONTENT_LENGTH = 150;

interface NoteCardProps {
  note: Note;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_LENGTH) {
    return content;
  }
  return content.slice(0, MAX_CONTENT_LENGTH) + "…";
}

export function NoteCard({ note }: NoteCardProps): React.JSX.Element {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        {note.title}
      </h2>
      <p className="mb-3 text-gray-600">{truncateContent(note.content)}</p>
      <time
        dateTime={note.updatedAt}
        className="text-sm text-gray-400"
      >
        {formatDate(note.updatedAt)}
      </time>
    </article>
  );
}
