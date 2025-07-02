import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

export type TestRunner = 'jest' | 'vitest' | 'mocha' | 'ava';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

interface RunnerDetectionConfig {
  dependencyNames: string[];
  scriptKeywords: string[];
}

const RUNNER_DETECTION_MAP: Record<TestRunner, RunnerDetectionConfig> = {
  jest: {
    dependencyNames: ['jest', '@jest/core'],
    scriptKeywords: ['jest'],
  },
  vitest: {
    dependencyNames: ['vitest'],
    scriptKeywords: ['vitest'],
  },
  mocha: {
    dependencyNames: ['mocha'],
    scriptKeywords: ['mocha'],
  },
  ava: {
    dependencyNames: ['ava'],
    scriptKeywords: ['ava'],
  },
} as const;

function checkDependencies(
  allDependencies: Record<string, string>,
  dependencyNames: string[]
): { found: boolean; matchedDeps: string[] } {
  const matchedDeps = dependencyNames.filter(name => name in allDependencies);
  return {
    found: matchedDeps.length > 0,
    matchedDeps,
  };
}

function checkScripts(
  scripts: Record<string, string>,
  scriptKeywords: string[]
): {
  found: boolean;
  matchedScripts: Array<{ name: string; content: string }>;
} {
  const matchedScripts: Array<{ name: string; content: string }> = [];

  for (const [scriptName, scriptContent] of Object.entries(scripts)) {
    const hasKeyword = scriptKeywords.some(keyword =>
      scriptContent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      matchedScripts.push({ name: scriptName, content: scriptContent });
    }
  }

  return {
    found: matchedScripts.length > 0,
    matchedScripts,
  };
}

export function detectRunners(packageJsonPath?: string): TestRunner[] {
  const resolvedPath =
    packageJsonPath ?? path.join(process.cwd(), 'package.json');

  logger.debug(`Detecting test runners from: ${resolvedPath}`);

  if (!fs.existsSync(resolvedPath)) {
    logger.debug(`Package.json not found at: ${resolvedPath}`);
    return [];
  }

  try {
    const packageJsonContent = fs.readFileSync(resolvedPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;

    const dependencies = packageJson.dependencies ?? {};
    const devDependencies = packageJson.devDependencies ?? {};
    const scripts = packageJson.scripts ?? {};

    const allDependencies = { ...dependencies, ...devDependencies };

    logger.debug('Package.json contents:');
    logger.debug('- Dependencies:', Object.keys(dependencies));
    logger.debug('- DevDependencies:', Object.keys(devDependencies));
    logger.debug('- Scripts:', Object.keys(scripts));

    const detectedRunners: TestRunner[] = [];
    const detectionDetails: Array<{
      runner: TestRunner;
      foundVia: string[];
      matchedDeps: string[];
      matchedScripts: Array<{ name: string; content: string }>;
    }> = [];

    for (const [runner, config] of Object.entries(RUNNER_DETECTION_MAP)) {
      const depCheck = checkDependencies(
        allDependencies,
        config.dependencyNames
      );
      const scriptCheck = checkScripts(scripts, config.scriptKeywords);

      const foundVia: string[] = [];
      if (depCheck.found) foundVia.push('dependencies');
      if (scriptCheck.found) foundVia.push('scripts');

      if (depCheck.found || scriptCheck.found) {
        detectedRunners.push(runner as TestRunner);
        detectionDetails.push({
          runner: runner as TestRunner,
          foundVia,
          matchedDeps: depCheck.matchedDeps,
          matchedScripts: scriptCheck.matchedScripts,
        });
      }
    }

    logger.debug(`\nDetection Results:`);
    logger.debug(
      `Found ${detectedRunners.length} test runner(s): [${detectedRunners.join(', ')}]`
    );

    if (detectionDetails.length > 0) {
      logger.debug('\nDetailed Detection Information:');
      for (const detail of detectionDetails) {
        logger.debug(`\n${detail.runner.toUpperCase()}:`);
        logger.debug(`  Found via: ${detail.foundVia.join(', ')}`);

        if (detail.matchedDeps.length > 0) {
          logger.debug(
            `  Matched dependencies: ${detail.matchedDeps.join(', ')}`
          );
        }

        if (detail.matchedScripts.length > 0) {
          logger.debug(`  Matched scripts:`);
          for (const script of detail.matchedScripts) {
            logger.debug(`    - ${script.name}: "${script.content}"`);
          }
        }
      }
    }

    return detectedRunners;
  } catch (error) {
    logger.debug(`Error parsing package.json: ${String(error)}`);
    return [];
  }
}

export function detectRunnersFromDirectory(directory: string): TestRunner[] {
  const packageJsonPath = path.join(directory, 'package.json');
  return detectRunners(packageJsonPath);
}
