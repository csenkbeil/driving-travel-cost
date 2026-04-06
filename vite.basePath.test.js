import { describe, expect, it } from 'vitest';
import { normalizeBasePath } from './vite.basePath.js';

describe('normalizeBasePath', () => {
  it('defaults to the root path when the base path is missing', () => {
    expect(normalizeBasePath()).toBe('/');
    expect(normalizeBasePath('')).toBe('/');
    expect(normalizeBasePath('   ')).toBe('/');
  });

  it('preserves the root path', () => {
    expect(normalizeBasePath('/')).toBe('/');
  });

  it('adds a trailing slash for subpaths', () => {
    expect(normalizeBasePath('/driving-travel-cost')).toBe('/driving-travel-cost/');
  });

  it('preserves an already normalized subpath', () => {
    expect(normalizeBasePath('/driving-travel-cost/')).toBe('/driving-travel-cost/');
  });

  it('adds a leading slash when needed', () => {
    expect(normalizeBasePath('driving-travel-cost')).toBe('/driving-travel-cost/');
  });
});
