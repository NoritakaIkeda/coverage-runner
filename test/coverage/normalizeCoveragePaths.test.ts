/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect } from 'vitest';
import { normalizeCoveragePaths } from '../../src/coverage/normalizeCoveragePaths';
import { mergeCoverage } from '../../src/coverage/mergeCoverage';

describe('normalizeCoveragePaths', () => {
  it('should normalize relative and absolute paths to be consistent', () => {
    // Arrange: Create coverage with mixed path formats
    const coverage1 = {
      'src/index.ts': {
        path: 'src/index.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 2 },
        f: {},
        b: {},
      },
    };

    const coverage2 = {
      './src/index.ts': {
        path: './src/index.ts',
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

    const mergedCoverage = mergeCoverage([coverage1, coverage2]);

    // Act: Normalize paths
    const normalizedCoverage = normalizeCoveragePaths(mergedCoverage);

    // Assert: Should have only one entry for the same file
    const normalizedKeys = Object.keys(normalizedCoverage.data);
    expect(normalizedKeys).toHaveLength(1);

    // The normalized path should be consistent
    const normalizedFile = normalizedCoverage.data[
      normalizedKeys[0] as string
    ] as any;
    expect((normalizedFile as any).s['0']).toBe(5); // 2 + 3 = 5 (merged hit counts)
  });

  it('should handle absolute paths correctly', () => {
    // Arrange: Create coverage with absolute and relative paths
    const coverage1 = {
      '/project/src/file.ts': {
        path: '/project/src/file.ts',
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

    const coverage2 = {
      'src/file.ts': {
        path: 'src/file.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 4 },
        f: {},
        b: {},
      },
    };

    const mergedCoverage = mergeCoverage([coverage1, coverage2]);

    // Act: Normalize paths
    const normalizedCoverage = normalizeCoveragePaths(
      mergedCoverage,
      '/project'
    );

    // Assert: Should merge files with same relative path
    const normalizedKeys = Object.keys(normalizedCoverage.data);
    expect(normalizedKeys).toHaveLength(1);

    const normalizedFile = normalizedCoverage.data[
      normalizedKeys[0] as string
    ] as any;
    expect((normalizedFile as any).s['0']).toBe(5); // 1 + 4 = 5
  });

  it('should preserve distinct files with different paths', () => {
    // Arrange: Create coverage with truly different files
    const coverage = {
      'src/file1.ts': {
        path: 'src/file1.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 2 },
        f: {},
        b: {},
      },
      'src/file2.ts': {
        path: 'src/file2.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 3 },
        f: {},
        b: {},
      },
    };

    const mergedCoverage = mergeCoverage([coverage]);

    // Act: Normalize paths
    const normalizedCoverage = normalizeCoveragePaths(mergedCoverage);

    // Assert: Should keep both files separate
    const normalizedKeys = Object.keys(normalizedCoverage.data);
    expect(normalizedKeys).toHaveLength(2);
  });

  it('should handle complex path variations', () => {
    // Arrange: Create coverage with various path formats
    const coverage1 = {
      './src/../src/utils.ts': {
        path: './src/../src/utils.ts',
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

    const coverage2 = {
      'src/utils.ts': {
        path: 'src/utils.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 2 },
        f: {},
        b: {},
      },
    };

    const mergedCoverage = mergeCoverage([coverage1, coverage2]);

    // Act: Normalize paths
    const normalizedCoverage = normalizeCoveragePaths(mergedCoverage);

    // Assert: Should normalize complex paths to same file
    const normalizedKeys = Object.keys(normalizedCoverage.data);
    expect(normalizedKeys).toHaveLength(1);

    const normalizedFile = normalizedCoverage.data[
      normalizedKeys[0] as string
    ] as any;
    expect((normalizedFile as any).s['0']).toBe(3); // 1 + 2 = 3
  });

  it('should handle empty coverage map', () => {
    // Arrange: Empty coverage
    const emptyCoverage = mergeCoverage([]);

    // Act: Normalize empty coverage
    const normalizedCoverage = normalizeCoveragePaths(emptyCoverage);

    // Assert: Should return empty coverage map
    expect(Object.keys(normalizedCoverage.data)).toHaveLength(0);
  });
});
