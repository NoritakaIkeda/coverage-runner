import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execa } from 'execa';
import { VitestRunner } from '../../src/runners/VitestRunner';

vi.mock('execa');

const mockExeca = vi.mocked(execa);

describe('VitestRunner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should implement Runner interface', () => {
    const runner = new VitestRunner();
    expect(runner).toHaveProperty('runCoverage');
    expect(typeof runner.runCoverage).toBe('function');
  });

  it('should execute "vitest run --coverage" command when runCoverage() is called', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: 'Test results output',
      stderr: '',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const runner = new VitestRunner();
    await runner.runCoverage();

    expect(mockExeca).toHaveBeenCalledWith(
      'npx',
      [
        'vitest',
        'run',
        '--coverage',
        '--coverage.reportsDirectory',
        './coverage',
      ],
      {
        stdio: 'pipe',
      }
    );
  });

  it('should return success result when vitest command succeeds', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: 'Test results output',
      stderr: '',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const runner = new VitestRunner();
    const result = await runner.runCoverage();

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.outputPath).toBe('./coverage');
    expect(result.duration).toBeTypeOf('number');
  });

  it('should return failure result when vitest command fails', async () => {
    const mockError = {
      exitCode: 1,
      stdout: 'Some output',
      stderr: 'Vitest error message',
    };
    mockExeca.mockRejectedValue(mockError);

    const runner = new VitestRunner();
    const result = await runner.runCoverage();

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe('Vitest error message');
    expect(result.stdout).toBe('Some output');
  });

  it('should use COVERAGE_OUTPUT_DIR environment variable when set', async () => {
    const originalEnv = process.env.COVERAGE_OUTPUT_DIR;
    process.env.COVERAGE_OUTPUT_DIR = '/tmp/custom-coverage';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const runner = new VitestRunner();
    await runner.runCoverage();

    expect(mockExeca).toHaveBeenCalledWith(
      'npx',
      [
        'vitest',
        'run',
        '--coverage',
        '--coverage.reportsDirectory',
        '/tmp/custom-coverage',
      ],
      {
        stdio: 'pipe',
      }
    );

    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.COVERAGE_OUTPUT_DIR = originalEnv;
    } else {
      delete process.env.COVERAGE_OUTPUT_DIR;
    }
  });
});
