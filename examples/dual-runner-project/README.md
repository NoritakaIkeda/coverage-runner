# Dual Runner Example

This example project demonstrates how to use `coverage-runner` with both Jest and Vitest testing frameworks in the same project.

## Project Structure

```
dual-runner-project/
├── src/
│   ├── calculator.ts      # Calculator class and MathUtils
│   ├── stringUtils.ts     # StringUtils class and TextProcessor
│   └── index.ts           # Main entry point with demo functions
├── tests/
│   ├── jest/              # Jest test files
│   │   ├── calculator.test.ts
│   │   └── stringUtils.test.ts
│   └── vitest/            # Vitest test files
│       ├── calculator.test.ts
│       └── stringUtils.test.ts
├── .coverage-config.json  # Coverage runner configuration
├── vitest.config.ts       # Vitest configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Jest configuration included
```

## Features Demonstrated

- **Multiple Test Frameworks**: Jest and Vitest testing the same source code
- **Separate Coverage Reports**: Each framework generates its own coverage
- **Unified Coverage**: coverage-runner merges both reports
- **Configuration**: Custom runner commands and exclusion patterns
- **TypeScript**: Full TypeScript support with ESM modules

## Setup

```bash
npm install
```

## Running Tests

### Individual Framework Tests
```bash
# Run Jest tests only
npm run test:jest

# Run Vitest tests only  
npm run test:vitest

# Run both test suites
npm test
```

### Coverage Reports

```bash
# Generate Jest coverage only
npm run coverage:jest

# Generate Vitest coverage only
npm run coverage:vitest

# Generate unified coverage with coverage-runner
npm run coverage
```

## Coverage Runner Usage

The project includes a `.coverage-config.json` file that configures:

- **Runner Overrides**: Custom commands for Jest and Vitest
- **Exclude Patterns**: Files to exclude from merged coverage
- **Merge Strategy**: How to combine coverage reports

After running `npm run coverage`, you'll find:

- `coverage-jest/` - Jest coverage reports
- `coverage-vitest/` - Vitest coverage reports  
- `coverage-merged.json` - Unified coverage data
- `coverage-merged/` - Unified HTML report

## Example Output

```bash
$ npm run coverage

> dual-runner-example@1.0.0 coverage
> npx coverage-runner

✓ Detected Jest and Vitest test runners
✓ Running Jest with coverage...
✓ Running Vitest with coverage...
✓ Merging coverage reports...
✓ Coverage merged successfully!

📊 Coverage Summary:
├── Lines: 95.8% (46/48)
├── Functions: 100% (12/12)  
├── Branches: 87.5% (14/16)
└── Statements: 95.8% (46/48)

📁 Output files:
├── coverage-merged.json
└── coverage-merged/index.html
```

## Configuration Details

The `.coverage-config.json` demonstrates:

```json
{
  "runnerOverrides": {
    "jest": "npm run test:jest -- --coverage --verbose",
    "vitest": "npm run test:vitest -- --coverage --reporter=verbose"
  },
  "excludePatterns": [
    "**/node_modules/**",
    "**/dist/**", 
    "**/*.d.ts",
    "**/tests/**"
  ],
  "mergeStrategy": "merge"
}
```

This configuration:
- Uses custom commands with verbose output
- Excludes test files and build artifacts from merged coverage
- Merges coverage into a single unified report