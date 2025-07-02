import {
  createCoverageMap,
  CoverageMap,
  CoverageMapData,
} from 'istanbul-lib-coverage';

export type CoverageData = CoverageMapData;

export function mergeCoverage(coverageObjects: CoverageData[]): CoverageMap {
  const coverageMap = createCoverageMap();

  for (const coverage of coverageObjects) {
    coverageMap.merge(coverage);
  }

  return coverageMap;
}
