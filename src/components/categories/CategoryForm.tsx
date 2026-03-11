"use client";

import { type ReactNode, type FormEvent, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validation";
import { ZodError } from "zod";

interface CategoryFormProps {
  initialName?: string;
  initialColor?: string;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const DEFAULT_COLORS = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
  "#14B8A6",
];

export default function CategoryForm({
  initialName = "",
  initialColor = "#3B82F6",
  onSubmit,
  onCancel,
  isEditing = false,
}: CategoryFormProps): ReactNode {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    try {
      const schema = isEditing ? updateCategorySchema : createCategorySchema;
      schema.parse({ name, color });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of err.issues) {
          const path = issue.path.join(".");
          fieldErrors[path] = issue.message;
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ form: "Validation error" });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, color });
    } catch {
      setErrors({ form: "Failed to save category" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter category name"
        error={errors.name}
        maxLength={50}
        required
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="category-color"
          className="text-sm font-medium text-gray-700"
        >
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            id="category-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded border border-gray-300"
            aria-invalid={errors.color ? "true" : undefined}
            aria-describedby={errors.color ? "category-color-error" : undefined}
          />
          <div className="flex flex-wrap gap-1">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${color === c ? "border-gray-900" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>
        {errors.color && (
          <p
            id="category-color-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {errors.color}
          </p>
        )}
      </div>

      {errors.form && (
        <p className="text-sm text-red-600" role="alert">
          {errors.form}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Update" : "Create"} Category
        </Button>
      </div>
    </form>
  );
}
