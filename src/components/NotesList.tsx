import type { Note } from "@/types/note";

type NotesListProps = {
  notes: Note[];
};

export default function NotesList({ notes }: NotesListProps): JSX.Element {
  return (
    <section aria-label="Notes list" className="w-full">
      <ul className="grid gap-4">
        {notes.map((note) => (
          <li key={note.id}>
            <article className="rounded-lg border border-gray-200 p-4 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>
              <p className="line-clamp-2 text-sm text-gray-500">{note.content}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
