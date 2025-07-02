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
# 包括的品質チェック実行
npm run quality:check

# 個別チェック
npm run validate:all    # ファイル・ワークフロー検証
npm run typecheck      # TypeScript型チェック
npm run lint           # ESLint検証
npm run test           # テスト実行

# 修正後、再コミット
git add .
git commit -m "fix: resolve type safety issues"
```

## 再発防止システム

### 🛡️ 5段階品質ゲート

1. **ファイル検証**: 新規TypeScriptファイルの型安全性確認
2. **ワークフロー検証**: YAML構文・必須要素確認  
3. **型チェック**: 厳密なTypeScript型検証
4. **ESLint検証**: エラーレベルでの品質確認
5. **テスト実行**: 全機能の動作確認

### 🔍 自動モニタリング

- **日次品質監査**: 毎日9時(UTC)に全体品質チェック
- **セキュリティ監査**: 依存関係・機密情報の検出
- **品質メトリクス**: エラー・警告数の推移追跡

### 📋 コマンド一覧

```bash
# 開発時の品質チェック
npm run quality:check    # 全品質ゲート実行
npm run quality:audit    # 完全品質監査

# 個別検証
npm run validate:all     # ファイル・設定検証
node scripts/validate-new-files.js      # ファイル検証
node scripts/validate-workflow.js       # ワークフロー検証
```

### ⚡ 緊急時の対応

```bash
# 品質チェック迂回（緊急時のみ）
git commit --no-verify -m "emergency: hotfix"

# 迂回後は即座に修正
npm run quality:audit
git add .
git commit -m "fix: resolve quality issues after emergency commit"
```

## Recent Work

- Implemented coverage runners with TDD approach
- Enhanced error handling in JestRunner and VitestRunner
- Added debug output and CLI detect command

## Git Workflow

- Current feature branch: feature/runner-implementation-tdd
- Main branch: main
- Create PRs against main branch