import { describe, it, expect } from 'vitest';
import { square, cube, isEven, factorial } from './math.js';

describe('Math Functions', () => {
  describe('square', () => {
    it('should return the square of a number', () => {
      expect(square(4)).toBe(16);
      expect(square(-3)).toBe(9);
      expect(square(0)).toBe(0);
    });
  });

  describe('cube', () => {
    it('should return the cube of a number', () => {
      expect(cube(3)).toBe(27);
      expect(cube(-2)).toBe(-8);
      expect(cube(0)).toBe(0);
    });
  });

  describe('isEven', () => {
    it('should return true for even numbers', () => {
      expect(isEven(2)).toBe(true);
      expect(isEven(0)).toBe(true);
      expect(isEven(-4)).toBe(true);
    });

    it('should return false for odd numbers', () => {
      expect(isEven(1)).toBe(false);
      expect(isEven(3)).toBe(false);
      expect(isEven(-1)).toBe(false);
    });
  });

  describe('factorial', () => {
    it('should calculate factorial correctly', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
    });

    it('should throw error for negative numbers', () => {
      expect(() => factorial(-1)).toThrow('Factorial of negative number is not defined');
    });
  });
});