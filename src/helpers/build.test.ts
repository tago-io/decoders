import { describe, it, expect } from 'vitest';
import { buildTS } from './build-ts';

const cleanCode = (code: string): string => {
  return code.replace(/\s+/g, '');
};

describe('buildTS function', () => {
  it('should transform TypeScript code correctly', () => {
    const inputCode = `
      function add(a: number, b: number): number {
        return a + b;
      }
      console.log(add(1, 2));
    `;

    const expectedCode = `
      function add(a, b) {
        return a + b;
      }
      console.log(add(1, 2));
    `;

    const transformedCode = buildTS(inputCode);

    expect(cleanCode(transformedCode)).toBe(cleanCode(expectedCode));
  });

  it('should throw an error for invalid TypeScript code', () => {
    const invalidCode = `
      function add(a: number, b: number) {
        return new.Date(); // wrong code
      }
      console.log(add(1, 2));
    `;

    expect(() => buildTS(invalidCode)).toThrow();
  });
});
