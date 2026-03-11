import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  content: z.string().min(1, "Content is required"),
  tagIds: z.array(z.string().cuid()).optional(),
  categoryId: z.string().cuid().optional().nullable(),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters")
    .optional(),
  content: z.string().min(1, "Content is required").optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  categoryId: z.string().cuid().optional().nullable(),
});

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be at most 50 characters")
    .trim(),
  color: z
    .string()
    .regex(hexColorRegex, "Color must be a valid hex color (e.g. #FF0000)"),
});

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be at most 50 characters")
    .trim()
    .optional(),
  color: z
    .string()
    .regex(hexColorRegex, "Color must be a valid hex color (e.g. #FF0000)")
    .optional(),
});

export const attachTagsSchema = z.object({
  tagIds: z.array(z.string().cuid()),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be at most 50 characters")
    .trim(),
  color: z
    .string()
    .regex(hexColorRegex, "Color must be a valid hex color (e.g. #FF0000)"),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be at most 50 characters")
    .trim()
    .optional(),
  color: z
    .string()
    .regex(hexColorRegex, "Color must be a valid hex color (e.g. #FF0000)")
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type AttachTagsInput = z.infer<typeof attachTagsSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
