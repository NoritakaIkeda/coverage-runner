# coverage-runner

A unified CLI tool for running and managing code coverage analysis across different JavaScript/TypeScript projects and testing frameworks.

## Overview

Coverage-runner solves the problem of fragmented coverage tooling by providing a single, consistent interface for code coverage analysis. Instead of remembering different commands and configurations for various testing frameworks (Jest, Vitest, Mocha, etc.), coverage-runner automatically detects your project setup and runs the appropriate coverage tools with optimal settings.

## Usage

### Quick Start

Run coverage analysis on any JavaScript/TypeScript project:

```bash
npx coverage-runner
```

### Installation

For regular use, install globally:

```bash
npm install -g coverage-runner
coverage-runner
```

## Features

- **Automatic Detection**: Intelligently detects your testing framework and project configuration
- **Unified Interface**: Single command works across Jest, Vitest, Mocha, and other popular testing tools
- **Configuration Support**: Respects existing coverage configuration files
- **Integration Ready**: Designed to work seamlessly in CI/CD pipelines
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Status

🚧 **Currently in Development** - This tool is under active development. Core functionality is being implemented and tested.

## Roadmap

- [x] CLI foundation and project structure
- [ ] Framework auto-detection
- [ ] Coverage execution engine
- [ ] Configuration file support
- [ ] CI/CD integration helpers

## Development

### Prerequisites

- Node.js (v18 or later)
- npm

### Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/NoritakaIkeda/coverage-runner.git
   cd coverage-runner
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Verify the setup

   ```bash
   npm run typecheck
   npm run lint
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Run the application in development mode |
| `npm start` | Run the compiled application |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Run ESLint and automatically fix issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking without compilation |
| `npm test` | Run tests (to be implemented) |

### Development Workflow

1. **Before starting development:**

   ```bash
   npm run typecheck
   npm run lint
   ```

2. **During development:**

   ```bash
   npm run dev
   ```

3. **Before committing:**
   - Husky will automatically run `lint-staged` on pre-commit
   - This will lint and format your staged files
   - Ensure all checks pass before pushing

### Project Structure

```text
coverage-runner/
├── src/           # Source code
├── dist/          # Compiled output (generated)
├── bin/           # Executable scripts
├── lib/           # Libraries
├── test/          # Test files
├── docs/          # Documentation
└── PRD/           # Product requirements
```

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks

The configuration is automatically applied on commit via git hooks.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.
