/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import istanbulLibCoverage from 'istanbul-lib-coverage';
import * as xml2js from 'xml2js';
import { logger } from '../../utils/logger.js';

const { createCoverageMap } = istanbulLibCoverage;
type CoverageMap = istanbulLibCoverage.CoverageMap;

export function loadCobertura(filePath: string): CoverageMap {
  logger.debug(`Loading Cobertura XML file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Cobertura file not found: ${filePath}`);
  }

  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const coverageMap = createCoverageMap();

    // Parse XML synchronously
    let parsedData: any;
    xml2js.parseString(xmlContent, { explicitArray: false }, (err, result) => {
      if (err) {
        throw new Error(`Failed to parse Cobertura XML: ${err.message}`);
      }
      parsedData = result;
    });

    if (!parsedData?.coverage) {
      logger.debug('No coverage data found in Cobertura XML');
      return coverageMap;
    }

    const coverage = parsedData.coverage;

    // Handle packages
    if (coverage.packages?.package) {
      const packages = Array.isArray(coverage.packages.package)
        ? coverage.packages.package
        : [coverage.packages.package];

      for (const pkg of packages) {
        if (pkg.classes?.class) {
          const classes = Array.isArray(pkg.classes.class)
            ? pkg.classes.class
            : [pkg.classes.class];

          for (const cls of classes) {
            const fileName = cls.$.filename || cls.$.name;

            if (!fileName) {
              continue;
            }

            // Build statement map and hit counts from line data
            const statementMap: Record<
              string,
              {
                start: { line: number; column: number };
                end: { line: number; column: number };
              }
            > = {};
            const s: Record<string, number> = {};

            if (cls.lines?.line) {
              const lines = Array.isArray(cls.lines.line)
                ? cls.lines.line
                : [cls.lines.line];

              lines.forEach((line: any, index: number) => {
                const statementId = index.toString();
                const lineNumber = parseInt(line.$.number, 10);
                const hits = parseInt(line.$.hits, 10);

                statementMap[statementId] = {
                  start: { line: lineNumber, column: 0 },
                  end: { line: lineNumber, column: 1000 },
                };
                s[statementId] = hits;
              });
            }

            const coverageData = {
              path: fileName,
              statementMap,
              fnMap: {},
              branchMap: {},
              s,
              f: {},
              b: {},
            };

            coverageMap.addFileCoverage(coverageData);
          }
        }
      }
    }

    return coverageMap;
  } catch (error) {
    throw new Error(`Failed to read Cobertura file: ${error}`);
  }
}
