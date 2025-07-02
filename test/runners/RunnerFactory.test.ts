import { describe, it, expect } from 'vitest'
import { RunnerFactory } from '../../src/runners/RunnerFactory.js'
import type { Config } from '../../src/types/config.js'

describe('RunnerFactory with config overrides', () => {
  it('should create JestRunner with custom command override', async () => {
    const config: Config = {
      runnerOverrides: {
        jest: "jest --config custom.config.js"
      }
    }

    const factory = new RunnerFactory(config)
    const runner = factory.createRunner('jest')

    expect(runner).toBeDefined()
    expect(runner.constructor.name).toBe('JestRunner')
    
    // Check that the runner has the custom command
    const runnerWithCommand = runner as { command?: string }
    expect(runnerWithCommand.command).toBe("jest --config custom.config.js")
  })

  it('should create VitestRunner with custom command override', async () => {
    const config: Config = {
      runnerOverrides: {
        vitest: "vitest --config vitest.custom.config.js"
      }
    }

    const factory = new RunnerFactory(config)
    const runner = factory.createRunner('vitest')

    expect(runner).toBeDefined()
    expect(runner.constructor.name).toBe('VitestRunner')
    
    // Check that the runner has the custom command
    const runnerWithCommand = runner as { command?: string }
    expect(runnerWithCommand.command).toBe("vitest --config vitest.custom.config.js")
  })

  it('should use default command when no override is specified', async () => {
    const config: Config = {}

    const factory = new RunnerFactory(config)
    const jestRunner = factory.createRunner('jest')
    const vitestRunner = factory.createRunner('vitest')

    expect(jestRunner).toBeDefined()
    expect(vitestRunner).toBeDefined()
    
    // Should use default commands (no custom command set)
    const jestWithCommand = jestRunner as { command?: string }
    const vitestWithCommand = vitestRunner as { command?: string }
    
    expect(jestWithCommand.command).toBeUndefined()
    expect(vitestWithCommand.command).toBeUndefined()
  })

  it('should use default command when config is not provided', async () => {
    const factory = new RunnerFactory()
    const runner = factory.createRunner('jest')

    expect(runner).toBeDefined()
    expect(runner.constructor.name).toBe('JestRunner')
    
    const runnerWithCommand = runner as { command?: string }
    expect(runnerWithCommand.command).toBeUndefined()
  })

  it('should ignore overrides for unspecified runners', async () => {
    const config: Config = {
      runnerOverrides: {
        jest: "jest --config custom.config.js"
      }
    }

    const factory = new RunnerFactory(config)
    const vitestRunner = factory.createRunner('vitest')

    expect(vitestRunner).toBeDefined()
    expect(vitestRunner.constructor.name).toBe('VitestRunner')
    
    const runnerWithCommand = vitestRunner as { command?: string }
    expect(runnerWithCommand.command).toBeUndefined()
  })
})