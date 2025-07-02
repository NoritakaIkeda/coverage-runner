import { TestRunner } from '../utils/detectRunners';
import { Runner } from './Runner';
import { JestRunner } from './JestRunner';
import { VitestRunner } from './VitestRunner';
import { DummyRunner } from './DummyRunner';

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
        throw new Error(`Unknown runner type: ${runnerType}`);
    }
  }

  static createDummyRunner(): Runner {
    return new DummyRunner();
  }
}