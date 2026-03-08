"use client";

import type { ReactNode } from "react";
import type { NoteImage } from "@/types/note-image";

interface ImageThumbnailProps {
  images: NoteImage[];
  maxVisible?: number;
}

export default function ImageThumbnail({
  images,
  maxVisible = 3,
}: ImageThumbnailProps): ReactNode {
  if (images.length === 0) return null;

  const visible = images.slice(0, maxVisible);
  const remaining = images.length - maxVisible;

  return (
    <div className="mt-2 flex gap-1" role="group" aria-label="Image attachments">
      {visible.map((image) => (
        <img
          key={image.id}
          src={image.path}
          alt={`Attachment ${image.filename}`}
          className="h-10 w-10 rounded border border-gray-200 object-cover"
        />
      ))}
      {remaining > 0 && (
        <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-gray-100 text-xs text-gray-500">
          +{remaining}
        </span>
      )}
    </div>
  );
}
