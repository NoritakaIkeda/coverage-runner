/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import * as path from 'path';
import istanbulLibCoverage from 'istanbul-lib-coverage';
import { logger } from '../utils/logger.js';

const { createCoverageMap } = istanbulLibCoverage;
type CoverageMap = istanbulLibCoverage.CoverageMap;

export function normalizeCoveragePaths(
  coverageMap: CoverageMap,
  rootDir?: string
): CoverageMap {
  logger.debug('Normalizing coverage paths');

  // Create a new empty coverage map
  const normalizedCoverage = createCoverageMap();
  const pathGroups = new Map<string, string[]>();

  // Group paths by their normalized form
  for (const filePath of Object.keys(coverageMap.data)) {
    const normalizedPath = normalizePath(filePath, rootDir);

    if (!pathGroups.has(normalizedPath)) {
      pathGroups.set(normalizedPath, []);
    }
    pathGroups.get(normalizedPath)!.push(filePath);
  }

  // Process each group
  for (const [normalizedPath, originalPaths] of pathGroups) {
    if (originalPaths.length === 1 && originalPaths[0] !== undefined && originalPaths[0] !== '') {
      // Single file, just add with normalized path
      const originalFileCoverage = coverageMap.data[originalPaths[0]];
      if (!originalFileCoverage) continue;
      const actualData =
        (originalFileCoverage as any).data ?? originalFileCoverage;
      const normalizedFileCoverage = { ...actualData } as any;
      normalizedFileCoverage.path = normalizedPath;

      // Create a temporary coverage map with this single file
      const tempCoverageData = {
        [normalizedPath]: normalizedFileCoverage,
      } as any;
      const tempCoverageMap = createCoverageMap(tempCoverageData);

      // Merge into the normalized coverage
      normalizedCoverage.merge(tempCoverageMap);
    } else {
      // Multiple files map to same normalized path - merge them
      logger.debug(
        `Merging ${originalPaths.length} files into ${normalizedPath}`
      );

      // Create individual coverage maps for each file and merge them
      const firstPath = originalPaths[0];
      if (firstPath === undefined || firstPath === null || firstPath === '') continue;
      const baseFileCoverage = coverageMap.data[firstPath];
      if (!baseFileCoverage) continue;
      const baseData = (baseFileCoverage as any).data ?? baseFileCoverage;
      let mergedData = { ...baseData } as any;
      mergedData.path = normalizedPath;

      // Merge data from other files
      for (let i = 1; i < originalPaths.length; i++) {
        const otherPath = originalPaths[i];
        if (otherPath === undefined || otherPath === null || otherPath === '') continue;
        const otherFileCoverage = coverageMap.data[otherPath];
        if (!otherFileCoverage) continue;
        const otherData = (otherFileCoverage as any).data ?? otherFileCoverage;

        // Merge statement hit counts
        for (const [statementId, hits] of Object.entries(
          (otherData as any).s ?? {}
        )) {
          if (mergedData.s !== undefined && mergedData.s !== null && mergedData.s[statementId] !== undefined) {
            mergedData.s[statementId] += hits as number;
          } else if (mergedData.s !== undefined && mergedData.s !== null) {
            mergedData.s[statementId] = hits as number;
          }
        }

        // Merge function hit counts
        for (const [funcId, hits] of Object.entries(
          (otherData as any).f ?? {}
        )) {
          if (mergedData.f !== undefined && mergedData.f !== null && mergedData.f[funcId] !== undefined) {
            mergedData.f[funcId] += hits as number;
          } else if (mergedData.f !== undefined && mergedData.f !== null) {
            mergedData.f[funcId] = hits as number;
          }
        }

        // Merge branch hit counts (arrays)
        for (const [branchId, branchHits] of Object.entries(
          (otherData as any).b ?? {}
        )) {
          if (
            mergedData.b?.[branchId] !== undefined && mergedData.b?.[branchId] !== null &&
            Array.isArray(branchHits) &&
            Array.isArray(mergedData.b[branchId])
          ) {
            const existingBranch = mergedData.b[branchId] as number[];
            for (let j = 0; j < (branchHits as number[]).length; j++) {
              const branchHit = (branchHits as number[])[j];
              const currentValue = existingBranch[j];
              if (currentValue !== undefined) {
                existingBranch[j] = currentValue + (branchHit ?? 0);
              } else {
                existingBranch[j] = branchHit ?? 0;
              }
            }
          } else if (mergedData.b !== undefined && mergedData.b !== null) {
            mergedData.b[branchId] = branchHits;
          }
        }
      }

      // Create a temporary coverage map with the merged file
      const tempCoverageData = { [normalizedPath]: mergedData } as any;
      const tempCoverageMap = createCoverageMap(tempCoverageData);

      // Merge into the normalized coverage
      normalizedCoverage.merge(tempCoverageMap);
    }
  }

  logger.debug(
    `Normalized ${Object.keys(coverageMap.data).length} paths to ${Object.keys(normalizedCoverage.data).length} unique paths`
  );
  return normalizedCoverage;
}

function normalizePath(filePath: string, rootDir?: string): string {
  // Handle empty or invalid paths
  if (!filePath) {
    return filePath;
  }

  let normalizedPath = filePath;

  // If rootDir is provided and path is absolute, make it relative to rootDir
  if (rootDir !== undefined && rootDir !== null && rootDir !== '' && path.isAbsolute(filePath)) {
    try {
      normalizedPath = path.relative(rootDir, filePath);
    } catch {
      // If relative path calculation fails, keep original
      normalizedPath = filePath;
    }
  }

  // Resolve relative path components (., .., etc.)
  try {
    if (path.isAbsolute(normalizedPath)) {
      normalizedPath = path.resolve(normalizedPath);
    } else {
      normalizedPath = path.normalize(normalizedPath);
    }
  } catch {
    // If normalization fails, keep original
    return filePath;
  }

  // Ensure consistent separators (always use forward slashes)
  normalizedPath = normalizedPath.replace(/\\/g, '/');

  // Remove leading './' if present
  if (normalizedPath.startsWith('./')) {
    normalizedPath = normalizedPath.substring(2);
  }

  return normalizedPath;
}
