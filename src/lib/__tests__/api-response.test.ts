import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, paginatedResponse } from '../api-response';

describe('api-response utilities', () => {
  describe('successResponse', () => {
    it('returns JSON response with data', async () => {
      const response = successResponse({ id: '1', name: 'test' });
      const body = await response.json();
      expect(body.data).toEqual({ id: '1', name: 'test' });
      expect(response.status).toBe(200);
    });

    it('allows custom status code', async () => {
      const response = successResponse({ created: true }, 201);
      expect(response.status).toBe(201);
    });
  });

  describe('errorResponse', () => {
    it('returns JSON response with error message', async () => {
      const response = errorResponse('Not found', 404);
      const body = await response.json();
      expect(body.error).toBe('Not found');
      expect(response.status).toBe(404);
    });
  });

  describe('paginatedResponse', () => {
    it('returns JSON response with pagination data', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      const response = paginatedResponse(items, 10, 1, 20);
      const body = await response.json();
      expect(body.data).toEqual(items);
      expect(body.total).toBe(10);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(20);
    });
  });
});
