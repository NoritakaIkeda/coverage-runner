export interface CoverageResult {
  success: boolean;
  outputPath: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  duration?: number;
}

export interface Runner {
  runCoverage(): Promise<CoverageResult>;
}

export abstract class BaseRunner implements Runner {
  protected outputDir: string;

  constructor(outputDir: string = './coverage') {
    this.outputDir = process.env.COVERAGE_OUTPUT_DIR || outputDir;
  }

  abstract runCoverage(): Promise<CoverageResult>;

  protected createSuccessResult(outputPath: string, duration?: number): CoverageResult {
    const result: CoverageResult = {
      success: true,
      outputPath,
      exitCode: 0,
    };
    if (duration !== undefined) {
      result.duration = duration;
    }
    return result;
  }

  protected createFailureResult(
    outputPath: string,
    exitCode: number,
    stderr?: string,
    stdout?: string,
    duration?: number
  ): CoverageResult {
    const result: CoverageResult = {
      success: false,
      outputPath,
      exitCode,
    };
    if (stderr !== undefined) {
      result.stderr = stderr;
    }
    if (stdout !== undefined) {
      result.stdout = stdout;
    }
    if (duration !== undefined) {
      result.duration = duration;
    }
    return result;
  }
}