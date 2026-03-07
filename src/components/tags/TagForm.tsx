"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ColorPicker from "@/components/ui/ColorPicker";
import type { TagDTO } from "@/types";

interface TagFormProps {
  tag?: TagDTO;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
  onCancel: () => void;
}

export default function TagForm({
  tag,
  onSubmit,
  onCancel,
}: TagFormProps): React.ReactElement {
  const [name, setName] = useState(tag?.name ?? "");
  const [color, setColor] = useState(tag?.color ?? "#3B82F6");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tag name is required");
      return;
    }
    if (name.length > 50) {
      setError("Tag name must be 50 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), color });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Tag name"
        name="tag-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter tag name"
        maxLength={50}
        error={error}
        required
      />
      <ColorPicker value={color} onChange={setColor} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : tag ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
