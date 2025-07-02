import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { loadConfig } from '../../src/config/load.js'

describe('loadConfig', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await fs.mkdtemp(join(tmpdir(), 'coverage-runner-test-'))
  })

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true })
  })

  it('should automatically load coverage.config.js when it exists', async () => {
    const configPath = join(testDir, 'coverage.config.js')
    const configContent = `
      module.exports = {
        runnerOverrides: {
          jest: "jest --config custom.config.js"
        },
        excludePatterns: ["**/*.spec.ts"],
        mergeStrategy: "merge"
      }
    `
    await fs.writeFile(configPath, configContent)

    const config = await loadConfig(testDir)

    expect(config).toEqual({
      runnerOverrides: {
        jest: "jest --config custom.config.js"
      },
      excludePatterns: ["**/*.spec.ts"],
      mergeStrategy: "merge"
    })
  })

  it('should automatically load .coverage-config.json when it exists', async () => {
    const configPath = join(testDir, '.coverage-config.json')
    const configContent = {
      runnerOverrides: {
        vitest: "vitest --config vitest.custom.config.js"
      },
      excludePatterns: ["**/__tests__/**"],
      mergeStrategy: "separate"
    }
    await fs.writeFile(configPath, JSON.stringify(configContent, null, 2))

    const config = await loadConfig(testDir)

    expect(config).toEqual(configContent)
  })

  it('should prioritize explicit config path over automatic discovery', async () => {
    // Create automatic config
    const autoConfigPath = join(testDir, 'coverage.config.js')
    await fs.writeFile(autoConfigPath, `
      module.exports = {
        mergeStrategy: "merge"
      }
    `)

    // Create explicit config
    const explicitConfigPath = join(testDir, 'custom.json')
    const explicitConfig = {
      runnerOverrides: {
        jest: "jest --config explicit.config.js"
      },
      mergeStrategy: "separate"
    }
    await fs.writeFile(explicitConfigPath, JSON.stringify(explicitConfig, null, 2))

    const config = await loadConfig(testDir, explicitConfigPath)

    expect(config).toEqual(explicitConfig)
  })

  it('should return default config when no config file exists', async () => {
    const config = await loadConfig(testDir)

    expect(config).toEqual({})
  })

  it('should return default config when explicit path does not exist', async () => {
    const config = await loadConfig(testDir, join(testDir, 'nonexistent.json'))

    expect(config).toEqual({})
  })
})