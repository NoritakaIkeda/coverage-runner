import { promises as fs } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';
import { detectRunners } from './detectRunners';
import { RunnerFactory } from '../runners/RunnerFactory';
import { mergeCoverageFiles } from '../commands/mergeCoverage';
import { loadConfig } from '../config/load';

export interface CloneOptions {
  outputDir: string;
  cleanup?: boolean;
  branch?: string | undefined;
  installDependencies?: boolean;
  timeout?: number;
}

export interface CloneResult {
  success: boolean;
  error?: string | undefined;
  outputDir: string;
  clonedPath?: string | undefined;
  branch?: string | undefined;
  runners?: string[] | undefined;
  coverageFiles?: string[] | undefined;
}

/**
 * Clone a repository and execute coverage analysis
 */
export async function executeInClonedRepo(
  repoUrl: string,
  options: CloneOptions
): Promise<CloneResult> {
  const {
    outputDir,
    cleanup = true,
    branch,
    installDependencies = true,
    timeout = 300000, // 5 minutes default
  } = options;

  let clonedPath: string | undefined;

  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Generate unique clone directory
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    clonedPath = resolve(
      tmpdir(),
      `coverage-runner-clone-${timestamp}-${randomSuffix}`
    );

    // Clone repository
    console.log(`🔄 Cloning repository: ${repoUrl}`);
    await cloneRepository(repoUrl, clonedPath, branch, timeout);

    // Verify repository was cloned successfully
    await fs.access(clonedPath);
    const packageJsonPath = resolve(clonedPath, 'package.json');

    // Check if package.json exists
    try {
      await fs.access(packageJsonPath);
    } catch {
      return {
        success: false,
        error: 'Repository does not contain a package.json file',
        outputDir,
        clonedPath,
      };
    }

    // Install dependencies if requested
    if (installDependencies) {
      console.log('📦 Installing dependencies...');
      try {
        await installProjectDependencies(clonedPath, timeout);
      } catch (error) {
        return {
          success: false,
          error: `Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`,
          outputDir,
          clonedPath,
        };
      }
    }

    // Load configuration if present
    const config = await loadConfig(clonedPath);

    // Detect test runners
    console.log('🔍 Detecting test runners...');
    const runners = detectRunners(clonedPath);

    if (runners.length === 0) {
      return {
        success: false,
        error:
          'No test runners detected in the repository. Supported: Jest, Vitest',
        outputDir,
        clonedPath,
      };
    }

    console.log(`✅ Detected runners: ${runners.join(', ')}`);

    // Run coverage for each detected runner
    const coverageFiles: string[] = [];
    const runnerFactory = new RunnerFactory(config);

    for (const runnerName of runners) {
      console.log(`🏃 Running ${runnerName} coverage...`);

      try {
        const runner = runnerFactory.createRunner(runnerName);
        const result = await runner.runCoverage();

        if (result.success && result.outputPath) {
          // Look for coverage-final.json in the output directory
          const coverageJsonPath = resolve(
            clonedPath,
            result.outputPath,
            'coverage-final.json'
          );
          try {
            await fs.access(coverageJsonPath);
            coverageFiles.push(coverageJsonPath);
            console.log(`✅ ${runnerName} coverage completed`);
          } catch {
            console.warn(
              `⚠️ ${runnerName} coverage file not found at ${coverageJsonPath}`
            );
          }
        } else {
          console.warn(
            `⚠️ ${runnerName} coverage failed: ${result.stderr ?? 'Unknown error'}`
          );
        }
      } catch (error) {
        console.warn(
          `⚠️ ${runnerName} coverage failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (coverageFiles.length === 0) {
      return {
        success: false,
        error: 'No coverage files were generated successfully',
        outputDir,
        clonedPath,
        runners,
      };
    }

    // Merge coverage files
    console.log('🔄 Merging coverage reports...');
    const mergeResult = await mergeCoverageFiles({
      inputPatterns: coverageFiles,
      outputDir,
      jsonOnly: false,
      normalizePaths: true,
    });

    if (!mergeResult.success) {
      return {
        success: false,
        error: `Failed to merge coverage files: ${mergeResult.error ?? 'Unknown error'}`,
        outputDir,
        clonedPath,
        runners,
        coverageFiles,
      };
    }

    console.log('✅ Coverage analysis completed successfully!');

    return {
      success: true,
      outputDir,
      clonedPath,
      branch,
      runners,
      coverageFiles,
    };
  } catch (error) {
    let errorMessage = 'Unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error types
      if (error.message.includes('ENOSPC')) {
        errorMessage = 'Failed to clone repository: insufficient disk space';
      } else if (error.message.includes('EACCES')) {
        errorMessage = 'Failed to clone repository: permission denied';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Operation timed out';
      } else if (error.message.includes('git clone')) {
        errorMessage =
          'Failed to clone repository: invalid URL or network error';
      }
    }

    return {
      success: false,
      error: errorMessage,
      outputDir,
      clonedPath,
    };
  } finally {
    // Cleanup cloned directory if requested
    if (cleanup && clonedPath) {
      try {
        console.log('🧹 Cleaning up cloned repository...');
        await fs.rm(clonedPath, { recursive: true, force: true });
      } catch (error) {
        console.warn(
          `Warning: Failed to cleanup cloned directory: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
}

/**
 * Clone a git repository to the specified directory
 */
async function cloneRepository(
  repoUrl: string,
  targetPath: string,
  branch?: string,
  timeout = 300000
): Promise<void> {
  const branchFlag =
    branch !== null && branch !== undefined && branch !== ''
      ? `-b ${branch}`
      : '';
  const command = `git clone ${branchFlag} --depth 1 "${repoUrl}" "${targetPath}"`;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Git clone operation timed out after ${timeout}ms`));
    }, timeout);

    try {
      execSync(command, {
        stdio: 'pipe',
        timeout,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });
      clearTimeout(timer);
      resolve();
    } catch (error) {
      clearTimeout(timer);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Install project dependencies
 */
async function installProjectDependencies(
  projectPath: string,
  timeout = 300000
): Promise<void> {
  // Check if package-lock.json, yarn.lock, or pnpm-lock.yaml exists
  const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
  let packageManager = 'npm';

  for (const lockFile of lockFiles) {
    try {
      await fs.access(resolve(projectPath, lockFile));
      if (lockFile.includes('yarn')) {
        packageManager = 'yarn';
      } else if (lockFile.includes('pnpm')) {
        packageManager = 'pnpm';
      }
      break;
    } catch {
      // Lock file doesn't exist, continue checking
    }
  }

  const installCommand =
    packageManager === 'yarn'
      ? 'yarn install --frozen-lockfile'
      : packageManager === 'pnpm'
        ? 'pnpm install --frozen-lockfile'
        : 'npm ci';

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Package installation timed out after ${timeout}ms`));
    }, timeout);

    try {
      execSync(installCommand, {
        cwd: projectPath,
        stdio: 'pipe',
        timeout,
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for large installs
      });
      clearTimeout(timer);
      resolve();
    } catch (error) {
      clearTimeout(timer);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
