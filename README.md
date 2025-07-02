# coverage-runner

A tool for running and managing code coverage analysis.

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
