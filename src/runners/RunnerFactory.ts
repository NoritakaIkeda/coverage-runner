import { TestRunner } from '../utils/detectRunners.js';
import { Runner } from './Runner.js';
import { JestRunner } from './JestRunner.js';
import { VitestRunner } from './VitestRunner.js';
import { DummyRunner } from './DummyRunner.js';

export class RunnerFactory {
  static createRunner(runnerType: TestRunner): Runner {
    switch (runnerType) {
      case 'jest':
        return new JestRunner();
      case 'vitest':
        return new VitestRunner();
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

  static createDummyRunner(): Runner {
    return new DummyRunner();
  }
}
