# Contributing to coverage-runner

Thank you for your interest in contributing to coverage-runner! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue template if available
3. Provide clear reproduction steps
4. Include relevant system information

### Submitting Changes

1. **Fork the repository**

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up the development environment**

   ```bash
   npm install
   npm run typecheck
   npm run lint
   ```

4. **Make your changes**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

5. **Test your changes**

   ```bash
   npm run build
   npm run typecheck
   npm run lint
   npm test
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push and create a pull request**

   ```bash
   git push origin feature/your-feature-name
   ```

## Development Guidelines

### Code Style

- **TypeScript**: Use strict type checking
- **Formatting**: Prettier handles formatting automatically
- **Linting**: ESLint enforces code quality rules
- **Naming**: Use descriptive names for variables and functions

### Commit Messages

Follow conventional commit format:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

### Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting
- Aim for good test coverage

### Test-Driven Development (TDD)

We follow TDD practices (t-wada style) for implementing new features:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests passing
4. **Repeat**: Continue the cycle for each new requirement

```bash
# TDD workflow commands
npm run test -- --watch    # Run tests in watch mode
npm run test -- specific.test.ts  # Run specific test file
```

### Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Update type definitions as needed

## Pull Request Process

1. **Pre-submission checklist:**
   - [ ] Code compiles without errors
   - [ ] All tests pass
   - [ ] Linting passes
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)

2. **Pull request description should include:**
   - Clear description of changes
   - Related issue numbers
   - Testing instructions
   - Screenshots (if applicable)

3. **Review process:**
   - Maintainers will review your PR
   - Address feedback promptly
   - Keep PR focused and atomic

## Local Development

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/coverage-runner.git
cd coverage-runner

# Add upstream remote
git remote add upstream https://github.com/NoritakaIkeda/coverage-runner.git

# Install dependencies
npm install
```

### Daily Development

```bash
# Stay up to date with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature

# Development cycle
npm run dev          # Run in development mode
npm run typecheck    # Check types
npm run lint         # Check code style
npm run format       # Format code
```

### Before Committing

The pre-commit hook will automatically:

- Run ESLint on staged files
- Format code with Prettier
- Block commit if issues are found

Manual verification:

```bash
npm run build        # Ensure compilation works
npm run typecheck    # Verify types
npm run lint         # Check for issues
npm test            # Run tests
```

## Project Architecture

### Directory Structure

- `src/` - Main source code
- `bin/` - Executable scripts
- `lib/` - Reusable libraries
- `test/` - Test files
- `docs/` - Documentation
- `dist/` - Compiled output (git-ignored)

### Key Technologies

- **TypeScript** - Primary language
- **Node.js** - Runtime environment
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## Getting Help

- Check existing issues and documentation
- Ask questions in issue discussions
- Tag maintainers for urgent matters

Thank you for contributing! 🎉
