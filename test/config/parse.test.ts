import { describe, it, expect } from 'vitest';
import { parseConfig } from '../../src/config/parse.js';

describe('parseConfig', () => {
  it('should parse valid config structure successfully', () => {
    const validConfig = {
      runnerOverrides: {
        jest: 'jest --config custom.config.js',
        vitest: 'vitest --config vitest.custom.js',
      },
      excludePatterns: ['**/*.spec.ts', '**/__tests__/**'],
      mergeStrategy: 'merge' as const,
    };

    const result = parseConfig(validConfig);

    expect(result).toEqual({
      success: true,
      data: validConfig,
    });
  });

  it('should parse config with partial fields successfully', () => {
    const partialConfig = {
      excludePatterns: ['**/*.test.ts'],
    };

    const result = parseConfig(partialConfig);

    expect(result).toEqual({
      success: true,
      data: partialConfig,
    });
  });

  it('should parse empty config successfully', () => {
    const emptyConfig = {};

    const result = parseConfig(emptyConfig);

    expect(result).toEqual({
      success: true,
      data: emptyConfig,
    });
  });

  it('should fail validation for invalid runnerOverrides type', () => {
    const invalidConfig = {
      runnerOverrides: 'not an object',
    };

    const result = parseConfig(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('runnerOverrides');
    }
  });

  it('should fail validation for invalid excludePatterns type', () => {
    const invalidConfig = {
      excludePatterns: 'not an array',
    };

    const result = parseConfig(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('excludePatterns');
    }
  });

  it('should fail validation for invalid mergeStrategy value', () => {
    const invalidConfig = {
      mergeStrategy: 'invalid_strategy',
    };

    const result = parseConfig(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('mergeStrategy');
    }
  });

  it('should fail validation for array of non-strings in excludePatterns', () => {
    const invalidConfig = {
      excludePatterns: ['valid-pattern', 123, 'another-valid'],
    };

    const result = parseConfig(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('excludePatterns');
    }
  });

  it('should fail validation for non-string values in runnerOverrides', () => {
    const invalidConfig = {
      runnerOverrides: {
        jest: 'valid command',
        vitest: 123,
      },
    };

    const result = parseConfig(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('runnerOverrides');
    }
  });
});
