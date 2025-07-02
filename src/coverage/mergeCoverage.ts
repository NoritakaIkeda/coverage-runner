import istanbulLibCoverage from 'istanbul-lib-coverage';

const { createCoverageMap } = istanbulLibCoverage;
type CoverageMap = istanbulLibCoverage.CoverageMap;
type CoverageMapData = istanbulLibCoverage.CoverageMapData;

export type CoverageData = CoverageMapData;

export function mergeCoverage(coverageObjects: CoverageData[]): CoverageMap {
  const coverageMap = createCoverageMap();

  for (const coverage of coverageObjects) {
    coverageMap.merge(coverage);
  }

  return coverageMap;
}
