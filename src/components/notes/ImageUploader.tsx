"use client";

import {
  type ReactNode,
  type DragEvent,
  type ChangeEvent,
  useState,
  useRef,
  useCallback,
  useId,
} from "react";
import type { NoteImage } from "@/types/note-image";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface ImageUploaderProps {
  noteId?: string;
  existingImages: NoteImage[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
  isUploading?: boolean;
}

export default function ImageUploader({
  existingImages,
  onUpload,
  onDelete,
  isUploading = false,
}: ImageUploaderProps): ReactNode {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  const totalCount = existingImages.length + pendingFiles.length;
  const canAddMore = totalCount < MAX_IMAGES;

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error: string | null } => {
      const remaining = MAX_IMAGES - existingImages.length - pendingFiles.length;
      if (remaining <= 0) {
        return { valid: [], error: `Maximum ${MAX_IMAGES} images per note` };
      }

      const selected = files.slice(0, remaining);
      for (const file of selected) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return {
            valid: [],
            error: `Invalid file type: ${file.name}. Only JPEG and PNG are allowed`,
          };
        }
        if (file.size > MAX_FILE_SIZE) {
          return {
            valid: [],
            error: `File too large: ${file.name}. Maximum size is 5MB`,
          };
        }
      }

      return { valid: selected, error: null };
    },
    [existingImages.length, pendingFiles.length],
  );

  const handleFiles = useCallback(
    (files: File[]): void => {
      setError(null);
      const { valid, error: validationError } = validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (valid.length === 0) return;
      setPendingFiles((prev) => [...prev, ...valid]);
    },
    [validateFiles],
  );

  const handleDrag = useCallback((e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      handleFiles(files);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [handleFiles],
  );

  const removePending = useCallback((index: number): void => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadPending = useCallback(async (): Promise<void> => {
    if (pendingFiles.length === 0) return;
    try {
      await onUpload(pendingFiles);
      setPendingFiles([]);
    } catch {
      setError("Failed to upload images");
    }
  }, [pendingFiles, onUpload]);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">
        Images ({existingImages.length}/{MAX_IMAGES})
      </label>

      {existingImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingImages.map((image) => (
            <div key={image.id} className="group relative">
              <img
                src={image.path}
                alt={`Attachment ${image.filename}`}
                className="h-20 w-20 rounded-md border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => onDelete(image.id)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove image ${image.filename}`}
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {pendingFiles.map((file, index) => (
              <div key={`pending-${index}`} className="group relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Pending upload ${file.name}`}
                  className="h-20 w-20 rounded-md border-2 border-dashed border-blue-300 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePending(index)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove pending image ${file.name}`}
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUploadPending}
            disabled={isUploading}
            className="self-start rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : `Upload ${pendingFiles.length} image${pendingFiles.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {canAddMore && (
        <div
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label="Drop images here or click to select"
          aria-describedby={error ? errorId : undefined}
        >
          <svg
            className="mb-1 h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">
            Drop images here or click to select
          </p>
          <p className="text-xs text-gray-400">JPEG, PNG up to 5MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleChange}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      )}

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
