import * as fs from 'fs';
import * as path from 'path';

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
): boolean {
  return dependencyNames.some(name => name in allDependencies);
}

function checkScripts(
  scripts: Record<string, string>,
  scriptKeywords: string[]
): boolean {
  const allScripts = Object.values(scripts).join(' ').toLowerCase();
  return scriptKeywords.some(keyword =>
    allScripts.includes(keyword.toLowerCase())
  );
}

export function detectRunners(packageJsonPath?: string): TestRunner[] {
  const resolvedPath =
    packageJsonPath ?? path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(resolvedPath)) {
    return [];
  }

  try {
    const packageJsonContent = fs.readFileSync(resolvedPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;

    const dependencies = packageJson.dependencies ?? {};
    const devDependencies = packageJson.devDependencies ?? {};
    const scripts = packageJson.scripts ?? {};

    const allDependencies = { ...dependencies, ...devDependencies };

    const detectedRunners: TestRunner[] = [];

    for (const [runner, config] of Object.entries(RUNNER_DETECTION_MAP)) {
      const hasDependency = checkDependencies(
        allDependencies,
        config.dependencyNames
      );
      const hasScript = checkScripts(scripts, config.scriptKeywords);

      if (hasDependency || hasScript) {
        detectedRunners.push(runner as TestRunner);
      }
    }

    return detectedRunners;
  } catch {
    return [];
  }
}

export function detectRunnersFromDirectory(directory: string): TestRunner[] {
  const packageJsonPath = path.join(directory, 'package.json');
  return detectRunners(packageJsonPath);
}
