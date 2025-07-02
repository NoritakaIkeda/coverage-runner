import micromatch from 'micromatch'
import { createCoverageMap } from 'istanbul-lib-coverage'
import type { CoverageMap, CoverageMapData } from 'istanbul-lib-coverage'

export function filterCoverageMap(
  coverageMap: CoverageMap | CoverageMapData, 
  excludePatterns?: string[]
): CoverageMap {
  if (!excludePatterns || excludePatterns.length === 0) {
    return typeof coverageMap.toJSON === 'function' 
      ? coverageMap as CoverageMap 
      : createCoverageMap(coverageMap as CoverageMapData)
  }

  const filteredData: CoverageMapData = {}
  const coverageData = typeof coverageMap.toJSON === 'function'
    ? (coverageMap as CoverageMap).toJSON()
    : coverageMap as CoverageMapData
  
  for (const [filePath, coverage] of Object.entries(coverageData)) {
    const isExcluded = micromatch.isMatch(filePath, excludePatterns)
    
    if (!isExcluded) {
      filteredData[filePath] = coverage
    }
  }

  return createCoverageMap(filteredData)
}