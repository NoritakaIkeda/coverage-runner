import { execa } from 'execa';
import { BaseRunner, CoverageResult } from './Runner.js';
import { logger } from '../utils/logger.js';

export class VitestRunner extends BaseRunner {
  constructor() {
    super('./coverage');
  }

  async runCoverage(): Promise<CoverageResult> {
    const startTime = Date.now();

    logger.debug('Running Vitest coverage...');

    try {
      const args = [
        'run',
        '--coverage',
        '--coverage.reportsDirectory',
        this.outputDir,
      ];

      logger.debug(`Executing: vitest ${args.join(' ')}`);

      await execa('npx', ['vitest', ...args], {
        stdio: 'pipe',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.debug(`Vitest completed successfully in ${duration}ms`);

      return this.createSuccessResult(this.outputDir, duration);
    } catch (error: unknown) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.debug(`Vitest failed after ${duration}ms:`, error);

      const execaError = error as {
        exitCode?: number;
        stderr?: string;
        stdout?: string;
      };
      return this.createFailureResult(
        this.outputDir,
        execaError.exitCode || 1,
        execaError.stderr,
        execaError.stdout,
        duration
      );
    }
  }
}
