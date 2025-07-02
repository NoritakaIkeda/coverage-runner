/**
 * A simple calculator module for demonstration
 */

export class Calculator {
  /**
   * Add two numbers
   */
  add(a: number, b: number): number {
    return a + b
  }

  /**
   * Subtract two numbers
   */
  subtract(a: number, b: number): number {
    return a - b
  }

  /**
   * Multiply two numbers
   */
  multiply(a: number, b: number): number {
    return a * b
  }

  /**
   * Divide two numbers
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Division by zero is not allowed')
    }
    return a / b
  }

  /**
   * Calculate percentage
   */
  percentage(value: number, total: number): number {
    if (total === 0) {
      throw new Error('Total cannot be zero')
    }
    return (value / total) * 100
  }
}

/**
 * Utility functions
 */
export const MathUtils = {
  /**
   * Check if a number is even
   */
  isEven(num: number): boolean {
    return num % 2 === 0
  },

  /**
   * Check if a number is prime
   */
  isPrime(num: number): boolean {
    if (num < 2) return false
    if (num === 2) return true
    if (num % 2 === 0) return false
    
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false
    }
    return true
  },

  /**
   * Calculate factorial
   */
  factorial(n: number): number {
    if (n < 0) throw new Error('Factorial is not defined for negative numbers')
    if (n === 0 || n === 1) return 1
    return n * this.factorial(n - 1)
  }
}