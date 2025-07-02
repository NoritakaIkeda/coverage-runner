#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { setDebugMode } from '../src/utils/logger';
import { detectRunners } from '../src/utils/detectRunners';

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
