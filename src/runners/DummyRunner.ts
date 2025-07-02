import { BaseRunner, CoverageResult } from './Runner';

export class DummyRunner extends BaseRunner {
  constructor() {
    super('./coverage');
  }

  async runCoverage(): Promise<CoverageResult> {
    const startTime = Date.now();

    // Simulate minimal processing time
    await new Promise(resolve => setTimeout(resolve, 1));

    const endTime = Date.now();
    const duration = endTime - startTime;

    return this.createSuccessResult(this.outputDir, duration);
  }
}
