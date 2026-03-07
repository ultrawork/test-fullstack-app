"use client";

import { type ReactNode, useState, useMemo } from "react";
import type { Tag } from "@/types/tag";
import TagBadge from "./TagBadge";
import { useTagsStore } from "@/stores/tags-store";

interface TagSelectorProps {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreate?: (name: string) => void | Promise<void>;
}

export default function TagSelector({
  tags,
  selectedIds,
  onChange,
  onCreate,
}: TagSelectorProps): ReactNode {
  const [search, setSearch] = useState("");
  const { error } = useTagsStore();

  const filteredTags = useMemo((): Tag[] => {
    if (!search.trim()) return tags;
    const lower = search.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(lower));
  }, [tags, search]);

  const handleToggle = (tagId: string): void => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  const handleCreate = async (): Promise<void> => {
    if (onCreate && search.trim()) {
      try {
        await onCreate(search.trim());
        setSearch("");
      } catch {
        // Error is handled by the store
      }
    }
  };

  const canCreate =
    onCreate &&
    search.trim() &&
    !tags.some((t) => t.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-gray-700">Tags</legend>

      <div className="flex flex-wrap gap-1">
        {selectedIds.map((id) => {
          const tag = tags.find((t) => t.id === id);
          if (!tag) return null;
          return (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              size="sm"
              onRemove={() => handleToggle(tag.id)}
            />
          );
        })}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search or create tags..."
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Search tags"
      />

      <ul className="max-h-40 overflow-y-auto rounded-md border border-gray-200">
        {filteredTags.map((tag) => (
          <li key={tag.id}>
            <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedIds.includes(tag.id)}
                onChange={() => handleToggle(tag.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <TagBadge name={tag.name} color={tag.color} size="sm" />
            </label>
          </li>
        ))}
        {filteredTags.length === 0 && !canCreate && (
          <li className="px-3 py-2 text-sm text-gray-500">No tags found</li>
        )}
      </ul>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {canCreate && (
        <button
          type="button"
          onClick={handleCreate}
          className="self-start rounded-md bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Create &quot;{search.trim()}&quot;
        </button>
      )}
    </fieldset>
  );
}
