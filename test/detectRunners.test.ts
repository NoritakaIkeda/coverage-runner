import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import {
  detectRunners,
  detectRunnersFromDirectory,
} from '../src/utils/detectRunners';

vi.mock('fs');

const mockFs = vi.mocked(fs);

describe('detectRunners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when package.json does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual([]);
    expect(mockFs.existsSync).toHaveBeenCalledWith('/path/to/package.json');
  });

  it('should return empty array when package.json is invalid JSON', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('invalid json');

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual([]);
  });

  it('should detect jest from dependencies', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          jest: '^29.0.0',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual(['jest']);
  });

  it('should detect vitest from devDependencies', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        devDependencies: {
          vitest: '^1.0.0',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual(['vitest']);
  });

  it('should detect both jest and vitest', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          jest: '^29.0.0',
        },
        devDependencies: {
          vitest: '^1.0.0',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toContain('jest');
    expect(result).toContain('vitest');
    expect(result).toHaveLength(2);
  });

  it('should detect mocha and ava from dependencies', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          mocha: '^10.0.0',
          ava: '^5.0.0',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toContain('mocha');
    expect(result).toContain('ava');
    expect(result).toHaveLength(2);
  });

  it('should detect jest from scripts', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        scripts: {
          test: 'jest --coverage',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual(['jest']);
  });

  it('should detect vitest from scripts', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        scripts: {
          'test:unit': 'vitest run',
          'test:watch': 'vitest watch',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual(['vitest']);
  });

  it('should detect runner from both dependencies and scripts (no duplicates)', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        devDependencies: {
          jest: '^29.0.0',
        },
        scripts: {
          test: 'jest --watch',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual(['jest']);
  });

  it('should detect @jest/core as jest dependency', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        devDependencies: {
          '@jest/core': '^29.0.0',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual(['jest']);
  });

  it('should return empty array when no test runners found', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          react: '^18.0.0',
          lodash: '^4.17.21',
        },
        scripts: {
          build: 'webpack',
          start: 'node server.js',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual([]);
  });

  it('should handle case insensitive script detection', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        scripts: {
          test: 'JEST --coverage',
        },
      })
    );

    const result = detectRunners('/path/to/package.json');

    expect(result).toEqual(['jest']);
  });

  it('should use current working directory when no path provided', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        devDependencies: {
          vitest: '^1.0.0',
        },
      })
    );

    const result = detectRunners();

    expect(mockFs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining('package.json')
    );
    expect(result).toEqual(['vitest']);
  });
});

describe('detectRunnersFromDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect runners from specified directory', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        devDependencies: {
          jest: '^29.0.0',
        },
      })
    );

    const result = detectRunnersFromDirectory('/some/directory');

    expect(mockFs.existsSync).toHaveBeenCalledWith(
      '/some/directory/package.json'
    );
    expect(result).toEqual(['jest']);
  });
});
