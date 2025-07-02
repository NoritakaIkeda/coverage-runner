import { promises as fs } from 'fs'
import { join } from 'path'
import { createCoverageMap } from 'istanbul-lib-coverage'
import { filterCoverageMap } from './filterCoverageMap.js'
import { mergeCoverage } from './mergeCoverage.js'
import type { Config } from '../types/config.js'
import type { CoverageMap } from 'istanbul-lib-coverage'

export interface RunnerResult {
  runner: string
  coverageMap: CoverageMap
}

export async function executeWithMergeStrategy(
  config: Config,
  runnerResults: RunnerResult[],
  outputDir: string
): Promise<void> {
  const mergeStrategy = config.mergeStrategy ?? 'merge'

  if (mergeStrategy === 'separate') {
    await writeSeparateFiles(config, runnerResults, outputDir)
  } else {
    await writeMergedFile(config, runnerResults, outputDir)
  }
}

async function writeMergedFile(
  config: Config,
  runnerResults: RunnerResult[],
  outputDir: string
): Promise<void> {
  const coverageMaps = runnerResults.map(result => {
    const filteredMap = filterCoverageMap(result.coverageMap, config.excludePatterns)
    return createCoverageMap(filteredMap)
  })

  if (coverageMaps.length === 0) {
    return
  }

  const coverageDataArray = coverageMaps.map(map => map.toJSON())
  const merged = mergeCoverage(coverageDataArray)

  const outputPath = join(outputDir, 'coverage-merged.json')
  await fs.writeFile(outputPath, JSON.stringify(merged.toJSON(), null, 2))
}

async function writeSeparateFiles(
  config: Config,
  runnerResults: RunnerResult[],
  outputDir: string
): Promise<void> {
  for (const result of runnerResults) {
    const filteredMap = filterCoverageMap(result.coverageMap, config.excludePatterns)
    const outputPath = join(outputDir, `coverage-${result.runner}.json`)
    await fs.writeFile(outputPath, JSON.stringify(filteredMap, null, 2))
  }
}