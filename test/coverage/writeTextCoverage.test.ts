import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { writeTextCoverage } from '../../src/coverage/writeTextCoverage';

describe('writeTextCoverage', () => {
  const testOutputDir = resolve(process.cwd(), 'test-temp-text');

  beforeEach(async () => {
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist
    }
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should write coverage summary in text format', async () => {
    const coverageData = {
      '/path/to/file1.ts': {
        path: '/path/to/file1.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: { '0': { name: 'testFn', decl: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }, line: 1 } },
        branchMap: {},
        s: { '0': 5 },
        f: { '0': 3 },
        b: {}
      }
    };

    const coverageMap = createCoverageMap(coverageData);
    
    await writeTextCoverage(coverageMap, testOutputDir);

    const textFile = resolve(testOutputDir, 'coverage-summary.txt');
    const content = await fs.readFile(textFile, 'utf8');

    expect(content).toContain('COVERAGE SUMMARY');
    expect(content).toContain('file1.ts');
    expect(content).toContain('Statements');
    expect(content).toContain('Functions');
    expect(content).toContain('Lines');
  });

  test('should write detailed coverage report in text format', async () => {
    const coverageData = {
      '/path/to/file1.ts': {
        path: '/path/to/file1.ts',
        statementMap: { 
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          '1': { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } }
        },
        fnMap: { '0': { name: 'testFunction', decl: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }, line: 1 } },
        branchMap: {},
        s: { '0': 5, '1': 0 },
        f: { '0': 3 },
        b: {}
      }
    };

    const coverageMap = createCoverageMap(coverageData);
    
    await writeTextCoverage(coverageMap, testOutputDir, { detailed: true });

    const textFile = resolve(testOutputDir, 'coverage-detailed.txt');
    const content = await fs.readFile(textFile, 'utf8');

    expect(content).toContain('DETAILED COVERAGE REPORT');
    expect(content).toContain('testFunction');
    expect(content).toContain('Covered');
    expect(content).toContain('Uncovered statements');
  });

  test('should write both summary and detailed reports when requested', async () => {
    const coverageData = {
      '/path/to/file1.ts': {
        path: '/path/to/file1.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      }
    };

    const coverageMap = createCoverageMap(coverageData);
    
    await writeTextCoverage(coverageMap, testOutputDir, { 
      summary: true, 
      detailed: true 
    });

    const summaryFile = resolve(testOutputDir, 'coverage-summary.txt');
    const detailedFile = resolve(testOutputDir, 'coverage-detailed.txt');

    expect(await fs.access(summaryFile).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(detailedFile).then(() => true).catch(() => false)).toBe(true);
  });

  test('should handle empty coverage data gracefully', async () => {
    const coverageMap = createCoverageMap({});
    
    await writeTextCoverage(coverageMap, testOutputDir);

    const textFile = resolve(testOutputDir, 'coverage-summary.txt');
    const content = await fs.readFile(textFile, 'utf8');

    expect(content).toContain('COVERAGE SUMMARY');
    expect(content).toContain('No coverage data found');
  });
});