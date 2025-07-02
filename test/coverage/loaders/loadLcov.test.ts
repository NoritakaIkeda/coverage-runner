import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadLcov } from '../../../src/coverage/loaders/loadLcov';

describe('loadLcov', () => {
  const testFixtureDir = path.join(__dirname, '../../fixtures/lcov');
  const sampleLcovPath = path.join(testFixtureDir, 'sample.lcov');

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

  it('should load LCOV file and return coverage map data', () => {
    // Arrange: Create sample LCOV content
    const lcovContent = `TN:
SF:/src/example.ts
FN:1,exampleFunction
FNF:1
FNH:1
FNDA:3,exampleFunction
DA:1,1
DA:2,3
DA:3,0
LF:3
LH:2
end_of_record`;

    fs.writeFileSync(sampleLcovPath, lcovContent);

    // Act: Load LCOV file
    const result = loadLcov(sampleLcovPath);

    // Assert: Check that coverage map contains expected data
    expect(result.data).toHaveProperty('/src/example.ts');

    const fileData = result.data['/src/example.ts'];
    expect(fileData?.path).toBe('/src/example.ts');

    // Check statement coverage (line coverage in LCOV)
    expect(fileData?.s).toBeDefined();
    expect(Object.keys(fileData?.s ?? {})).toContain('0'); // First statement
    expect(Object.keys(fileData?.s ?? {})).toContain('1'); // Second statement
  });

  it('should handle empty LCOV file', () => {
    // Arrange: Create empty LCOV file
    fs.writeFileSync(sampleLcovPath, '');

    // Act: Load empty LCOV file
    const result = loadLcov(sampleLcovPath);

    // Assert: Should return empty coverage map
    expect(Object.keys(result.data)).toHaveLength(0);
  });

  it('should throw error when LCOV file does not exist', () => {
    // Arrange: Use non-existent file path
    const nonExistentPath = path.join(testFixtureDir, 'nonexistent.lcov');

    // Act & Assert: Should throw error
    expect(() => loadLcov(nonExistentPath)).toThrow();
  });

  it('should handle multiple files in LCOV', () => {
    // Arrange: Create LCOV content with multiple files
    const lcovContent = `TN:
SF:/src/file1.ts
DA:1,5
LF:1
LH:1
end_of_record
TN:
SF:/src/file2.ts
DA:1,2
DA:2,0
LF:2
LH:1
end_of_record`;

    fs.writeFileSync(sampleLcovPath, lcovContent);

    // Act: Load LCOV file
    const result = loadLcov(sampleLcovPath);

    // Assert: Check that both files are present
    expect(result.data).toHaveProperty('/src/file1.ts');
    expect(result.data).toHaveProperty('/src/file2.ts');
    expect(Object.keys(result.data)).toHaveLength(2);
  });
});
