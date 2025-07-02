#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setDebugMode, logger } from '../src/utils/logger.js';
import { detectRunners } from '../src/utils/detectRunners.js';
import { RunnerFactory } from '../src/runners/RunnerFactory.js';
import { mergeCoverageFiles } from '../src/commands/mergeCoverage.js';
import { executeInClonedRepo } from '../src/utils/executeInClonedRepo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent) as { version?: string };
    return packageJson.version ?? '1.0.0';
  } catch {
    return '1.0.0';
  }
}

function createCLI(): Command {
  const program = new Command();

  program
    .name('coverage-runner')
    .description('A tool for running and managing code coverage analysis')
    .version(getVersion())
    .option('-d, --debug', 'enable debug output');

  // Add detect command
  program
    .command('detect')
    .description('Detect test runners in the current project')
    .option('-p, --path <path>', 'path to package.json file')
    .action((options: { path?: string }) => {
      if (program.opts().debug) {
        setDebugMode(true);
      }

      const runners = detectRunners(options.path);

      if (runners.length > 0) {
        console.log(`Detected test runners: ${runners.join(', ')}`);
      } else {
        console.log('No test runners detected');
      }
    });

  // Add run command
  program
    .command('run')
    .description('Run coverage analysis for detected test runners')
    .option('-p, --path <path>', 'path to package.json file')
    .option('-r, --repo <url>', 'clone and analyze remote repository')
    .option('-o, --output <dir>', 'output directory for coverage reports', 'coverage-merged')
    .option('-b, --branch <branch>', 'git branch to checkout (only with --repo)')
    .option('--no-install', 'skip dependency installation (only with --repo)')
    .option('--no-cleanup', 'keep cloned repository after analysis (only with --repo)')
    .option('--timeout <ms>', 'timeout for clone and install operations in milliseconds', '300000')
    .action(async (options: { 
      path?: string; 
      repo?: string; 
      output: string;
      branch?: string;
      install: boolean;
      cleanup: boolean;
      timeout: string;
    }) => {
      if (program.opts().debug) {
        setDebugMode(true);
      }

      try {
        // Handle remote repository analysis
        if (options.repo) {
          console.log(`🌐 Analyzing remote repository: ${options.repo}`);
          
          const result = await executeInClonedRepo(options.repo, {
            outputDir: options.output,
            branch: options.branch,
            installDependencies: options.install,
            cleanup: options.cleanup,
            timeout: parseInt(options.timeout)
          });

          if (result.success) {
            console.log('✅ Remote repository analysis completed successfully!');
            console.log(`   📁 Output directory: ${result.outputDir}`);
            if (result.runners && result.runners.length > 0) {
              console.log(`   🏃 Runners used: ${result.runners.join(', ')}`);
            }
            if (result.coverageFiles && result.coverageFiles.length > 0) {
              console.log(`   📊 Coverage files generated: ${result.coverageFiles.length}`);
            }
            if (!options.cleanup && result.clonedPath) {
              console.log(`   📂 Cloned repository preserved at: ${result.clonedPath}`);
            }
          } else {
            console.error('❌ Remote repository analysis failed');
            console.error(`   Error: ${result.error}`);
            process.exit(1);
          }
          return;
        }

        // Handle local repository analysis (existing functionality)
        const runners = detectRunners(options.path);

        if (runners.length === 0) {
          console.log('No test runners detected. Skipping coverage analysis.');
          return;
        }

        console.log(`Running coverage analysis for: ${runners.join(', ')}`);

        for (const runnerType of runners) {
          try {
            console.log(`\n🏃 Running ${runnerType} coverage...`);
            const runner = RunnerFactory.createRunner(runnerType);
            const result = await runner.runCoverage();

            if (result.success) {
              console.log(`✅ ${runnerType} coverage completed successfully`);
              console.log(`   Output: ${result.outputPath}`);
              if (result.duration) {
                console.log(`   Duration: ${result.duration}ms`);
              }
            } else {
              console.error(
                `❌ ${runnerType} coverage failed (exit code: ${result.exitCode})`
              );
              if (result.stderr) {
                console.error(`   Error: ${result.stderr}`);
              }
            }
          } catch (error) {
            console.error(`❌ Failed to run ${runnerType}:`, error);
          }
        }

        console.log('\n🎉 Coverage analysis completed!');
      } catch (error) {
        logger.error('Failed to run coverage analysis:', error);
        process.exit(1);
      }
    });

  // Add merge command
  program
    .command('merge')
    .description('Merge multiple coverage files into a single output')
    .option(
      '-i, --input <patterns...>',
      'input coverage file patterns (e.g., "coverage/*.lcov" "coverage/*.xml")'
    )
    .option(
      '-o, --output <dir>',
      'output directory for merged coverage',
      'coverage-merged'
    )
    .option('--json-only', 'output only JSON format (skip LCOV)')
    .option(
      '--normalize-paths',
      'normalize file paths to handle different formats'
    )
    .option('--root-dir <dir>', 'root directory for path normalization')
    .action(
      async (options: {
        input?: string[];
        output: string;
        jsonOnly?: boolean;
        normalizePaths?: boolean;
        rootDir?: string;
      }) => {
        if (program.opts().debug) {
          setDebugMode(true);
        }

        try {
          if (!options.input || options.input.length === 0) {
            console.error(
              '❌ No input files specified. Use -i/--input to specify coverage files.'
            );
            process.exit(1);
          }

          console.log('🔄 Merging coverage files...');
          logger.debug(`Input patterns: ${options.input.join(', ')}`);
          logger.debug(`Output directory: ${options.output}`);
          logger.debug(`JSON only: ${options.jsonOnly || false}`);
          logger.debug(`Normalize paths: ${options.normalizePaths || false}`);

          const result = await mergeCoverageFiles({
            inputPatterns: options.input,
            outputDir: options.output,
            jsonOnly: options.jsonOnly || false,
            normalizePaths: options.normalizePaths || false,
            rootDir: options.rootDir,
          });

          if (result.success) {
            console.log('✅ Coverage files merged successfully!');
            console.log(`   📁 Output directory: ${result.outputDir}`);
            console.log(`   📊 Files processed: ${result.filesProcessed}`);
            console.log(`   📝 Unique files in output: ${result.uniqueFiles}`);
            if (result.normalizedPaths) {
              console.log(`   🔄 Paths normalized: ${result.normalizedPaths}`);
            }
          } else {
            console.error('❌ Coverage merging failed');
            if (result.error) {
              console.error(`   Error: ${result.error}`);
            }
            process.exit(1);
          }
        } catch (error) {
          logger.error('Failed to merge coverage files:', error);
          process.exit(1);
        }
      }
    );

  // Future subcommands will be added here
  // Example structure for extensibility:
  // program
  //   .command('run')
  //   .description('Run coverage analysis')
  //   .action(() => {
  //     // Implementation here
  //   });

  // Default action when no subcommand is provided
  program.action(() => {
    program.help();
  });

  return program;
}

function main(): void {
  const program = createCLI();
  program.parse();
}

// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createCLI, main };
