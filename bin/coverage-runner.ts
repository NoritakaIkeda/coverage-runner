#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { setDebugMode, logger } from '../src/utils/logger';
import { detectRunners } from '../src/utils/detectRunners';
import { RunnerFactory } from '../src/runners/RunnerFactory';

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
    .action(async (options: { path?: string }) => {
      if (program.opts().debug) {
        setDebugMode(true);
      }

      try {
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
              console.error(`❌ ${runnerType} coverage failed (exit code: ${result.exitCode})`);
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

if (require.main === module) {
  main();
}

export { createCLI, main };
