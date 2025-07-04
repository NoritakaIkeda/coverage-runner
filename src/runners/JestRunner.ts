import { execa } from 'execa';
import { BaseRunner, CoverageResult } from './Runner.js';
import { logger } from '../utils/logger.js';

export class JestRunner extends BaseRunner {
  public readonly command: string | undefined;

  constructor(command?: string) {
    super('./coverage');
    this.command = command;
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
        execaError.exitCode ?? 1,
        execaError.stderr,
        execaError.stdout,
        duration
      );
    }
  }
}
