"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useNotesStore } from "@/stores/notes-store";
import { useTagsStore } from "@/stores/tags-store";
import NoteList from "./NoteList";
import NoteForm from "./NoteForm";
import TagFilter from "@/components/tags/TagFilter";
import TagManagerModal from "@/components/tags/TagManagerModal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { NoteDTO } from "@/types";

export default function NotesPage(): React.ReactElement {
  const { user, logout } = useAuthStore();
  const {
    notes,
    isLoading,
    fetchNotes,
    createNote,
    updateNote,
    updateNoteTags,
    deleteNote,
    selectedTagIds,
    toggleTagFilter,
  } = useNotesStore();
  const { tags, fetchTags } = useTagsStore();

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteDTO | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, selectedTagIds]);

  const handleCreateNote = async (data: {
    title: string;
    content: string;
    tagIds: string[];
  }): Promise<void> => {
    await createNote(data);
    setShowNoteForm(false);
  };

  const handleUpdateNote = async (data: {
    title: string;
    content: string;
    tagIds: string[];
  }): Promise<void> => {
    if (!editingNote) return;
    await updateNote(editingNote.id, {
      title: data.title,
      content: data.content,
    });
    await updateNoteTags(editingNote.id, data.tagIds);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    await deleteNote(noteId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Notes App</h1>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowTagManager(true)}>
              Manage Tags
            </Button>
            <Button variant="secondary" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TagFilter
            tags={tags}
            selectedTagIds={selectedTagIds}
            onToggle={(tagId) => {
              toggleTagFilter(tagId);
            }}
          />
          <Button onClick={() => setShowNoteForm(true)}>
            + New Note
          </Button>
        </div>

        <NoteList
          notes={notes}
          isLoading={isLoading}
          onEdit={setEditingNote}
          onDelete={handleDeleteNote}
        />
      </main>

      <Modal
        isOpen={showNoteForm}
        onClose={() => setShowNoteForm(false)}
        title="Create Note"
      >
        <NoteForm
          onSubmit={handleCreateNote}
          onCancel={() => setShowNoteForm(false)}
        />
      </Modal>

      {editingNote && (
        <Modal
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          title="Edit Note"
        >
          <NoteForm
            note={editingNote}
            onSubmit={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
          />
        </Modal>
      )}

      <TagManagerModal
        isOpen={showTagManager}
        onClose={() => {
          setShowTagManager(false);
          fetchTags();
        }}
      />
    </div>
  );
}
