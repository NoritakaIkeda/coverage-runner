# coverage-runner

[![npm version](https://badge.fury.io/js/coverage-runner.svg)](https://www.npmjs.com/package/coverage-runner)
[![npm downloads](https://img.shields.io/npm/dm/coverage-runner.svg)](https://www.npmjs.com/package/coverage-runner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A unified CLI tool for running and managing code coverage analysis across different JavaScript/TypeScript testing frameworks with intelligent merging and customizable configurations.

## 📦 Package Information

- **npm**: [coverage-runner](https://www.npmjs.com/package/coverage-runner)
- **Current Version**: 0.1.0-beta.1 (Beta Release)
- **Install**: `npm install coverage-runner@beta`

## Overview

Coverage-runner solves the problem of fragmented coverage tooling by providing a single, consistent interface for code coverage analysis. It automatically detects Jest, Vitest, and other testing frameworks in your project, runs them with coverage collection, and intelligently merges the results into unified coverage reports.

## Features

- **🔍 Smart Detection**: Automatically detects Jest, Vitest, and other testing frameworks
- **🔀 Coverage Merging**: Intelligently merges coverage from multiple test runners
- **⚙️ Flexible Configuration**: Customizable via `.coverage-config.json` with runner overrides, exclude patterns, and merge strategies
- **📊 Multiple Output Formats**: Generates JSON, LCOV, HTML, Cobertura, and **Text** reports
- **✨ Flexible Format Selection**: Choose output formats with `--format json,lcov,text`
- **📝 Human-Readable Text Reports**: Comprehensive text summaries and detailed coverage reports
- **🚀 CI/CD Ready**: Seamless integration with GitHub Actions, CircleCI, and other CI platforms
- **📁 Remote Repository Support**: Analyze external repositories with `--repo` option

## Quick Start

### 1. Local Project Analysis

Run coverage analysis on any JavaScript/TypeScript project:

```bash
# Analyze current directory
npx coverage-runner@beta

# Merge coverage from detected test runners
npx coverage-runner@beta merge

# Generate text format reports
npx coverage-runner@beta merge --format text

# Generate multiple formats
npx coverage-runner@beta merge --format json,lcov,text

# Detailed text reports
npx coverage-runner@beta merge --format text --text-details

# Analyze specific patterns
npx coverage-runner@beta merge --patterns "./coverage/**/*.json"
```

**Purpose**: Automatically detects testing frameworks and generates unified coverage reports.

### 2. Custom Configuration

Create a `.coverage-config.json` file to customize behavior:

```json
{
  "runnerOverrides": {
    "jest": "jest --config=jest.config.ci.js --coverage",
    "vitest": "vitest run --coverage --config=vitest.config.ts"
  },
  "excludePatterns": [
    "**/*.spec.ts",
    "**/*.test.ts", 
    "**/__tests__/**",
    "**/node_modules/**"
  ],
  "mergeStrategy": "merge"
}
```

Then run with configuration:

```bash
# Uses .coverage-config.json automatically
npx coverage-runner

# Use explicit configuration file
npx coverage-runner --config ./custom-config.json
```

**Purpose**: Customizes test runner commands, excludes unwanted files, and controls merge behavior.

### 3. Remote Repository Analysis

Analyze external repositories directly:

```bash
# Clone and analyze a GitHub repository
npx coverage-runner --repo https://github.com/username/project.git

# Analyze with custom configuration
npx coverage-runner --repo https://github.com/username/project.git --config ./config.json
```

**Purpose**: Enables coverage analysis of external projects without manual cloning and setup.

## Output Files

Coverage-runner generates multiple output formats:

| File | Description | Use Case |
|------|-------------|----------|
| `coverage-merged.json` | Unified Istanbul coverage data | Primary coverage report, CI analysis |
| `coverage-final.json` | Final processed coverage | Legacy tool compatibility |
| `lcov.info` | LCOV format report | Code coverage visualization, VS Code extensions |
| `coverage/index.html` | Interactive HTML report | Local development, detailed analysis |
| `cobertura.xml` | Cobertura XML format | Jenkins, GitLab CI integration |
| `coverage-summary.txt` | **NEW:** Text summary report | Quick overview, terminal output |
| `coverage-detailed.txt` | **NEW:** Detailed text report | Function-level analysis, debugging |

### Merge Strategies

- **`"merge"`** (default): Combines all runner results into single `coverage-merged.json`
- **`"separate"`**: Creates individual `coverage-{runner}.json` files per test runner

## Installation

### Global Installation

```bash
npm install -g coverage-runner
coverage-runner
```

### Local Development

```bash
npm install --save-dev coverage-runner
npx coverage-runner
```

## CI/CD Integration

### GitHub Actions + Codecov

Create `.github/workflows/coverage.yml`:

```yaml
name: Coverage Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  coverage:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run coverage analysis
      run: npx coverage-runner
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage-merged.json
        flags: unittests
        name: coverage-report
        fail_ci_if_error: true
        
    - name: Upload LCOV to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./lcov.info
        flags: lcov
```

**Purpose**: Automates coverage collection in CI and uploads results to Codecov for visualization.

### Advanced CI Configuration

For projects with multiple test runners:

```yaml
- name: Run coverage with custom config
  run: |
    npx coverage-runner --config ./.github/coverage-ci.json
    
- name: Verify coverage thresholds
  run: |
    npx coverage-runner merge --patterns "./coverage/**/*.json" --threshold 80
```

### Example Project Setup

Typical project structure using coverage-runner:

```
my-project/
├── src/
│   ├── components/
│   └── utils/
├── tests/
│   ├── jest/           # Jest-specific tests
│   └── vitest/         # Vitest-specific tests
├── .coverage-config.json
├── jest.config.js
├── vitest.config.ts
└── .github/
    └── workflows/
        └── coverage.yml
```

Configuration for dual-runner setup:

```json
{
  "runnerOverrides": {
    "jest": "jest --testPathPattern=tests/jest --coverage",
    "vitest": "vitest run tests/vitest --coverage"
  },
  "excludePatterns": [
    "**/node_modules/**",
    "**/*.config.{js,ts}",
    "**/dist/**",
    "**/__mocks__/**"
  ],
  "mergeStrategy": "merge"
}
```

## Configuration Reference

### Complete `.coverage-config.json` Options

```json
{
  "runnerOverrides": {
    "jest": "string - Custom Jest command",
    "vitest": "string - Custom Vitest command", 
    "mocha": "string - Custom Mocha command"
  },
  "excludePatterns": [
    "string[] - Glob patterns to exclude from coverage"
  ],
  "mergeStrategy": "merge | separate - How to combine runner results"
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COVERAGE_OUTPUT_DIR` | Output directory for coverage files | `./coverage` |
| `COVERAGE_DEBUG` | Enable debug logging | `false` |
| `COVERAGE_THRESHOLD` | Minimum coverage percentage | `undefined` |

## Advanced Usage

### Programmatic API

```javascript
import { CoverageRunner } from 'coverage-runner';

const runner = new CoverageRunner({
  excludePatterns: ['**/*.spec.ts'],
  mergeStrategy: 'merge'
});

const result = await runner.run();
console.log(`Coverage: ${result.totalCoverage}%`);
```

### Custom Runners

```bash
# Run specific test runner only
npx coverage-runner --runner jest

# Multiple specific runners
npx coverage-runner --runner jest,vitest

# Skip auto-detection
npx coverage-runner --no-detect --runner jest
```

## Troubleshooting

### Common Issues

**No test runners detected**
```bash
# Verify test runners are installed
npm list jest vitest

# Force specific runner
npx coverage-runner --runner jest
```

**Permission denied errors**
```bash
# Make sure coverage-runner is executable
chmod +x node_modules/.bin/coverage-runner

# Or use npx
npx coverage-runner
```

**Coverage files not found**
```bash
# Verify coverage output directories
ls -la ./coverage/

# Check custom output directory
export COVERAGE_OUTPUT_DIR=./custom-coverage
npx coverage-runner
```

### Debug Mode

Enable detailed logging:

```bash
export COVERAGE_DEBUG=true
npx coverage-runner
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Development Setup

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
