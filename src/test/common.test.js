import { describe, it, expect } from 'vitest';
import { ensureHttps } from '../utils/common';

describe('Common Utils', () => {
  describe('ensureHttps', () => {
    it('adds https:// to URLs without protocol', () => {
      expect(ensureHttps('example.com')).toBe('https://example.com');
      expect(ensureHttps('www.example.com')).toBe('https://www.example.com');
      expect(ensureHttps('linkedin.com/in/johndoe')).toBe('https://linkedin.com/in/johndoe');
    });

    it('preserves existing http:// URLs', () => {
      expect(ensureHttps('http://example.com')).toBe('http://example.com');
      expect(ensureHttps('http://www.example.com')).toBe('http://www.example.com');
    });

    it('preserves existing https:// URLs', () => {
      expect(ensureHttps('https://example.com')).toBe('https://example.com');
      expect(ensureHttps('https://www.example.com')).toBe('https://www.example.com');
    });

    it('handles empty strings', () => {
      expect(ensureHttps('')).toBe('');
    });

    it('handles null and undefined', () => {
      expect(ensureHttps(null)).toBe('');
      expect(ensureHttps(undefined)).toBe('');
    });

    it('handles URLs with paths and query parameters', () => {
      expect(ensureHttps('example.com/path')).toBe('https://example.com/path');
      expect(ensureHttps('example.com/path?param=value')).toBe('https://example.com/path?param=value');
      expect(ensureHttps('example.com/path#fragment')).toBe('https://example.com/path#fragment');
    });

    it('handles complex URLs', () => {
      expect(ensureHttps('api.github.com/users/johndoe/repos')).toBe('https://api.github.com/users/johndoe/repos');
      expect(ensureHttps('docs.example.com/api/v1/endpoint?key=value&type=json')).toBe('https://docs.example.com/api/v1/endpoint?key=value&type=json');
    });
  });
}); 