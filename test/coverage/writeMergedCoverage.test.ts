import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { writeMergedCoverage } from '../../src/coverage/writeMergedCoverage';
import { mergeCoverage } from '../../src/coverage/mergeCoverage';

describe('writeMergedCoverage', () => {
  const testOutputDir = path.join(__dirname, '../fixtures/output');

  beforeEach(() => {
    // Create test output directory
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('should write merged coverage to JSON and LCOV files', async () => {
    // Arrange: Create sample coverage data
    const coverage1 = {
      '/src/file1.ts': {
        path: '/src/file1.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 3 },
        f: {},
        b: {},
      },
    };

    const coverage2 = {
      '/src/file2.ts': {
        path: '/src/file2.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 2 },
        f: {},
        b: {},
      },
    };

    const mergedCoverage = mergeCoverage([coverage1, coverage2]);

    // Act: Write merged coverage
    writeMergedCoverage(mergedCoverage, { outDir: testOutputDir });

    // Assert: Check that both files are created
    const jsonFile = path.join(testOutputDir, 'coverage-merged.json');
    const lcovFile = path.join(testOutputDir, 'coverage-merged.lcov');

    expect(fs.existsSync(jsonFile)).toBe(true);
    expect(fs.existsSync(lcovFile)).toBe(true);

    // Verify JSON content
    const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf-8')) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(jsonContent).toHaveProperty('/src/file1.ts');
    expect(jsonContent).toHaveProperty('/src/file2.ts');
  });

  it('should only write JSON when jsonOnly option is true', async () => {
    // Arrange: Create sample coverage data
    const coverage = {
      '/src/test.ts': {
        path: '/src/test.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {},
      },
    };

    const mergedCoverage = mergeCoverage([coverage]);

    // Act: Write merged coverage with jsonOnly option
    writeMergedCoverage(mergedCoverage, {
      outDir: testOutputDir,
      jsonOnly: true,
    });

    // Assert: Check that only JSON file is created
    const jsonFile = path.join(testOutputDir, 'coverage-merged.json');
    const lcovFile = path.join(testOutputDir, 'coverage-merged.lcov');

    expect(fs.existsSync(jsonFile)).toBe(true);
    expect(fs.existsSync(lcovFile)).toBe(false);
  });

  it('should write to custom output directory', async () => {
    // Arrange: Create custom output directory
    const customDir = path.join(testOutputDir, 'custom');
    const coverage = {
      '/src/custom.ts': {
        path: '/src/custom.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 5 },
        f: {},
        b: {},
      },
    };

    const mergedCoverage = mergeCoverage([coverage]);

    // Act: Write to custom directory
    writeMergedCoverage(mergedCoverage, { outDir: customDir });

    // Assert: Check that files are created in custom directory
    const jsonFile = path.join(customDir, 'coverage-merged.json');
    const lcovFile = path.join(customDir, 'coverage-merged.lcov');

    expect(fs.existsSync(jsonFile)).toBe(true);
    expect(fs.existsSync(lcovFile)).toBe(true);
  });

  it('should handle empty coverage map', async () => {
    // Arrange: Empty coverage
    const mergedCoverage = mergeCoverage([]);

    // Act: Write empty coverage
    writeMergedCoverage(mergedCoverage, { outDir: testOutputDir });

    // Assert: Check that files are still created (but empty)
    const jsonFile = path.join(testOutputDir, 'coverage-merged.json');
    const lcovFile = path.join(testOutputDir, 'coverage-merged.lcov');

    expect(fs.existsSync(jsonFile)).toBe(true);
    expect(fs.existsSync(lcovFile)).toBe(true);

    // Verify JSON content is empty object
    const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf-8')) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    expect(Object.keys(jsonContent)).toHaveLength(0);
  });

  it('should create output directory if it does not exist', async () => {
    // Arrange: Use non-existent directory
    const nonExistentDir = path.join(testOutputDir, 'new', 'nested', 'dir');
    const coverage = {
      '/src/test.ts': {
        path: '/src/test.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {},
      },
    };

    const mergedCoverage = mergeCoverage([coverage]);

    // Act: Write to non-existent directory
    writeMergedCoverage(mergedCoverage, { outDir: nonExistentDir });

    // Assert: Check that directory and files are created
    expect(fs.existsSync(nonExistentDir)).toBe(true);

    const jsonFile = path.join(nonExistentDir, 'coverage-merged.json');
    expect(fs.existsSync(jsonFile)).toBe(true);
  });
});
