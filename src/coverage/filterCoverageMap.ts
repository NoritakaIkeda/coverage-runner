import micromatch from 'micromatch'
import type { CoverageMap } from 'istanbul-lib-coverage'

export function filterCoverageMap(
  coverageMap: CoverageMap, 
  excludePatterns?: string[]
): CoverageMap {
  if (!excludePatterns || excludePatterns.length === 0) {
    return coverageMap
  }

  const filteredMap: CoverageMap = {}
  
  for (const [filePath, coverage] of Object.entries(coverageMap)) {
    const isExcluded = micromatch.isMatch(filePath, excludePatterns)
    
    if (!isExcluded) {
      filteredMap[filePath] = coverage as CoverageMap[string]
    }
  }

  return filteredMap
}