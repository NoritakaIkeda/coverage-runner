# Claude Code Context

## Project Overview

This is a coverage runner tool that supports multiple test frameworks like Jest and Vitest.

## Development Commands

- `pnpm run lint` - Run linting and fix issues
- `pnpm run test` - Run tests
- `pnpm run build` - Build the project

## Development Practices

### TDD Approach (t-wada style)

When implementing new features, follow Test-Driven Development practices:

1. Write a failing test first (Red)
2. Write the minimum code to make it pass (Green)
3. Refactor while keeping tests passing (Refactor)
4. Repeat the cycle

### Implementation Process

1. Create comprehensive test cases before implementation
2. Implement features incrementally following TDD
3. Ensure all tests pass
4. Run `pnpm run test` to verify all tests pass
5. Run `pnpm run lint` to fix any linting issues
6. Create a PR when the feature is complete

### Code Quality

- Always run tests and linting before completing tasks
- Follow existing code patterns and conventions
- Ensure comprehensive test coverage
- Handle errors properly with appropriate type casting

## Recent Work

- Implemented coverage runners with TDD approach
- Enhanced error handling in JestRunner and VitestRunner
- Added debug output and CLI detect command

## Git Workflow

- Current feature branch: feature/runner-implementation-tdd
- Main branch: main
- Create PRs against main branch