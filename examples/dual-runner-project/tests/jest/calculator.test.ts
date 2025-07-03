/**
 * Jest tests for Calculator and MathUtils
 */

import { Calculator, MathUtils } from '../../src/calculator'

describe('Calculator', () => {
  let calculator: Calculator

  beforeEach(() => {
    calculator = new Calculator()
  })

  describe('basic operations', () => {
    test('should add two numbers correctly', () => {
      expect(calculator.add(5, 3)).toBe(8)
      expect(calculator.add(-1, 1)).toBe(0)
      expect(calculator.add(0, 0)).toBe(0)
    })

    test('should subtract two numbers correctly', () => {
      expect(calculator.subtract(5, 3)).toBe(2)
      expect(calculator.subtract(1, 1)).toBe(0)
      expect(calculator.subtract(-1, 1)).toBe(-2)
    })

    test('should multiply two numbers correctly', () => {
      expect(calculator.multiply(5, 3)).toBe(15)
      expect(calculator.multiply(-2, 3)).toBe(-6)
      expect(calculator.multiply(0, 5)).toBe(0)
    })

    test('should divide two numbers correctly', () => {
      expect(calculator.divide(6, 3)).toBe(2)
      expect(calculator.divide(-6, 3)).toBe(-2)
      expect(calculator.divide(7, 2)).toBe(3.5)
    })

    test('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(5, 0)).toThrow('Division by zero is not allowed')
    })
  })

  describe('percentage calculation', () => {
    test('should calculate percentage correctly', () => {
      expect(calculator.percentage(25, 100)).toBe(25)
      expect(calculator.percentage(1, 4)).toBe(25)
      expect(calculator.percentage(0, 100)).toBe(0)
    })

    test('should throw error when total is zero', () => {
      expect(() => calculator.percentage(5, 0)).toThrow('Total cannot be zero')
    })
  })
})

describe('MathUtils', () => {
  describe('isEven', () => {
    test('should correctly identify even numbers', () => {
      expect(MathUtils.isEven(2)).toBe(true)
      expect(MathUtils.isEven(4)).toBe(true)
      expect(MathUtils.isEven(0)).toBe(true)
      expect(MathUtils.isEven(-2)).toBe(true)
    })

    test('should correctly identify odd numbers', () => {
      expect(MathUtils.isEven(1)).toBe(false)
      expect(MathUtils.isEven(3)).toBe(false)
      expect(MathUtils.isEven(-1)).toBe(false)
    })
  })

  describe('isPrime', () => {
    test('should correctly identify prime numbers', () => {
      expect(MathUtils.isPrime(2)).toBe(true)
      expect(MathUtils.isPrime(3)).toBe(true)
      expect(MathUtils.isPrime(5)).toBe(true)
      expect(MathUtils.isPrime(7)).toBe(true)
      expect(MathUtils.isPrime(11)).toBe(true)
    })

    test('should correctly identify non-prime numbers', () => {
      expect(MathUtils.isPrime(1)).toBe(false)
      expect(MathUtils.isPrime(4)).toBe(false)
      expect(MathUtils.isPrime(6)).toBe(false)
      expect(MathUtils.isPrime(8)).toBe(false)
      expect(MathUtils.isPrime(9)).toBe(false)
    })

    test('should handle edge cases', () => {
      expect(MathUtils.isPrime(0)).toBe(false)
      expect(MathUtils.isPrime(-1)).toBe(false)
    })
  })

  describe('factorial', () => {
    test('should calculate factorial correctly', () => {
      expect(MathUtils.factorial(0)).toBe(1)
      expect(MathUtils.factorial(1)).toBe(1)
      expect(MathUtils.factorial(3)).toBe(6)
      expect(MathUtils.factorial(4)).toBe(24)
      expect(MathUtils.factorial(5)).toBe(120)
    })

    test('should throw error for negative numbers', () => {
      expect(() => MathUtils.factorial(-1)).toThrow('Factorial is not defined for negative numbers')
    })
  })
})