import * as fs from 'fs';
import * as path from 'path';

export type TestRunner = 'jest' | 'vitest' | 'mocha' | 'ava';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function detectRunners(directory: string): TestRunner[] {
  const packageJsonPath = path.join(directory, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return [];
  }

  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;

    const dependencies = packageJson.dependencies ?? {};
    const devDependencies = packageJson.devDependencies ?? {};
    const allDependencies = { ...dependencies, ...devDependencies };

    const detectedRunners: TestRunner[] = [];

    if ('jest' in allDependencies) {
      detectedRunners.push('jest');
    }

    if ('vitest' in allDependencies) {
      detectedRunners.push('vitest');
    }

    if ('mocha' in allDependencies) {
      detectedRunners.push('mocha');
    }

    if ('ava' in allDependencies) {
      detectedRunners.push('ava');
    }

    return detectedRunners;
  } catch {
    return [];
  }
}
