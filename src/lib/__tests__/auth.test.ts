import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} from '../auth';

describe('auth utilities', () => {
  describe('hashPassword', () => {
    it('hashes a password', async () => {
      const hash = await hashPassword('testpassword');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('testpassword');
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    });

    it('produces different hashes for same password', async () => {
      const hash1 = await hashPassword('testpassword');
      const hash2 = await hashPassword('testpassword');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const hash = await hashPassword('testpassword');
      const result = await verifyPassword('testpassword', hash);
      expect(result).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      const hash = await hashPassword('testpassword');
      const result = await verifyPassword('wrongpassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('generates a JWT string', () => {
      const token = generateAccessToken({ sub: 'user-1', email: 'test@test.com' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('generateRefreshToken', () => {
    it('generates a JWT string', () => {
      const token = generateRefreshToken({ sub: 'user-1' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('verifies a valid access token', () => {
      const token = generateAccessToken({ sub: 'user-1', email: 'test@test.com' });
      const payload = verifyAccessToken(token);
      expect(payload.sub).toBe('user-1');
      expect(payload.email).toBe('test@test.com');
    });

    it('throws for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('verifies a valid refresh token', () => {
      const token = generateRefreshToken({ sub: 'user-1' });
      const payload = verifyRefreshToken(token);
      expect(payload.sub).toBe('user-1');
    });

    it('throws for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('hashToken', () => {
    it('produces a consistent hash', () => {
      const hash1 = hashToken('test-token');
      const hash2 = hashToken('test-token');
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different tokens', () => {
      const hash1 = hashToken('token-1');
      const hash2 = hashToken('token-2');
      expect(hash1).not.toBe(hash2);
    });

    it('returns a hex string', () => {
      const hash = hashToken('test-token');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
