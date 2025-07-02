import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadCobertura } from '../../../src/coverage/loaders/loadCobertura';

describe('loadCobertura', () => {
  const testFixtureDir = path.join(__dirname, '../../fixtures/cobertura');
  const sampleCoberturaPath = path.join(testFixtureDir, 'sample.xml');

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

  it('should load Cobertura XML and return coverage map data', () => {
    // Arrange: Create sample Cobertura XML content
    const coberturaContent = `<?xml version="1.0"?>
<coverage line-rate="0.67" branch-rate="0.5" version="1.9" timestamp="1234567890">
  <sources>
    <source>/src</source>
  </sources>
  <packages>
    <package name="example" line-rate="0.67" branch-rate="0.5">
      <classes>
        <class name="example.ts" filename="example.ts" line-rate="0.67" branch-rate="0.5">
          <methods>
            <method name="exampleFunction" signature="()" line-rate="1.0" branch-rate="1.0">
              <lines>
                <line number="1" hits="3" branch="false"/>
              </lines>
            </method>
          </methods>
          <lines>
            <line number="1" hits="1" branch="false"/>
            <line number="2" hits="3" branch="false"/>
            <line number="3" hits="0" branch="false"/>
          </lines>
        </class>
      </classes>
    </package>
  </packages>
</coverage>`;

    fs.writeFileSync(sampleCoberturaPath, coberturaContent);

    // Act: Load Cobertura file
    const result = loadCobertura(sampleCoberturaPath);

    // Assert: Check that coverage map contains expected data
    expect(result.data).toHaveProperty('example.ts');
    
    const fileData = result.data['example.ts'];
    expect(fileData.path).toBe('example.ts');
  });

  it('should handle empty Cobertura XML', () => {
    // Arrange: Create minimal Cobertura XML
    const coberturaContent = `<?xml version="1.0"?>
<coverage line-rate="1.0" branch-rate="1.0" version="1.9">
  <sources></sources>
  <packages></packages>
</coverage>`;

    fs.writeFileSync(sampleCoberturaPath, coberturaContent);

    // Act: Load Cobertura file
    const result = loadCobertura(sampleCoberturaPath);

    // Assert: Should return empty coverage map
    expect(Object.keys(result.data)).toHaveLength(0);
  });

  it('should throw error when Cobertura file does not exist', () => {
    // Arrange: Use non-existent file path
    const nonExistentPath = path.join(testFixtureDir, 'nonexistent.xml');

    // Act & Assert: Should throw error
    expect(() => loadCobertura(nonExistentPath)).toThrow();
  });

  it('should throw error for invalid XML', () => {
    // Arrange: Create invalid XML content
    const invalidXml = 'This is not valid XML';
    fs.writeFileSync(sampleCoberturaPath, invalidXml);

    // Act & Assert: Should throw error
    expect(() => loadCobertura(sampleCoberturaPath)).toThrow();
  });
});