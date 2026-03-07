"use client";

import { type ReactNode, useEffect } from "react";
import NoteCard from "./NoteCard";
import TagFilter from "@/components/tags/TagFilter";
import SearchBar from "./SearchBar";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { useNotesStore } from "@/stores/notes-store";
import { useTagsStore } from "@/stores/tags-store";
import Link from "next/link";

export default function NotesList(): ReactNode {
  const {
    notes,
    isLoading,
    search,
    filterTagIds,
    fetchNotes,
    setSearch,
    setFilterTagIds,
  } = useNotesStore();
  const { tags, fetchTags } = useTagsStore();

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes, search, filterTagIds]);

  if (isLoading && notes.length === 0) {
    return <Spinner size="lg" />;
  }

  return (
    <section className="flex flex-col gap-4">
      <SearchBar value={search} onChange={setSearch} />
      <TagFilter
        tags={tags}
        selectedIds={filterTagIds}
        onChange={setFilterTagIds}
      />
      {notes.length === 0 ? (
        <EmptyState
          title="No notes found"
          description={
            search || filterTagIds.length > 0
              ? "Try adjusting your search or filters"
              : "Create your first note to get started"
          }
          action={
            !search && filterTagIds.length === 0 ? (
              <Link href="/dashboard/notes/new">
                <Button>Create Note</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </section>
  );
}
