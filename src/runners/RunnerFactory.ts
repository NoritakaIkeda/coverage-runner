import { TestRunner } from '../utils/detectRunners.js';
import { Runner } from './Runner.js';
import { JestRunner } from './JestRunner.js';
import { VitestRunner } from './VitestRunner.js';
import { DummyRunner } from './DummyRunner.js';
import type { Config } from '../types/config.js';

export class RunnerFactory {
  private config: Config | undefined;

  constructor(config?: Config) {
    this.config = config;
  }

  createRunner(runnerType: TestRunner): Runner {
    const customCommand = this.config?.runnerOverrides?.[runnerType];

    switch (runnerType) {
      case 'jest':
        return new JestRunner(customCommand);
      case 'vitest':
        return new VitestRunner(customCommand);
      case 'mocha':
        // TODO: Implement MochaRunner
        throw new Error('Mocha runner not yet implemented');
      case 'ava':
        // TODO: Implement AvaRunner
        throw new Error('Ava runner not yet implemented');
      default:
        throw new Error(`Unknown runner type: ${String(runnerType)}`);
    }
  }

  createDummyRunner(): Runner {
    return new DummyRunner();
  }

  // Keep static methods for backward compatibility
  static createRunner(runnerType: TestRunner): Runner {
    return new RunnerFactory().createRunner(runnerType);
  }

  static createDummyRunner(): Runner {
    return new DummyRunner();
  }
}
