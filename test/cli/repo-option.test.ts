import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
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
    test('should clone repository and execute coverage analysis', async () => {
      // Create a mock local repository to simulate cloning
      const mockRepoPath = resolve(testTempDir, 'mock-repo');
      await fs.mkdir(mockRepoPath, { recursive: true });

      // Create a basic package.json with test frameworks
      const packageJson = {
        name: 'test-repo',
        scripts: {
          test: 'jest',
        },
        devDependencies: {
          jest: '^29.0.0',
        },
      };
      await fs.writeFile(
        resolve(mockRepoPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Create a simple source file
      await fs.mkdir(resolve(mockRepoPath, 'src'), { recursive: true });
      await fs.writeFile(
        resolve(mockRepoPath, 'src', 'index.js'),
        'module.exports = { add: (a, b) => a + b };'
      );

      // Create a simple test file
      await fs.mkdir(resolve(mockRepoPath, '__tests__'), { recursive: true });
      await fs.writeFile(
        resolve(mockRepoPath, '__tests__', 'index.test.js'),
        `
const { add } = require('../src/index');
test('add function', () => {
  expect(add(2, 3)).toBe(5);
});
        `.trim()
      );

      // Mock git clone by using local file path
      const result = await executeInClonedRepo(`file://${mockRepoPath}`, {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: true,
      });

      expect(result.success).toBe(true);
      expect(result.outputDir).toBe(resolve(testTempDir, 'output'));
      expect(result.clonedPath).toContain('coverage-runner-clone-');

      // Verify output files were created
      const outputFiles = await fs.readdir(result.outputDir);
      expect(outputFiles).toContain('coverage-merged.json');
    });

    test('should handle repository clone failure', async () => {
      const invalidRepoUrl = 'https://github.com/nonexistent/invalid-repo.git';

      const result = await executeInClonedRepo(invalidRepoUrl, {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to clone repository');
      expect(result.clonedPath).toBeUndefined();
    });

    test('should handle repository with no test frameworks', async () => {
      // Create a mock repository without test frameworks
      const mockRepoPath = resolve(testTempDir, 'no-tests-repo');
      await fs.mkdir(mockRepoPath, { recursive: true });

      const packageJson = {
        name: 'no-tests-repo',
        scripts: {
          start: 'node index.js',
        },
      };
      await fs.writeFile(
        resolve(mockRepoPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      await fs.writeFile(
        resolve(mockRepoPath, 'index.js'),
        'console.log("Hello World");'
      );

      const result = await executeInClonedRepo(`file://${mockRepoPath}`, {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No test runners detected');
    });

    test('should handle dependency installation failure', async () => {
      // Create a mock repository with invalid dependencies
      const mockRepoPath = resolve(testTempDir, 'bad-deps-repo');
      await fs.mkdir(mockRepoPath, { recursive: true });

      const packageJson = {
        name: 'bad-deps-repo',
        scripts: {
          test: 'jest',
        },
        devDependencies: {
          'nonexistent-package': '^1.0.0',
        },
      };
      await fs.writeFile(
        resolve(mockRepoPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await executeInClonedRepo(`file://${mockRepoPath}`, {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: true,
        installDependencies: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to install dependencies');
    });

    test('should preserve cloned repository when cleanup is false', async () => {
      const mockRepoPath = resolve(testTempDir, 'preserve-repo');
      await fs.mkdir(mockRepoPath, { recursive: true });

      const packageJson = {
        name: 'preserve-repo',
        scripts: { test: 'jest' },
        devDependencies: { jest: '^29.0.0' },
      };
      await fs.writeFile(
        resolve(mockRepoPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await executeInClonedRepo(`file://${mockRepoPath}`, {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: false,
      });

      expect(result.success).toBe(true);
      expect(result.clonedPath).toBeDefined();

      // Verify cloned directory still exists
      const clonedExists = await fs
        .access(result.clonedPath!)
        .then(() => true)
        .catch(() => false);
      expect(clonedExists).toBe(true);
    });

    test('should use custom branch when specified', async () => {
      const mockRepoPath = resolve(testTempDir, 'branch-repo');
      await fs.mkdir(mockRepoPath, { recursive: true });

      // Initialize a git repository
      const { execSync } = await import('child_process');
      execSync('git init', { cwd: mockRepoPath, stdio: 'ignore' });
      execSync('git config user.name "Test User"', {
        cwd: mockRepoPath,
        stdio: 'ignore',
      });
      execSync('git config user.email "test@example.com"', {
        cwd: mockRepoPath,
        stdio: 'ignore',
      });

      const packageJson = { name: 'branch-repo', scripts: { test: 'jest' } };
      await fs.writeFile(
        resolve(mockRepoPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      execSync('git add .', { cwd: mockRepoPath, stdio: 'ignore' });
      execSync('git commit -m "Initial commit"', {
        cwd: mockRepoPath,
        stdio: 'ignore',
      });
      execSync('git checkout -b feature-branch', {
        cwd: mockRepoPath,
        stdio: 'ignore',
      });

      const result = await executeInClonedRepo(`file://${mockRepoPath}`, {
        outputDir: resolve(testTempDir, 'output'),
        cleanup: true,
        branch: 'feature-branch',
      });

      expect(result.success).toBe(true);
      expect(result.branch).toBe('feature-branch');
    });
  });

  describe('error handling', () => {
    test('should handle network timeout errors gracefully', async () => {
      // Mock a timeout scenario
      vi.mocked(global.setTimeout).mockImplementation((callback, delay) => {
        if (delay && delay > 5000) {
          throw new Error('Network timeout');
        }
        return setTimeout(callback, delay || 0);
      });

      const result = await executeInClonedRepo(
        'https://github.com/slow/repo.git',
        {
          outputDir: resolve(testTempDir, 'output'),
          cleanup: true,
          timeout: 1000,
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/timeout|network/i);
    });

    test('should handle insufficient disk space errors', async () => {
      // Mock file system error
      const originalMkdir = fs.mkdir;
      vi.mocked(fs.mkdir).mockRejectedValueOnce(
        Object.assign(new Error('ENOSPC: no space left on device'), {
          code: 'ENOSPC',
        })
      );

      const result = await executeInClonedRepo(
        'https://github.com/test/repo.git',
        {
          outputDir: resolve(testTempDir, 'output'),
          cleanup: true,
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('insufficient disk space');

      // Restore original function
      vi.mocked(fs.mkdir).mockImplementation(originalMkdir);
    });

    test('should handle permission errors', async () => {
      // Mock permission error
      const originalAccess = fs.access;
      vi.mocked(fs.access).mockRejectedValueOnce(
        Object.assign(new Error('EACCES: permission denied'), {
          code: 'EACCES',
        })
      );

      const result = await executeInClonedRepo(
        'https://github.com/test/repo.git',
        {
          outputDir: '/root/restricted',
          cleanup: true,
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('permission denied');

      // Restore original function
      vi.mocked(fs.access).mockImplementation(originalAccess);
    });
  });
});
