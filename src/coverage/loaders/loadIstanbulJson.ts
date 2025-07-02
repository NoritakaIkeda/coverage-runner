/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import * as fs from 'fs';
import istanbulLibCoverage from 'istanbul-lib-coverage';
import { logger } from '../../utils/logger.js';

const { createCoverageMap } = istanbulLibCoverage;
type CoverageMap = istanbulLibCoverage.CoverageMap;

export function loadIstanbulJson(filePath: string): CoverageMap {
  logger.debug(`Loading Istanbul JSON file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Istanbul JSON file not found: ${filePath}`);
  }

  try {
    const jsonContent = fs.readFileSync(filePath, 'utf-8');

    if (!jsonContent.trim()) {
      logger.debug('Istanbul JSON file is empty, returning empty coverage map');
      return createCoverageMap();
    }

    const coverageData = JSON.parse(jsonContent);
    const coverageMap = createCoverageMap(coverageData);

    return coverageMap;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in Istanbul file: ${error.message}`);
    }
    throw new Error(`Failed to read Istanbul JSON file: ${error}`);
  }
}
