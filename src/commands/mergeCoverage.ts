import * as path from 'path';
import { glob } from 'glob';
import { logger } from '../utils/logger';
import { loadLcov } from '../coverage/loaders/loadLcov';
import { loadCobertura } from '../coverage/loaders/loadCobertura';
import { loadIstanbulJson } from '../coverage/loaders/loadIstanbulJson';
import { mergeCoverage, CoverageData } from '../coverage/mergeCoverage';
import { normalizeCoveragePaths } from '../coverage/normalizeCoveragePaths';
import { writeMergedCoverage } from '../coverage/writeMergedCoverage';

export interface MergeCoverageOptions {
  inputPatterns: string[];
  outputDir: string;
  jsonOnly?: boolean;
  normalizePaths?: boolean;
  rootDir?: string | undefined;
}

export interface MergeCoverageResult {
  success: boolean;
  outputDir: string;
  filesProcessed: number;
  uniqueFiles: number;
  normalizedPaths?: number | undefined;
  error?: string;
}

export async function mergeCoverageFiles(options: MergeCoverageOptions): Promise<MergeCoverageResult> {
  const { inputPatterns, outputDir, jsonOnly = false, normalizePaths = false, rootDir } = options;
  
  logger.debug('Starting coverage merge operation');
  logger.debug(`Input patterns: ${inputPatterns.join(', ')}`);
  logger.debug(`Output directory: ${outputDir}`);
  
  try {
    // Find all matching files
    const allFiles: string[] = [];
    for (const pattern of inputPatterns) {
      const matchingFiles = await glob(pattern, { 
        ignore: ['node_modules/**', '**/node_modules/**'],
        absolute: true 
      });
      allFiles.push(...matchingFiles);
    }
    
    if (allFiles.length === 0) {
      return {
        success: false,
        outputDir,
        filesProcessed: 0,
        uniqueFiles: 0,
        error: 'No coverage files found matching the specified patterns',
      };
    }
    
    // Remove duplicates
    const uniqueFiles = [...new Set(allFiles)];
    logger.debug(`Found ${uniqueFiles.length} unique coverage files`);
    
    // Load all coverage files
    const coverageData: CoverageData[] = [];
    let filesProcessed = 0;
    
    for (const filePath of uniqueFiles) {
      try {
        logger.debug(`Processing file: ${filePath}`);
        const fileExtension = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath).toLowerCase();
        
        let coverageMap;
        
        if (fileExtension === '.lcov' || fileName.includes('lcov')) {
          logger.debug(`Loading as LCOV: ${filePath}`);
          coverageMap = loadLcov(filePath);
        } else if (fileExtension === '.xml' || fileName.includes('cobertura') || fileName.includes('coverage.xml')) {
          logger.debug(`Loading as Cobertura XML: ${filePath}`);
          coverageMap = loadCobertura(filePath);
        } else if (fileExtension === '.json' || fileName.includes('coverage') && fileName.includes('json')) {
          logger.debug(`Loading as Istanbul JSON: ${filePath}`);
          coverageMap = loadIstanbulJson(filePath);
        } else {
          logger.debug(`Skipping unknown file format: ${filePath}`);
          continue;
        }
        
        if (coverageMap && Object.keys(coverageMap.toJSON()).length > 0) {
          coverageData.push(coverageMap.toJSON());
          filesProcessed++;
          logger.debug(`Successfully loaded coverage from: ${filePath}`);
        } else {
          logger.debug(`No coverage data found in: ${filePath}`);
        }
      } catch (error) {
        logger.debug(`Failed to load coverage from ${filePath}: ${error}`);
        // Continue processing other files instead of failing entirely
      }
    }
    
    if (coverageData.length === 0) {
      return {
        success: false,
        outputDir,
        filesProcessed: 0,
        uniqueFiles: uniqueFiles.length,
        error: 'No valid coverage data found in any of the input files',
      };
    }
    
    logger.debug(`Loaded coverage data from ${filesProcessed} files`);
    
    // Merge all coverage data
    logger.debug('Merging coverage data...');
    let mergedCoverage = mergeCoverage(coverageData);
    
    let normalizedPathCount: number | undefined;
    
    // Apply path normalization if requested
    if (normalizePaths) {
      logger.debug('Applying path normalization...');
      const originalPathCount = Object.keys(mergedCoverage.toJSON()).length;
      mergedCoverage = normalizeCoveragePaths(mergedCoverage, rootDir);
      const newPathCount = Object.keys(mergedCoverage.toJSON()).length;
      normalizedPathCount = originalPathCount - newPathCount;
      logger.debug(`Path normalization reduced ${originalPathCount} paths to ${newPathCount} unique paths`);
    }
    
    // Write merged coverage
    logger.debug('Writing merged coverage...');
    writeMergedCoverage(mergedCoverage, {
      outDir: outputDir,
      jsonOnly,
    });
    
    const uniqueFileCount = Object.keys(mergedCoverage.toJSON()).length;
    
    logger.debug('Coverage merge operation completed successfully');
    
    return {
      success: true,
      outputDir,
      filesProcessed,
      uniqueFiles: uniqueFileCount,
      normalizedPaths: normalizedPathCount,
    };
    
  } catch (error) {
    logger.error('Coverage merge operation failed:', error);
    return {
      success: false,
      outputDir,
      filesProcessed: 0,
      uniqueFiles: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Helper function to detect coverage file format
export function detectCoverageFormat(filePath: string): 'lcov' | 'cobertura' | 'istanbul' | 'unknown' {
  const fileExtension = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();
  
  if (fileExtension === '.lcov' || fileName.includes('lcov')) {
    return 'lcov';
  }
  
  if (fileExtension === '.xml' || fileName.includes('cobertura') || fileName.includes('coverage.xml')) {
    return 'cobertura';
  }
  
  if (fileExtension === '.json' || (fileName.includes('coverage') && fileName.includes('json'))) {
    return 'istanbul';
  }
  
  return 'unknown';
}