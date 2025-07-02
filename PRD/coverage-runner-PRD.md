
# coverage-runner PRD

## 1. Overview / Product Vision

A **universal CLI wrapper** that automatically detects **multiple test runners (Jest / Vitest / Mocha / Ava, etc.)** used in an OSS repository, collects, merges, and visualizes their coverage reports.

> "Create a world where anyone can obtain accurate code coverage with a single command, regardless of the project setup or test runner."

---

## 2. Background / Problem Statement

* OSS projects use a wide variety of test environments; tools assuming a single runner often yield incomplete or duplicated coverage.
* Reliable coverage data is essential for test generation via LLMs and complexity analysis.
* CI services (e.g., Codecov) visualize coverage reports but do not generate them—there is a lack of standardization in coverage generation.

---

## 3. Objective / Goal

* Enable comprehensive and unified coverage reports with a **single command** for any JS/TS project.
* Merge multiple runner outputs into a **single JSON & LCOV** file.
* Design the tool as a **reusable dependency** for upstream tools like `complexity-analyzer` or `coverage-hub`.

---

## 4. In-Scope / Out-of-Scope

|                         | In Scope (MVP)                     | Out of Scope                    |
| ----------------------- | ---------------------------------- | ------------------------------- |
| Runner Detection        | Jest / Vitest / Mocha / Ava        | Legacy runners like Karma, Tape |
| Coverage Format Support | lcov, Istanbul JSON, Cobertura XML | HTML report generation          |
| Coverage Merging        | Merged via `istanbul-lib-coverage` | Automated E2E (e.g., Cypress)   |
| Config Customization    | `.coverage-config.json`            | IDE Plugins                     |
| CI Templates            | GitHub Actions usage examples      | GitLab / Azure-specific setups  |

---

## 5. KPI / Success Metrics

| Metric                     | Target (6 Months)                  |
| -------------------------- | ---------------------------------- |
| Supported Test Runners     | 4 or more                          |
| “One-command success rate” | 95% (for officially supported OSS) |
| Weekly npm Downloads       | 1,000+                             |
| GitHub Stars               | 200+                               |

---

## 6. User Personas

1. **OSS Maintainer** – Wants to track and manage project quality via CI.
2. **Researcher / Contributor** – Needs objective insights into external OSS testing status.
3. **AI Test Tool Developer** – Requires coverage JSON for feeding into LLMs.

---

## 7. Key Use Cases / User Stories

* **US1:** “Running `npx coverage-runner --repo .` detects both Jest and Vitest, and outputs a unified `coverage/coverage-merged.json`.”
* **US2:** “Using `.coverage-config.json`, users can override default commands and exclude paths.”
* **US3:** “On each PR, `coverage-merged.lcov` is uploaded to Codecov via GitHub Actions.”

---

## 8. Functional Requirements

### 8.1 Runner Auto-Detection

* Analyze `package.json` (`dependencies`, `devDependencies`, `scripts`)
* Target runners for MVP: jest, vitest, mocha, ava

### 8.2 Coverage Collection

* Execute default commands per runner (e.g., `jest --coverage`)
* Use environment variables to control output paths

### 8.3 Format Conversion & Merging

* Supported input: lcov, Cobertura XML, Istanbul JSON
* Output: `coverage-merged.json`, `coverage-merged.lcov`

### 8.4 Config File (`.coverage-config.json`)

* Per-runner custom commands
* Include/exclude path settings
* Merge strategy (combined or separate)

### 8.5 CLI Interface

```
Usage: coverage-runner [options]

Options:
  --repo <path>         # Target repository (default: cwd)
  --config <file>       # Custom configuration file
  --out-dir <dir>       # Output directory for coverage
  --json-only           # Skip lcov, output only JSON
  --debug               # Verbose logging
```

---

## 9. Non-Functional Requirements

| Aspect         | Requirement                                          |
| -------------- | ---------------------------------------------------- |
| Performance    | <10% overhead when detecting a single runner         |
| Cross-platform | Supports Node >=18, macOS/Linux/Windows              |
| Extensibility  | Plugin API (`runner-hook`) for adding custom runners |
| Reliability    | Ensure 90%+ test coverage through E2E tests          |

---

## 10. Competitors / Alternatives

| Tool             | Difference                                              |
| ---------------- | ------------------------------------------------------- |
| nyc              | Istanbul CLI, assumes manual setup for multiple runners |
| c8               | V8 Coverage wrapper with limited format support         |
| jest --coverage  | Jest-only; not compatible with mixed runner setups      |
| codecov uploader | Does not generate coverage, only uploads                |

**coverage-runner** differentiates by offering **multi-runner support + coverage merging + declarative config**.

---

## 11. Tech Stack / Dependencies

* **Node.js 18+** / TypeScript
* Command execution: `execa`
* Coverage merging: `istanbul-lib-coverage`, `istanbul-lib-report`
* Config loading: `cosmiconfig`
* Testing: Vitest + `ts-morph` (for self-coverage testing)

---

## 12. Risks & Constraints

| Risk                          | Mitigation                                     |
| ----------------------------- | ---------------------------------------------- |
| Differences in runner options | Abstract via runner-specific wrapper classes   |
| CI environment variability    | Validate on GitHub Actions, others best-effort |
| E2E coverage unsupported      | Flag as roadmap item with phased approach      |

---

## 13. Milestones / Roadmap

| Month   | Milestone                                                    |
| ------- | ------------------------------------------------------------ |
| 2025-07 | Finalize spec & create repo (@0.1.0)                         |
| 2025-08 | Jest/Vitest support + lcov merging (MVP)                     |
| 2025-09 | Mocha/Ava support + `.coverage-config.json` support (@0.3.0) |
| 2025-10 | Plugin API / Codecov template (@0.5.0)                       |
| 2025-12 | E2E coverage PoC / Release v1.0.0                            |

---

## 14. Open Questions

1. How to handle ESM-specific test runner startup?
2. Scope and strategy for supporting monorepos (Turbo / Nx)?
3. Shell escaping issues in Windows PowerShell environments?
4. How much E2E test coverage collection should be supported and when?

---

## 15. Appendix: Example Commands

```bash
# Example 1: Auto-detect default runners
npx coverage-runner

# Example 2: Use custom config file
coverage-runner --config ./.config/coverage.json

# Example 3: Clone remote OSS repo and collect coverage
coverage-runner --repo https://github.com/org/repo.git
```

---

> **This PRD is the initial draft (v0.1). Feedback is welcome!**
