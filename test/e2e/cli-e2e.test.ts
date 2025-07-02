import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execa } from 'execa';
import * as fs from 'fs';
import * as path from 'path';

const CLI_PATH = path.join(__dirname, '../../dist/bin/coverage-runner.js');
const JEST_EXAMPLE_PATH = path.join(__dirname, '../../examples/jest-project');
const VITEST_EXAMPLE_PATH = path.join(
  __dirname,
  '../../examples/vitest-project'
);

describe('CLI E2E Tests', () => {
  beforeEach(() => {
    // Clean up any existing coverage directories
    const jestCoverageDir = path.join(JEST_EXAMPLE_PATH, 'coverage');
    const vitestCoverageDir = path.join(VITEST_EXAMPLE_PATH, 'coverage');

    if (fs.existsSync(jestCoverageDir)) {
      fs.rmSync(jestCoverageDir, { recursive: true, force: true });
    }
    if (fs.existsSync(vitestCoverageDir)) {
      fs.rmSync(vitestCoverageDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up coverage directories after tests
    const jestCoverageDir = path.join(JEST_EXAMPLE_PATH, 'coverage');
    const vitestCoverageDir = path.join(VITEST_EXAMPLE_PATH, 'coverage');

    if (fs.existsSync(jestCoverageDir)) {
      fs.rmSync(jestCoverageDir, { recursive: true, force: true });
    }
    if (fs.existsSync(vitestCoverageDir)) {
      fs.rmSync(vitestCoverageDir, { recursive: true, force: true });
    }
  });

  it('should detect Jest in sample project', async () => {
    const result = await execa(
      'node',
      [
        CLI_PATH,
        'detect',
        '--path',
        path.join(JEST_EXAMPLE_PATH, 'package.json'),
      ],
      {
        stdio: 'pipe',
      }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('jest');
  }, 10000);

  it('should detect Vitest in sample project', async () => {
    const result = await execa(
      'node',
      [
        CLI_PATH,
        'detect',
        '--path',
        path.join(VITEST_EXAMPLE_PATH, 'package.json'),
      ],
      {
        stdio: 'pipe',
      }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('vitest');
  }, 10000);

  it('should run Jest coverage and create coverage directory', async () => {
    const packageJsonPath = path.join(JEST_EXAMPLE_PATH, 'package.json');
    const coverageDir = path.join(JEST_EXAMPLE_PATH, 'coverage');

    // Set working directory and run coverage
    const result = await execa(
      'node',
      [CLI_PATH, 'run', '--path', packageJsonPath],
      {
        cwd: JEST_EXAMPLE_PATH,
        stdio: 'pipe',
        timeout: 30000,
      }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('jest');
    expect(result.stdout).toContain('Coverage analysis completed');

    // Check if coverage directory was created
    expect(fs.existsSync(coverageDir)).toBe(true);

    // Check for common coverage files
    const coverageFiles = fs.readdirSync(coverageDir);
    expect(coverageFiles.length).toBeGreaterThan(0);
  }, 30000);

  it('should attempt to run Vitest coverage (may fail due to missing dependencies)', async () => {
    const packageJsonPath = path.join(VITEST_EXAMPLE_PATH, 'package.json');

    // Run coverage command - it may fail due to missing dependencies in CI
    const result = await execa(
      'node',
      [CLI_PATH, 'run', '--path', packageJsonPath],
      {
        cwd: VITEST_EXAMPLE_PATH,
        stdio: 'pipe',
        timeout: 30000,
        reject: false, // Don't reject on non-zero exit code
      }
    );

    // Should detect vitest and attempt to run it
    expect(result.stdout).toContain('vitest');
    expect(result.stdout).toContain('Coverage analysis completed');
  }, 30000);

  it('should handle projects with no test runners gracefully', async () => {
    // Create a temporary package.json without test runners
    const tempDir = path.join(__dirname, '../../temp-test');
    const tempPackageJson = path.join(tempDir, 'package.json');

    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(
      tempPackageJson,
      JSON.stringify(
        {
          name: 'no-runners',
          version: '1.0.0',
          dependencies: {
            lodash: '^4.17.21',
          },
        },
        null,
        2
      )
    );

    try {
      const result = await execa(
        'node',
        [CLI_PATH, 'run', '--path', tempPackageJson],
        {
          stdio: 'pipe',
        }
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('No test runners detected');
    } finally {
      // Clean up
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }, 10000);
});
