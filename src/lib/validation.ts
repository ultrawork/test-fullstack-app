import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(50000, 'Content too long'),
  categoryId: z.string().uuid().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').max(50000, 'Content too long').optional(),
  categoryId: z.string().uuid().nullable().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .nullable()
    .optional(),
});

export const notesFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
