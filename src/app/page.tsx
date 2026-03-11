import { NotesList } from "@/components/notes/NotesList";

export default function HomePage(): React.ReactElement {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">Notes App</h1>
      </header>
      <NotesList />
    </main>
  );
}
