import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { mergeCoverageFiles } from '../../src/commands/mergeCoverage';

describe('Output Format Options', () => {
  const testOutputDir = resolve(process.cwd(), 'test-temp-formats');
  const testInputFile = resolve(
    process.cwd(),
    'test/fixtures/coverage-sample.json'
  );

  beforeEach(async () => {
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist
    }
    await fs.mkdir(testOutputDir, { recursive: true });

    // Create sample coverage file for testing
    const sampleCoverage = {
      '/test/file.ts': {
        path: '/test/file.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {},
      },
    };

    await fs.mkdir(resolve(process.cwd(), 'test/fixtures'), {
      recursive: true,
    });
    await fs.writeFile(testInputFile, JSON.stringify(sampleCoverage));
  });

  afterEach(async () => {
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
      await fs.rm(testInputFile, { force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should support --format json option', async () => {
    const result = await mergeCoverageFiles({
      inputPatterns: [testInputFile],
      outputDir: testOutputDir,
      format: ['json'],
    });

    expect(result.success).toBe(true);

    const jsonFile = resolve(testOutputDir, 'coverage-merged.json');
    const lcovFile = resolve(testOutputDir, 'coverage-merged.lcov');
    const textFile = resolve(testOutputDir, 'coverage-summary.txt');

    expect(
      await fs
        .access(jsonFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(lcovFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
    expect(
      await fs
        .access(textFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
  });

  test('should support --format lcov option', async () => {
    const result = await mergeCoverageFiles({
      inputPatterns: [testInputFile],
      outputDir: testOutputDir,
      format: ['lcov'],
    });

    expect(result.success).toBe(true);

    const jsonFile = resolve(testOutputDir, 'coverage-merged.json');
    const lcovFile = resolve(testOutputDir, 'coverage-merged.lcov');
    const textFile = resolve(testOutputDir, 'coverage-summary.txt');

    expect(
      await fs
        .access(jsonFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
    expect(
      await fs
        .access(lcovFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(textFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
  });

  test('should support --format text option', async () => {
    const result = await mergeCoverageFiles({
      inputPatterns: [testInputFile],
      outputDir: testOutputDir,
      format: ['text'],
    });

    expect(result.success).toBe(true);

    const jsonFile = resolve(testOutputDir, 'coverage-merged.json');
    const lcovFile = resolve(testOutputDir, 'coverage-merged.lcov');
    const textFile = resolve(testOutputDir, 'coverage-summary.txt');

    expect(
      await fs
        .access(jsonFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
    expect(
      await fs
        .access(lcovFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
    expect(
      await fs
        .access(textFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
  });

  test('should support multiple formats', async () => {
    const result = await mergeCoverageFiles({
      inputPatterns: [testInputFile],
      outputDir: testOutputDir,
      format: ['json', 'lcov', 'text'],
    });

    expect(result.success).toBe(true);

    const jsonFile = resolve(testOutputDir, 'coverage-merged.json');
    const lcovFile = resolve(testOutputDir, 'coverage-merged.lcov');
    const textFile = resolve(testOutputDir, 'coverage-summary.txt');

    expect(
      await fs
        .access(jsonFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(lcovFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(textFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
  });

  test('should default to json and lcov when no format specified', async () => {
    const result = await mergeCoverageFiles({
      inputPatterns: [testInputFile],
      outputDir: testOutputDir,
      // format not specified
    });

    expect(result.success).toBe(true);

    const jsonFile = resolve(testOutputDir, 'coverage-merged.json');
    const lcovFile = resolve(testOutputDir, 'coverage-merged.lcov');
    const textFile = resolve(testOutputDir, 'coverage-summary.txt');

    expect(
      await fs
        .access(jsonFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(lcovFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(textFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
  });

  test('should support legacy --json-only option for backward compatibility', async () => {
    const result = await mergeCoverageFiles({
      inputPatterns: [testInputFile],
      outputDir: testOutputDir,
      jsonOnly: true,
    });

    expect(result.success).toBe(true);

    const jsonFile = resolve(testOutputDir, 'coverage-merged.json');
    const lcovFile = resolve(testOutputDir, 'coverage-merged.lcov');

    expect(
      await fs
        .access(jsonFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(lcovFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(false);
  });

  test('should support text format with detailed option', async () => {
    const result = await mergeCoverageFiles({
      inputPatterns: [testInputFile],
      outputDir: testOutputDir,
      format: ['text'],
      textDetails: true,
    });

    expect(result.success).toBe(true);

    const summaryFile = resolve(testOutputDir, 'coverage-summary.txt');
    const detailedFile = resolve(testOutputDir, 'coverage-detailed.txt');

    expect(
      await fs
        .access(summaryFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .access(detailedFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
  });
});
