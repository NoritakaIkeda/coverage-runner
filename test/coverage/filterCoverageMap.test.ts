import { describe, it, expect } from 'vitest'
import { filterCoverageMap } from '../../src/coverage/filterCoverageMap.js'

describe('filterCoverageMap', () => {
  const createMockCoverageMap = () => ({
    '/project/src/index.ts': {
      path: '/project/src/index.ts',
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {}
    },
    '/project/src/utils.ts': {
      path: '/project/src/utils.ts', 
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {}
    },
    '/project/src/components/Button.spec.ts': {
      path: '/project/src/components/Button.spec.ts',
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {}
    },
    '/project/test/setup.ts': {
      path: '/project/test/setup.ts',
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {}
    },
    '/project/__tests__/integration.test.ts': {
      path: '/project/__tests__/integration.test.ts',
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {}
    }
  })

  it('should filter out files matching *.spec.ts pattern', () => {
    const coverageMap = createMockCoverageMap()
    const excludePatterns = ['**/*.spec.ts']

    const result = filterCoverageMap(coverageMap, excludePatterns)

    expect(Object.keys(result)).toEqual([
      '/project/src/index.ts',
      '/project/src/utils.ts',
      '/project/test/setup.ts',
      '/project/__tests__/integration.test.ts'
    ])
    expect(result['/project/src/components/Button.spec.ts']).toBeUndefined()
  })

  it('should filter out files matching **/__tests__/** pattern', () => {
    const coverageMap = createMockCoverageMap()
    const excludePatterns = ['**/__tests__/**']

    const result = filterCoverageMap(coverageMap, excludePatterns)

    expect(Object.keys(result)).toEqual([
      '/project/src/index.ts',
      '/project/src/utils.ts',
      '/project/src/components/Button.spec.ts',
      '/project/test/setup.ts'
    ])
    expect(result['/project/__tests__/integration.test.ts']).toBeUndefined()
  })

  it('should apply multiple exclude patterns', () => {
    const coverageMap = createMockCoverageMap()
    const excludePatterns = ['**/*.spec.ts', '**/test/**']

    const result = filterCoverageMap(coverageMap, excludePatterns)

    expect(Object.keys(result)).toEqual([
      '/project/src/index.ts',
      '/project/src/utils.ts',
      '/project/__tests__/integration.test.ts'
    ])
    expect(result['/project/src/components/Button.spec.ts']).toBeUndefined()
    expect(result['/project/test/setup.ts']).toBeUndefined()
  })

  it('should return original map when no patterns provided', () => {
    const coverageMap = createMockCoverageMap()
    const excludePatterns: string[] = []

    const result = filterCoverageMap(coverageMap, excludePatterns)

    expect(result).toEqual(coverageMap)
  })

  it('should return original map when patterns is undefined', () => {
    const coverageMap = createMockCoverageMap()

    const result = filterCoverageMap(coverageMap, undefined)

    expect(result).toEqual(coverageMap)
  })

  it('should handle patterns that do not match any files', () => {
    const coverageMap = createMockCoverageMap()
    const excludePatterns = ['**/*.xyz', '**/nonexistent/**']

    const result = filterCoverageMap(coverageMap, excludePatterns)

    expect(result).toEqual(coverageMap)
  })

  it('should handle empty coverage map', () => {
    const coverageMap = {}
    const excludePatterns = ['**/*.spec.ts']

    const result = filterCoverageMap(coverageMap, excludePatterns)

    expect(result).toEqual({})
  })
})