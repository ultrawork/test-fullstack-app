import { describe, it, expect } from 'vitest';
import { notesFilterSchema } from '@/lib/validation';
import { buildOrderBy } from '@/lib/notes-utils';

describe('notes sort API', () => {
  describe('notesFilterSchema sort params', () => {
    it('defaults sortBy to updatedAt', () => {
      const result = notesFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortBy).toBe('updatedAt');
      }
    });

    it('defaults sortOrder to desc', () => {
      const result = notesFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('accepts sortBy=title', () => {
      const result = notesFilterSchema.safeParse({ sortBy: 'title' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortBy).toBe('title');
      }
    });

    it('accepts sortBy=createdAt', () => {
      const result = notesFilterSchema.safeParse({ sortBy: 'createdAt' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortBy).toBe('createdAt');
      }
    });

    it('accepts sortBy=updatedAt', () => {
      const result = notesFilterSchema.safeParse({ sortBy: 'updatedAt' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortBy).toBe('updatedAt');
      }
    });

    it('accepts sortOrder=asc', () => {
      const result = notesFilterSchema.safeParse({ sortOrder: 'asc' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortOrder).toBe('asc');
      }
    });

    it('rejects invalid sortBy value', () => {
      const result = notesFilterSchema.safeParse({ sortBy: 'random' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid sortOrder value', () => {
      const result = notesFilterSchema.safeParse({ sortOrder: 'random' });
      expect(result.success).toBe(false);
    });

    it('works with search and sort combined', () => {
      const result = notesFilterSchema.safeParse({
        search: 'test',
        sortBy: 'title',
        sortOrder: 'asc',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe('test');
        expect(result.data.sortBy).toBe('title');
        expect(result.data.sortOrder).toBe('asc');
      }
    });
  });

  describe('orderBy construction', () => {
    it('creates single orderBy for updatedAt desc', () => {
      const orderBy = buildOrderBy('updatedAt', 'desc');
      expect(orderBy).toEqual([{ updatedAt: 'desc' }]);
    });

    it('creates single orderBy for createdAt desc', () => {
      const orderBy = buildOrderBy('createdAt', 'desc');
      expect(orderBy).toEqual([{ createdAt: 'desc' }]);
    });

    it('creates single orderBy for createdAt asc', () => {
      const orderBy = buildOrderBy('createdAt', 'asc');
      expect(orderBy).toEqual([{ createdAt: 'asc' }]);
    });

    it('adds secondary sort for title', () => {
      const orderBy = buildOrderBy('title', 'asc');
      expect(orderBy).toEqual([{ title: 'asc' }, { createdAt: 'desc' }]);
    });

    it('adds secondary sort for title desc', () => {
      const orderBy = buildOrderBy('title', 'desc');
      expect(orderBy).toEqual([{ title: 'desc' }, { createdAt: 'desc' }]);
    });
  });
});
