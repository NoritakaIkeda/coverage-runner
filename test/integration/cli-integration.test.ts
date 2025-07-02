import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectRunners } from '../../src/utils/detectRunners';
import { RunnerFactory } from '../../src/runners/RunnerFactory';
import { JestRunner } from '../../src/runners/JestRunner';
import { VitestRunner } from '../../src/runners/VitestRunner';

vi.mock('../../src/utils/detectRunners');
vi.mock('../../src/runners/JestRunner');
vi.mock('../../src/runners/VitestRunner');

const mockDetectRunners = vi.mocked(detectRunners);
const MockJestRunner = vi.mocked(JestRunner);
const MockVitestRunner = vi.mocked(VitestRunner);

describe('CLI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect runners and execute them in sequence', async () => {
    // Setup mocks
    mockDetectRunners.mockReturnValue(['jest', 'vitest']);
    
    const mockJestInstance = {
      runCoverage: vi.fn().mockResolvedValue({
        success: true,
        outputPath: './coverage',
        duration: 1000,
      }),
    };
    
    const mockVitestInstance = {
      runCoverage: vi.fn().mockResolvedValue({
        success: true,
        outputPath: './coverage',
        duration: 500,
      }),
    };
    
    MockJestRunner.mockImplementation(() => mockJestInstance as any);
    MockVitestRunner.mockImplementation(() => mockVitestInstance as any);

    // Simulate CLI execution flow
    const detectedRunners = detectRunners();
    expect(detectedRunners).toEqual(['jest', 'vitest']);

    // Execute each runner
    const results = [];
    for (const runnerType of detectedRunners) {
      const runner = RunnerFactory.createRunner(runnerType);
      const result = await runner.runCoverage();
      results.push(result);
    }

    // Verify execution order and results
    expect(mockJestInstance.runCoverage).toHaveBeenCalledTimes(1);
    expect(mockVitestInstance.runCoverage).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(2);
    expect(results[0]?.success).toBe(true);
    expect(results[1]?.success).toBe(true);
  });

  it('should handle runner failure gracefully', async () => {
    mockDetectRunners.mockReturnValue(['jest']);
    
    const mockJestInstance = {
      runCoverage: vi.fn().mockResolvedValue({
        success: false,
        outputPath: './coverage',
        exitCode: 1,
        stderr: 'Test failed',
        duration: 1000,
      }),
    };
    
    MockJestRunner.mockImplementation(() => mockJestInstance as any);

    const detectedRunners = detectRunners();
    const firstRunner = detectedRunners[0];
    if (!firstRunner) {
      throw new Error('No runners detected');
    }
    const runner = RunnerFactory.createRunner(firstRunner);
    const result = await runner.runCoverage();

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe('Test failed');
  });

  it('should handle case when no runners are detected', () => {
    mockDetectRunners.mockReturnValue([]);
    
    const detectedRunners = detectRunners();
    expect(detectedRunners).toEqual([]);
  });
});