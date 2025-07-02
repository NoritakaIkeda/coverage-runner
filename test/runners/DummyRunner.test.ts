import { describe, it, expect } from 'vitest';
import { DummyRunner } from '../../src/runners/DummyRunner';

describe('DummyRunner', () => {
  it('should implement Runner interface', () => {
    const runner = new DummyRunner();
    expect(runner).toHaveProperty('runCoverage');
    expect(typeof runner.runCoverage).toBe('function');
  });

  it('should return a resolved Promise when runCoverage() is called', async () => {
    const runner = new DummyRunner();
    const result = runner.runCoverage();
    
    expect(result).toBeInstanceOf(Promise);
    
    const coverageResult = await result;
    expect(coverageResult).toBeDefined();
    expect(coverageResult.success).toBe(true);
    expect(coverageResult.outputPath).toBeDefined();
  });

  it('should complete within reasonable time', async () => {
    const runner = new DummyRunner();
    const startTime = Date.now();
    
    await runner.runCoverage();
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(100); // Should be near-instant for dummy
  });
});