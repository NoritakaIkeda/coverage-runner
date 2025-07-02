 
import * as fs from 'fs';
import istanbulLibCoverage from 'istanbul-lib-coverage';
import { logger } from '../../utils/logger.js';

const { createCoverageMap } = istanbulLibCoverage;
type CoverageMap = istanbulLibCoverage.CoverageMap;

export function loadLcov(filePath: string): CoverageMap {
  logger.debug(`Loading LCOV file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`LCOV file not found: ${filePath}`);
  }

  try {
    const lcovContent = fs.readFileSync(filePath, 'utf-8');

    if (!lcovContent.trim()) {
      logger.debug('LCOV file is empty, returning empty coverage map');
      return createCoverageMap();
    }

    const coverageMap = createCoverageMap();

    // Simple LCOV parser - parse line by line
    const lines = lcovContent.split('\n');
    let currentFile: string | null = null;
    let statementMap: Record<
      string,
      {
        start: { line: number; column: number };
        end: { line: number; column: number };
      }
    > = {};
    let s: Record<string, number> = {};
    let statementIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('SF:')) {
        // Source file
        currentFile = trimmedLine.substring(3);
        statementMap = {};
        s = {};
        statementIndex = 0;
      } else if (trimmedLine.startsWith('DA:') && currentFile) {
        // Line data: DA:line_number,hit_count
        const parts = trimmedLine.substring(3).split(',');
        if (parts.length >= 2) {
          const lineNumber = parseInt(parts[0] || '0', 10);
          const hitCount = parseInt(parts[1] || '0', 10);

          const statementId = statementIndex.toString();
          statementMap[statementId] = {
            start: { line: lineNumber, column: 0 },
            end: { line: lineNumber, column: 1000 },
          };
          s[statementId] = hitCount;
          statementIndex++;
        }
      } else if (trimmedLine === 'end_of_record' && currentFile) {
        // End of file record - add to coverage map
        const coverageData = {
          path: currentFile,
          statementMap,
          fnMap: {},
          branchMap: {},
          s,
          f: {},
          b: {},
        };

        coverageMap.addFileCoverage(coverageData);
        currentFile = null;
      }
    }

    return coverageMap;
  } catch (error) {
    throw new Error(`Failed to read LCOV file: ${error}`);
  }
}
