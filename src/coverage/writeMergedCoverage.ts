import * as fs from 'fs';
import * as path from 'path';
import { CoverageMap } from 'istanbul-lib-coverage';
import { createContext } from 'istanbul-lib-report';
import { create } from 'istanbul-reports';
import { logger } from '../utils/logger';

export interface WriteMergedCoverageOptions {
  outDir: string;
  jsonOnly?: boolean;
}

export function writeMergedCoverage(
  coverageMap: CoverageMap,
  options: WriteMergedCoverageOptions
): void {
  const { outDir, jsonOnly = false } = options;

  logger.debug(`Writing merged coverage to: ${outDir}`);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write JSON file
  const jsonFile = path.join(outDir, 'coverage-merged.json');
  const jsonData = JSON.stringify(coverageMap.data, null, 2);
  fs.writeFileSync(jsonFile, jsonData);
  logger.debug(`Written JSON coverage: ${jsonFile}`);

  // Write LCOV file unless jsonOnly is specified
  if (!jsonOnly) {
    const lcovFile = path.join(outDir, 'coverage-merged.lcov');
    
    try {
      // Create istanbul report context with coverage map
      const context = createContext({
        dir: outDir,
        coverageMap,
        watermarks: {
          statements: [50, 80],
          functions: [50, 80],
          branches: [50, 80],
          lines: [50, 80],
        },
      });

      // Create LCOV reporter
      const lcovReporter = create('lcovonly', {
        file: 'coverage-merged.lcov',
      });

      // Generate LCOV report
      lcovReporter.execute(context);
      logger.debug(`Written LCOV coverage: ${lcovFile}`);
    } catch {
      // Fallback: write simple LCOV format manually
      logger.debug('Failed to use istanbul reports, writing simple LCOV format');
      let lcovContent = '';
      
      for (const filePath of Object.keys(coverageMap.data)) {
        const fileCoverage = coverageMap.data[filePath];
        lcovContent += `TN:\nSF:${filePath}\n`;
        
        // Add line data
        for (const [statementId, hits] of Object.entries(fileCoverage.s || {})) {
          const statement = fileCoverage.statementMap?.[statementId];
          if (statement) {
            lcovContent += `DA:${statement.start.line},${hits}\n`;
          }
        }
        
        lcovContent += 'end_of_record\n';
      }
      
      fs.writeFileSync(lcovFile, lcovContent);
      logger.debug(`Written fallback LCOV coverage: ${lcovFile}`);
    }
  }
}