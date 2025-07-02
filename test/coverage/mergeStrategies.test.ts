import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { executeWithMergeStrategy } from '../../src/coverage/mergeStrategies.js'
import type { Config } from '../../src/types/config.js'

describe('executeWithMergeStrategy', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await fs.mkdtemp(join(tmpdir(), 'coverage-merge-test-'))
  })

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true })
  })

  it('should create single merged file when mergeStrategy is "merge"', async () => {
    const config: Config = {
      mergeStrategy: 'merge'
    }

    // Create mock coverage files
    const jestCoverage = {
      '/project/src/index.ts': {
        path: '/project/src/index.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      }
    }

    const vitestCoverage = {
      '/project/src/utils.ts': {
        path: '/project/src/utils.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      }
    }

    const runnerResults = [
      { runner: 'jest', coverageMap: jestCoverage },
      { runner: 'vitest', coverageMap: vitestCoverage }
    ]

    await executeWithMergeStrategy(config, runnerResults, testDir)

    // Check that only merged file exists
    const files = await fs.readdir(testDir)
    expect(files).toContain('coverage-merged.json')
    expect(files).not.toContain('coverage-jest.json')
    expect(files).not.toContain('coverage-vitest.json')

    // Verify merged content
    const mergedContent = await fs.readFile(join(testDir, 'coverage-merged.json'), 'utf-8')
    const merged = JSON.parse(mergedContent)
    expect(merged).toHaveProperty('/project/src/index.ts')
    expect(merged).toHaveProperty('/project/src/utils.ts')
  })

  it('should create separate files when mergeStrategy is "separate"', async () => {
    const config: Config = {
      mergeStrategy: 'separate'
    }

    const jestCoverage = {
      '/project/src/index.ts': {
        path: '/project/src/index.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      }
    }

    const vitestCoverage = {
      '/project/src/utils.ts': {
        path: '/project/src/utils.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      }
    }

    const runnerResults = [
      { runner: 'jest', coverageMap: jestCoverage },
      { runner: 'vitest', coverageMap: vitestCoverage }
    ]

    await executeWithMergeStrategy(config, runnerResults, testDir)

    // Check that separate files exist
    const files = await fs.readdir(testDir)
    expect(files).toContain('coverage-jest.json')
    expect(files).toContain('coverage-vitest.json')
    expect(files).not.toContain('coverage-merged.json')

    // Verify separate content
    const jestContent = await fs.readFile(join(testDir, 'coverage-jest.json'), 'utf-8')
    const jestJson = JSON.parse(jestContent)
    expect(jestJson).toHaveProperty('/project/src/index.ts')
    expect(jestJson).not.toHaveProperty('/project/src/utils.ts')

    const vitestContent = await fs.readFile(join(testDir, 'coverage-vitest.json'), 'utf-8')
    const vitestJson = JSON.parse(vitestContent)
    expect(vitestJson).toHaveProperty('/project/src/utils.ts')
    expect(vitestJson).not.toHaveProperty('/project/src/index.ts')
  })

  it('should default to "merge" strategy when not specified', async () => {
    const config: Config = {}

    const jestCoverage = {
      '/project/src/index.ts': {
        path: '/project/src/index.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      }
    }

    const runnerResults = [
      { runner: 'jest', coverageMap: jestCoverage }
    ]

    await executeWithMergeStrategy(config, runnerResults, testDir)

    // Should default to merge behavior
    const files = await fs.readdir(testDir)
    expect(files).toContain('coverage-merged.json')
    expect(files).not.toContain('coverage-jest.json')
  })

  it('should apply excludePatterns before merging', async () => {
    const config: Config = {
      mergeStrategy: 'merge',
      excludePatterns: ['**/*.spec.ts']
    }

    const jestCoverage = {
      '/project/src/index.ts': {
        path: '/project/src/index.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      },
      '/project/src/index.spec.ts': {
        path: '/project/src/index.spec.ts',
        statementMap: { '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } },
        fnMap: {},
        branchMap: {},
        s: { '0': 1 },
        f: {},
        b: {}
      }
    }

    const runnerResults = [
      { runner: 'jest', coverageMap: jestCoverage }
    ]

    await executeWithMergeStrategy(config, runnerResults, testDir)

    // Verify that spec files are excluded
    const mergedContent = await fs.readFile(join(testDir, 'coverage-merged.json'), 'utf-8')
    const merged = JSON.parse(mergedContent)
    expect(merged).toHaveProperty('/project/src/index.ts')
    expect(merged).not.toHaveProperty('/project/src/index.spec.ts')
  })
})