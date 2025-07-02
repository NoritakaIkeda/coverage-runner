import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadIstanbulJson } from '../../../src/coverage/loaders/loadIstanbulJson';

describe('loadIstanbulJson', () => {
  const testFixtureDir = path.join(__dirname, '../../fixtures/istanbul');
  const sampleJsonPath = path.join(testFixtureDir, 'sample.json');

  beforeEach(() => {
    // Create test fixture directory
    fs.mkdirSync(testFixtureDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testFixtureDir)) {
      fs.rmSync(testFixtureDir, { recursive: true, force: true });
    }
  });

  it('should load Istanbul JSON and return coverage map data', () => {
    // Arrange: Create sample Istanbul JSON content
    const istanbulData = {
      '/src/example.ts': {
        path: '/src/example.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          '1': { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
        },
        fnMap: {
          '0': {
            name: 'exampleFunction',
            line: 1,
            decl: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 15 },
            },
          },
        },
        branchMap: {},
        s: { '0': 3, '1': 1 },
        f: { '0': 3 },
        b: {},
      },
    };

    fs.writeFileSync(sampleJsonPath, JSON.stringify(istanbulData, null, 2));

    // Act: Load Istanbul JSON file
    const result = loadIstanbulJson(sampleJsonPath);

    // Assert: Check that coverage map contains expected data
    expect(result.data).toHaveProperty('/src/example.ts');

    const fileData = result.data['/src/example.ts'];
    expect(fileData).toBeDefined();
    expect(fileData?.path).toBe('/src/example.ts');
    expect(fileData?.s['0']).toBe(3);
    expect(fileData?.s['1']).toBe(1);
    expect(fileData?.f['0']).toBe(3);
  });

  it('should handle empty Istanbul JSON', () => {
    // Arrange: Create empty Istanbul JSON
    fs.writeFileSync(sampleJsonPath, JSON.stringify({}));

    // Act: Load empty Istanbul JSON file
    const result = loadIstanbulJson(sampleJsonPath);

    // Assert: Should return empty coverage map
    expect(Object.keys(result.data)).toHaveLength(0);
  });

  it('should throw error when Istanbul JSON file does not exist', () => {
    // Arrange: Use non-existent file path
    const nonExistentPath = path.join(testFixtureDir, 'nonexistent.json');

    // Act & Assert: Should throw error
    expect(() => loadIstanbulJson(nonExistentPath)).toThrow();
  });

  it('should throw error for invalid JSON', () => {
    // Arrange: Create invalid JSON content
    const invalidJson = '{ invalid json }';
    fs.writeFileSync(sampleJsonPath, invalidJson);

    // Act & Assert: Should throw error
    expect(() => loadIstanbulJson(sampleJsonPath)).toThrow();
  });

  it('should handle multiple files in Istanbul JSON', () => {
    // Arrange: Create Istanbul JSON with multiple files
    const istanbulData = {
      '/src/file1.ts': {
        path: '/src/file1.ts',
        statementMap: {
          '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        fnMap: {},
        branchMap: {},
        s: { '0': 2 },
        f: {},
        b: {},
      },
      '/src/file2.ts': {
        path: '/src/file2.ts',
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

    fs.writeFileSync(sampleJsonPath, JSON.stringify(istanbulData, null, 2));

    // Act: Load Istanbul JSON file
    const result = loadIstanbulJson(sampleJsonPath);

    // Assert: Check that both files are present
    expect(result.data).toHaveProperty('/src/file1.ts');
    expect(result.data).toHaveProperty('/src/file2.ts');
    expect(Object.keys(result.data)).toHaveLength(2);
  });
});
