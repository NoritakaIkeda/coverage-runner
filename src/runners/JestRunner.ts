import { execa } from 'execa';
import { BaseRunner, CoverageResult } from './Runner';
import { logger } from '../utils/logger';

export class JestRunner extends BaseRunner {
  constructor() {
    super('./coverage');
  }

  async runCoverage(): Promise<CoverageResult> {
    const startTime = Date.now();

    logger.debug('Running Jest coverage...');

    try {
      const args = ['--coverage', '--coverageDirectory', this.outputDir];

      logger.debug(`Executing: jest ${args.join(' ')}`);

      await execa('npx', ['jest', ...args], {
        stdio: 'pipe',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.debug(`Jest completed successfully in ${duration}ms`);

      return this.createSuccessResult(this.outputDir, duration);
    } catch (error: unknown) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.debug(`Jest failed after ${duration}ms:`, error);

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
