/**
 * Vitest tests for StringUtils and TextProcessor
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { StringUtils, TextProcessor } from '../../src/stringUtils'

describe('StringUtils', () => {
  let stringUtils: StringUtils

  beforeEach(() => {
    stringUtils = new StringUtils()
  })

  describe('capitalize', () => {
    test('should capitalize first letter', () => {
      expect(stringUtils.capitalize('hello')).toBe('Hello')
      expect(stringUtils.capitalize('WORLD')).toBe('World')
      expect(stringUtils.capitalize('tEST')).toBe('Test')
    })

    test('should handle edge cases', () => {
      expect(stringUtils.capitalize('')).toBe('')
      expect(stringUtils.capitalize('a')).toBe('A')
      expect(stringUtils.capitalize('A')).toBe('A')
    })
  })

  describe('reverse', () => {
    test('should reverse strings correctly', () => {
      expect(stringUtils.reverse('hello')).toBe('olleh')
      expect(stringUtils.reverse('abc')).toBe('cba')
      expect(stringUtils.reverse('racecar')).toBe('racecar')
    })

    test('should handle edge cases', () => {
      expect(stringUtils.reverse('')).toBe('')
      expect(stringUtils.reverse('a')).toBe('a')
    })
  })

  describe('isPalindrome', () => {
    test('should identify palindromes correctly', () => {
      expect(stringUtils.isPalindrome('racecar')).toBe(true)
      expect(stringUtils.isPalindrome('A man a plan a canal Panama')).toBe(true)
      expect(stringUtils.isPalindrome('Madam')).toBe(true)
      expect(stringUtils.isPalindrome('12321')).toBe(true)
    })

    test('should identify non-palindromes correctly', () => {
      expect(stringUtils.isPalindrome('hello')).toBe(false)
      expect(stringUtils.isPalindrome('test')).toBe(false)
      expect(stringUtils.isPalindrome('12345')).toBe(false)
    })

    test('should handle edge cases', () => {
      expect(stringUtils.isPalindrome('')).toBe(true)
      expect(stringUtils.isPalindrome('a')).toBe(true)
    })
  })

  describe('wordCount', () => {
    test('should count words correctly', () => {
      expect(stringUtils.wordCount('hello world')).toBe(2)
      expect(stringUtils.wordCount('one two three four')).toBe(4)
      expect(stringUtils.wordCount('single')).toBe(1)
    })

    test('should handle multiple spaces', () => {
      expect(stringUtils.wordCount('hello    world')).toBe(2)
      expect(stringUtils.wordCount('  spaced   words  ')).toBe(2)
    })

    test('should handle edge cases', () => {
      expect(stringUtils.wordCount('')).toBe(0)
      expect(stringUtils.wordCount('   ')).toBe(0)
    })
  })

  describe('truncate', () => {
    test('should truncate long strings', () => {
      expect(stringUtils.truncate('hello world', 8)).toBe('hello...')
      expect(stringUtils.truncate('this is a long string', 10)).toBe('this is...')
    })

    test('should not truncate short strings', () => {
      expect(stringUtils.truncate('short', 10)).toBe('short')
      expect(stringUtils.truncate('exact', 5)).toBe('exact')
    })

    test('should handle edge cases', () => {
      expect(stringUtils.truncate('', 5)).toBe('')
      expect(stringUtils.truncate('abc', 3)).toBe('abc')
    })
  })
})

describe('TextProcessor', () => {
  describe('toKebabCase', () => {
    test('should convert to kebab-case', () => {
      expect(TextProcessor.toKebabCase('HelloWorld')).toBe('hello-world')
      expect(TextProcessor.toKebabCase('camelCase')).toBe('camel-case')
      expect(TextProcessor.toKebabCase('snake_case')).toBe('snake-case')
      expect(TextProcessor.toKebabCase('Space Separated')).toBe('space-separated')
    })

    test('should handle edge cases', () => {
      expect(TextProcessor.toKebabCase('')).toBe('')
      expect(TextProcessor.toKebabCase('single')).toBe('single')
    })
  })

  describe('toCamelCase', () => {
    test('should convert to camelCase', () => {
      expect(TextProcessor.toCamelCase('hello-world')).toBe('helloWorld')
      expect(TextProcessor.toCamelCase('snake_case')).toBe('snakeCase')
      expect(TextProcessor.toCamelCase('space separated')).toBe('spaceSeparated')
    })

    test('should handle edge cases', () => {
      expect(TextProcessor.toCamelCase('')).toBe('')
      expect(TextProcessor.toCamelCase('single')).toBe('single')
      expect(TextProcessor.toCamelCase('PascalCase')).toBe('pascalCase')
    })
  })

  describe('extractEmails', () => {
    test('should extract valid email addresses', () => {
      const text = 'Contact us at test@example.com or admin@site.org for help'
      expect(TextProcessor.extractEmails(text)).toEqual(['test@example.com', 'admin@site.org'])
    })

    test('should handle text without emails', () => {
      expect(TextProcessor.extractEmails('No emails here')).toEqual([])
    })

    test('should handle complex email formats', () => {
      const text = 'Emails: user.name+tag@example.com, test123@domain.co.uk'
      expect(TextProcessor.extractEmails(text)).toEqual(['user.name+tag@example.com', 'test123@domain.co.uk'])
    })
  })
})