import { execa } from 'execa';
import { BaseRunner, CoverageResult } from './Runner';
import { logger } from '../utils/logger';

export class VitestRunner extends BaseRunner {
  constructor() {
    super('./coverage');
  }

  async runCoverage(): Promise<CoverageResult> {
    const startTime = Date.now();
    
    logger.debug('Running Vitest coverage...');
    
    try {
      const args = ['run', '--coverage', '--coverage.reportsDirectory', this.outputDir];
      
      logger.debug(`Executing: vitest ${args.join(' ')}`);
      
      const result = await execa('npx', ['vitest', ...args], {
        stdio: 'pipe',
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logger.debug(`Vitest completed successfully in ${duration}ms`);
      
      return this.createSuccessResult(this.outputDir, duration);
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logger.debug(`Vitest failed after ${duration}ms:`, error);
      
      return this.createFailureResult(
        this.outputDir,
        error.exitCode || 1,
        error.stderr,
        error.stdout,
        duration
      );
    }
  }
}