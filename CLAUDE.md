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

## Type Safety & Quality Assurance

### 厳格な型安全性設定

このプロジェクトでは、型安全性エラーの再発を防ぐため以下の厳格な設定を採用しています：

#### ESLint 厳格ルール
- `@typescript-eslint/no-unsafe-assignment`: error
- `@typescript-eslint/no-unsafe-call`: error  
- `@typescript-eslint/no-unsafe-member-access`: error
- `@typescript-eslint/no-unsafe-argument`: error
- `@typescript-eslint/restrict-template-expressions`: error

#### TypeScript 厳密設定
- `noImplicitOverride`: true - オーバーライドの明示化
- `noPropertyAccessFromIndexSignature`: true - インデックス署名へのアクセス制限
- `useUnknownInCatchVariables`: true - catch文での型安全性
- `strictPropertyInitialization`: true - プロパティ初期化の厳格化

### Pre-commit Hooks

コミット前に以下のチェックが自動実行されます：
1. TypeScript type checking (`npm run typecheck`)
2. ESLint validation (`npm run lint`)  
3. Unit tests (`npm run test`)
4. Lint-staged for staged files

### CI/CD パイプライン

GitHub Actionsで以下の段階的チェックを実行：
1. **Code Quality Checks** - TypeScript, ESLint, Prettier
2. **Test Suite** - 単体テスト + カバレッジ
3. **Build Test** - ビルド成功確認
4. **Multi-Node Test** - Node.js 16, 18, 20での動作確認

### トラブルシューティング

#### 型安全性エラーが発生した場合
1. `any` 型の使用を避け、適切な型アサーションを使用
2. 型ガード関数を作成して型安全性を確保
3. Istanbul-lib-coverage等の複雑な型は `.toJSON()` メソッドを活用

#### ローカルとCI環境での違い
- 両環境で同じESLint設定を使用
- pre-commit hookで事前チェック
- package.jsonのscriptsを統一使用

#### Pre-commit hookが失敗する場合
```bash
# 手動でチェック実行
npm run typecheck
npm run lint  
npm run test

# 修正後、再コミット
git add .
git commit -m "fix: resolve type safety issues"
```

## Recent Work

- Implemented coverage runners with TDD approach
- Enhanced error handling in JestRunner and VitestRunner
- Added debug output and CLI detect command

## Git Workflow

- Current feature branch: feature/runner-implementation-tdd
- Main branch: main
- Create PRs against main branch