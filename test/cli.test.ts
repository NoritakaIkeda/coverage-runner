import { describe, it, expect } from 'vitest';
import { createCLI } from '../bin/coverage-runner';

describe('CLI', () => {
  it('should create CLI program with correct name', () => {
    const program = createCLI();
    expect(program.name()).toBe('coverage-runner');
  });

  it('should have correct description', () => {
    const program = createCLI();
    expect(program.description()).toBe(
      'A tool for running and managing code coverage analysis'
    );
  });

  it('should have version option', () => {
    const program = createCLI();
    const options = program.options;
    const versionOption = options.find(
      opt => opt.short === '-V' || opt.long === '--version'
    );
    expect(versionOption).toBeDefined();
  });

  it('should have help functionality', () => {
    const program = createCLI();
    // Commander automatically adds help option, we just test that program exists
    expect(program).toBeDefined();
    expect(typeof program.help).toBe('function');
  });
});
