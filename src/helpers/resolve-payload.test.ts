import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolvePayload } from './resolve-payload'; // Adjust the path as needed

// Mock the module dependencies
vi.mock('./read-file', () => ({
  readFileFromPath: () => {
    return Buffer.from("Hello JS");
  },
}));

vi.mock('./build-ts', () => ({
  buildTS: () => {
    return `console.log("Hello, world TS!");`;
  },
}));

describe('resolvePayload function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly resolve payload for a TypeScript file', async () => {
    const path = '/some/path';
    const filename = 'example.ts';

    const resultBuff = resolvePayload(path, filename);

    const result = resultBuff.toString();
    expect(result).toBe('console.log("Hello, world TS!");');
  });

  it('should correctly resolve payload for a non-TypeScript file', async () => {
    const path = '/some/path';
    const filename = 'example.js';

    const resultBuff = resolvePayload(path, filename);

    const result = resultBuff.toString();
    expect(result).toBe('Hello JS');
  });
});
