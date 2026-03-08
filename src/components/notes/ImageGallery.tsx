"use client";

import { type ReactNode, useState } from "react";
import type { NoteImage } from "@/types/note-image";
import ImageLightbox from "./ImageLightbox";

interface ImageGalleryProps {
  images: NoteImage[];
}

export default function ImageGallery({
  images,
}: ImageGalleryProps): ReactNode {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <section aria-label="Image gallery" className="mt-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative overflow-hidden rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`View image ${image.filename}`}
            >
              <img
                src={image.path}
                alt={`Attachment ${image.filename}`}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </section>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
