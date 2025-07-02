/**
 * String utility functions for demonstration
 */

export class StringUtils {
  /**
   * Capitalize the first letter of a string
   */
  capitalize(str: string): string {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  /**
   * Reverse a string
   */
  reverse(str: string): string {
    return str.split('').reverse().join('')
  }

  /**
   * Check if a string is a palindrome
   */
  isPalindrome(str: string): boolean {
    const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '')
    return normalized === normalized.split('').reverse().join('')
  }

  /**
   * Count words in a string
   */
  wordCount(str: string): number {
    if (!str.trim()) return 0
    return str.trim().split(/\s+/).length
  }

  /**
   * Truncate string with ellipsis
   */
  truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength - 3) + '...'
  }
}

/**
 * Text processing utilities
 */
export const TextProcessor = {
  /**
   * Convert string to kebab-case
   */
  toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  },

  /**
   * Convert string to camelCase
   */
  toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^[A-Z]/, char => char.toLowerCase())
  },

  /**
   * Extract email addresses from text
   */
  extractEmails(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    return text.match(emailRegex) || []
  }
}