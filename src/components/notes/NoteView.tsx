import type { Note } from "@/types/note";
import ExportButton from "./ExportButton";

interface NoteViewProps {
  note: Note;
}

export default function NoteView({ note }: NoteViewProps): React.ReactElement {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6">
      <header className="mb-4">
        <h2 className="text-2xl font-bold">{note.title}</h2>
        <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
          <time dateTime={note.createdAt}>Created: {note.createdAt}</time>
          <time dateTime={note.updatedAt}>Updated: {note.updatedAt}</time>
        </div>
        {note.category && (
          <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
            {note.category}
          </span>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="prose mb-6 whitespace-pre-wrap">
        {note.content}
      </section>

      <footer className="flex gap-2">
        <ExportButton note={note} />
      </footer>
    </article>
  );
}
