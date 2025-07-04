import { promises as fs } from 'fs';
import { resolve } from 'path';
import type { CoverageMap } from 'istanbul-lib-coverage';

export interface TextCoverageOptions {
  summary?: boolean;
  detailed?: boolean;
}

/**
 * Write coverage data in text format
 */
export async function writeTextCoverage(
  coverageMap: CoverageMap,
  outputDir: string,
  options: TextCoverageOptions = { summary: true }
): Promise<void> {
  const { summary = true, detailed = false } = options;

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  if (summary) {
    await writeSummaryReport(coverageMap, outputDir);
  }

  if (detailed) {
    await writeDetailedReport(coverageMap, outputDir);
  }
}

/**
 * Write a summary text report
 */
async function writeSummaryReport(
  coverageMap: CoverageMap,
  outputDir: string
): Promise<void> {
  const files = coverageMap.files();

  if (files.length === 0) {
    const content = `COVERAGE SUMMARY
================

No coverage data found.
`;
    await fs.writeFile(resolve(outputDir, 'coverage-summary.txt'), content);
    return;
  }

  let content = `COVERAGE SUMMARY
================

`;

  let totalStatements = 0;
  let coveredStatements = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;
  let totalBranches = 0;
  let coveredBranches = 0;

  // Process each file
  for (const filePath of files) {
    const fileCoverage = coverageMap.fileCoverageFor(filePath);
    const summary = fileCoverage.toSummary();

    const fileName = filePath.split('/').pop() ?? filePath;
    const statements = summary.statements;
    const functions = summary.functions;
    const lines = summary.lines;
    const branches = summary.branches;

    content += `${fileName}:
  Statements: ${statements.covered}/${statements.total} (${statements.pct}%)
  Functions:  ${functions.covered}/${functions.total} (${functions.pct}%)
  Lines:      ${lines.covered}/${lines.total} (${lines.pct}%)
  Branches:   ${branches.covered}/${branches.total} (${branches.pct}%)

`;

    totalStatements += statements.total;
    coveredStatements += statements.covered;
    totalFunctions += functions.total;
    coveredFunctions += functions.covered;
    totalLines += lines.total;
    coveredLines += lines.covered;
    totalBranches += branches.total;
    coveredBranches += branches.covered;
  }

  // Add overall summary
  const stmtPct =
    totalStatements > 0
      ? Math.round((coveredStatements / totalStatements) * 100)
      : 0;
  const funcPct =
    totalFunctions > 0
      ? Math.round((coveredFunctions / totalFunctions) * 100)
      : 0;
  const linePct =
    totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0;
  const branchPct =
    totalBranches > 0 ? Math.round((coveredBranches / totalBranches) * 100) : 0;

  content += `TOTAL:
  Statements: ${coveredStatements}/${totalStatements} (${stmtPct}%)
  Functions:  ${coveredFunctions}/${totalFunctions} (${funcPct}%)
  Lines:      ${coveredLines}/${totalLines} (${linePct}%)
  Branches:   ${coveredBranches}/${totalBranches} (${branchPct}%)
`;

  await fs.writeFile(resolve(outputDir, 'coverage-summary.txt'), content);
}

/**
 * Write a detailed text report
 */
async function writeDetailedReport(
  coverageMap: CoverageMap,
  outputDir: string
): Promise<void> {
  const files = coverageMap.files();

  let content = `DETAILED COVERAGE REPORT
========================

`;

  if (files.length === 0) {
    content += 'No coverage data found.\n';
    await fs.writeFile(resolve(outputDir, 'coverage-detailed.txt'), content);
    return;
  }

  for (const filePath of files) {
    const fileCoverage = coverageMap.fileCoverageFor(filePath);
    const fileName = filePath.split('/').pop() ?? filePath;

    content += `File: ${fileName}
Path: ${filePath}
${'='.repeat(50)}

`;

    // Function coverage details
    const functions = fileCoverage.f;
    const fnMap = fileCoverage.fnMap;

    if (Object.keys(functions).length > 0) {
      content += 'Functions:\n';
      for (const fnId of Object.keys(functions)) {
        const count = functions[fnId] ?? 0;
        const fnData = fnMap[fnId];
        const fnName = fnData?.name ?? 'anonymous';
        const status = count > 0 ? 'Covered' : 'Not covered';
        content += `  ${fnName}: ${status} (${count} calls)\n`;
      }
      content += '\n';
    }

    // Statement coverage summary
    const statements = fileCoverage.s;
    const coveredStmts = Object.values(statements).filter(
      count => count > 0
    ).length;
    const totalStmts = Object.keys(statements).length;

    content += `Statements: ${coveredStmts}/${totalStmts} covered\n`;

    // Show uncovered statements
    const uncoveredStmts = Object.entries(statements)
      .filter(([, count]) => count === 0)
      .map(([id]) => id);

    if (uncoveredStmts.length > 0) {
      content += `Uncovered statements: ${uncoveredStmts.join(', ')}\n`;
    }

    content += '\n';
  }

  await fs.writeFile(resolve(outputDir, 'coverage-detailed.txt'), content);
}
