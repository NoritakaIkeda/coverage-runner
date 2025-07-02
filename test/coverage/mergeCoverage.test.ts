import { describe, it, expect } from 'vitest';
import { mergeCoverage } from '../../src/coverage/mergeCoverage';

describe('mergeCoverage', () => {
  it('should merge two JSON coverage objects into a unified coverage map', () => {
    // Arrange: Create two sample coverage objects
    const coverage1 = {
      '/src/file1.ts': {
        path: '/src/file1.ts',
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

    // Act: Merge the coverage objects
    const result = mergeCoverage([coverage1, coverage2]);

    // Assert: Check that both files are present in the merged result
    expect(result.data).toHaveProperty('/src/file1.ts');
    expect(result.data).toHaveProperty('/src/file2.ts');
    expect(Object.keys(result.data)).toHaveLength(2);
  });

  it('should merge overlapping coverage for the same file', () => {
    // Arrange: Create two coverage objects for the same file with different hit counts
    const coverage1 = {
      '/src/shared.ts': {
        path: '/src/shared.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          '1': { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 3, '1': 1 },
        f: {},
        b: {},
      },
    };

    const coverage2 = {
      '/src/shared.ts': {
        path: '/src/shared.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          '1': { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 2, '1': 0 },
        f: {},
        b: {},
      },
    };

    // Act: Merge the coverage objects
    const result = mergeCoverage([coverage1, coverage2]);

    // Assert: Check that hit counts are summed for the same file
    expect(result.data).toHaveProperty('/src/shared.ts');
    expect(Object.keys(result.data)).toHaveLength(1);
    
    const mergedFile = result.data['/src/shared.ts'];
    expect(mergedFile.s['0']).toBe(5); // 3 + 2
    expect(mergedFile.s['1']).toBe(1); // 1 + 0
  });

  it('should return empty coverage map when given empty array', () => {
    // Act: Merge empty array
    const result = mergeCoverage([]);

    // Assert: Should return empty coverage map
    expect(Object.keys(result.data)).toHaveLength(0);
  });

  it('should handle single coverage object', () => {
    // Arrange: Single coverage object
    const coverage = {
      '/src/single.ts': {
        path: '/src/single.ts',
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

    // Act: Merge single coverage
    const result = mergeCoverage([coverage]);

    // Assert: Should return the same coverage data
    expect(result.data).toHaveProperty('/src/single.ts');
    expect(Object.keys(result.data)).toHaveLength(1);
    expect(result.data['/src/single.ts'].s['0']).toBe(1);
  });
});