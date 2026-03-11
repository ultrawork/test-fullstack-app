"use client";

import { type ReactNode, useEffect } from "react";
import NoteCard from "./NoteCard";
import TagFilter from "@/components/tags/TagFilter";
import CategoryFilter from "@/components/categories/CategoryFilter";
import SearchBar from "./SearchBar";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { useNotesStore } from "@/stores/notes-store";
import { useTagsStore } from "@/stores/tags-store";
import { useCategoriesStore } from "@/stores/categories-store";
import Link from "next/link";

export default function NotesList(): ReactNode {
  const {
    notes,
    isLoading,
    search,
    filterTagIds,
    filterCategoryId,
    fetchNotes,
    setSearch,
    setFilterTagIds,
    setFilterCategoryId,
    resetAllFilters,
  } = useNotesStore();
  const { tags, fetchTags } = useTagsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  useEffect(() => {
    void fetchTags();
    void fetchCategories();
  }, [fetchTags, fetchCategories]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes, search, filterTagIds, filterCategoryId]);

  if (isLoading && notes.length === 0) {
    return <Spinner size="lg" />;
  }

  return (
    <section className="flex flex-col gap-4">
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter
        categories={categories}
        selectedId={filterCategoryId}
        onChange={setFilterCategoryId}
        onResetAll={resetAllFilters}
      />
      <TagFilter
        tags={tags}
        selectedIds={filterTagIds}
        onChange={setFilterTagIds}
      />
      {notes.length === 0 ? (
        <EmptyState
          title="No notes found"
          description={
            search || filterTagIds.length > 0 || filterCategoryId
              ? "Try adjusting your search or filters"
              : "Create your first note to get started"
          }
          action={
            !search && filterTagIds.length === 0 && !filterCategoryId ? (
              <Link
                href="/dashboard/notes/new"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Note
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
