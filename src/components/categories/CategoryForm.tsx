"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface CategoryFormProps {
  initialName?: string;
  initialColor?: string;
  isLoading?: boolean;
  onSubmit: (name: string, color: string) => void;
  submitLabel?: string;
}

export default function CategoryForm({
  initialName = "",
  initialColor = "#6B7280",
  isLoading = false,
  onSubmit,
  submitLabel = "Save",
}: CategoryFormProps): ReactNode {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(name.trim(), color);
    if (!initialName) {
      setName("");
      setColor("#6B7280");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <Input
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="color-input"
          className="block text-sm font-medium text-gray-700"
        >
          Color
        </label>
        <input
          id="color-input"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-gray-300"
        />
      </div>
      <Button type="submit" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
