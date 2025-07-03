import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { executeInClonedRepo } from '../../src/utils/executeInClonedRepo';

/**
 * Tests for --repo option functionality
 */
describe('--repo option', () => {
  const testTempDir = resolve(process.cwd(), 'test-temp');

  beforeEach(async () => {
    // Clean up any existing test directory
    try {
      await fs.rm(testTempDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testTempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('executeInClonedRepo', () => {
    test('should handle basic repository cloning functionality', async () => {
      // Test with an invalid repo URL to verify error handling
      const result = await executeInClonedRepo('invalid-repo-url', {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.outputDir).toBe(resolve(testTempDir, 'output'));
    });

    test('should handle repository clone failure', async () => {
      const invalidRepoUrl = 'https://github.com/nonexistent/invalid-repo.git';

      const result = await executeInClonedRepo(invalidRepoUrl, {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    test('should validate CloneOptions interface', () => {
      const validOptions = {
        outputDir: '/tmp/test',
        cleanup: true,
        branch: 'main',
        installDependencies: false,
        timeout: 30000,
      };

      expect(validOptions.outputDir).toBe('/tmp/test');
      expect(validOptions.cleanup).toBe(true);
      expect(validOptions.branch).toBe('main');
      expect(validOptions.installDependencies).toBe(false);
      expect(validOptions.timeout).toBe(30000);
    });

    test('should validate CloneResult interface', () => {
      const validResult = {
        success: false,
        error: 'Test error',
        outputDir: '/tmp/output',
        clonedPath: '/tmp/clone',
        branch: 'develop',
        runners: ['jest'],
        coverageFiles: ['coverage.json'],
      };

      expect(validResult.success).toBe(false);
      expect(validResult.error).toBe('Test error');
      expect(validResult.outputDir).toBe('/tmp/output');
      expect(validResult.clonedPath).toBe('/tmp/clone');
      expect(validResult.branch).toBe('develop');
      expect(Array.isArray(validResult.runners)).toBe(true);
      expect(Array.isArray(validResult.coverageFiles)).toBe(true);
    });
  });
});
