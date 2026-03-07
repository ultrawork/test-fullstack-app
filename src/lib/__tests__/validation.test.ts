import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  createCategorySchema,
  updateCategorySchema,
  notesFilterSchema,
} from '../validation';

describe('validation schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid input', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'invalid',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: '1234567',
        confirmPassword: '1234567',
      });
      expect(result.success).toBe(false);
    });

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password longer than 72 chars', () => {
      const longPass = 'a'.repeat(73);
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: longPass,
        confirmPassword: longPass,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid input', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createNoteSchema', () => {
    it('accepts valid input', () => {
      const result = createNoteSchema.safeParse({
        title: 'My Note',
        content: 'Some content',
      });
      expect(result.success).toBe(true);
    });

    it('accepts input with categoryId', () => {
      const result = createNoteSchema.safeParse({
        title: 'My Note',
        content: 'Some content',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = createNoteSchema.safeParse({
        title: '',
        content: 'Some content',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty content', () => {
      const result = createNoteSchema.safeParse({
        title: 'Title',
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects title longer than 500 chars', () => {
      const result = createNoteSchema.safeParse({
        title: 'a'.repeat(501),
        content: 'Some content',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateNoteSchema', () => {
    it('accepts partial update', () => {
      const result = updateNoteSchema.safeParse({ title: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('accepts nullable categoryId', () => {
      const result = updateNoteSchema.safeParse({ categoryId: null });
      expect(result.success).toBe(true);
    });

    it('accepts empty object', () => {
      const result = updateNoteSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('createCategorySchema', () => {
    it('accepts valid input', () => {
      const result = createCategorySchema.safeParse({ name: 'Work' });
      expect(result.success).toBe(true);
    });

    it('accepts input with color', () => {
      const result = createCategorySchema.safeParse({
        name: 'Work',
        color: '#ff5733',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid color', () => {
      const result = createCategorySchema.safeParse({
        name: 'Work',
        color: 'red',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = createCategorySchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateCategorySchema', () => {
    it('accepts partial update', () => {
      const result = updateCategorySchema.safeParse({ name: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('accepts empty object', () => {
      const result = updateCategorySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('notesFilterSchema', () => {
    it('accepts empty object with defaults', () => {
      const result = notesFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('accepts search parameter', () => {
      const result = notesFilterSchema.safeParse({ search: 'hello' });
      expect(result.success).toBe(true);
    });

    it('coerces page to number', () => {
      const result = notesFilterSchema.safeParse({ page: '2' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
      }
    });

    it('rejects page less than 1', () => {
      const result = notesFilterSchema.safeParse({ page: '0' });
      expect(result.success).toBe(false);
    });

    it('rejects limit greater than 100', () => {
      const result = notesFilterSchema.safeParse({ limit: '101' });
      expect(result.success).toBe(false);
    });
  });
});
