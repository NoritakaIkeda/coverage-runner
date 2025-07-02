#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    .version(getVersion());

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
