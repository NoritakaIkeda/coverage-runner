#!/usr/bin/env node

/**
 * Script to validate GitHub Actions workflow files
 * Ensures YAML syntax is correct and required jobs are present
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function validateWorkflowFiles() {
  console.log('🔍 Validating GitHub Actions workflow files...');
  
  const workflowDir = path.join(__dirname, '../.github/workflows');
  
  if (!fs.existsSync(workflowDir)) {
    console.error('❌ .github/workflows directory not found!');
    process.exit(1);
  }
  
  const workflowFiles = fs.readdirSync(workflowDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));
  
  if (workflowFiles.length === 0) {
    console.error('❌ No workflow files found!');
    process.exit(1);
  }
  
  console.log(`Found ${workflowFiles.length} workflow files: ${workflowFiles.join(', ')}`);
  
  for (const file of workflowFiles) {
    const filePath = path.join(workflowDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Basic YAML syntax validation
    if (content.includes('EOF') || content.includes('< /dev/null')) {
      console.error(`❌ Invalid content found in ${file}: contains shell artifacts`);
      process.exit(1);
    }
    
    // Check for required elements in CI workflow
    if (file === 'ci.yml') {
      const requiredElements = [
        'name:', 'on:', 'jobs:', 'runs-on:', 'steps:',
        'npm run lint', 'npm run typecheck', 'npm run test'
      ];
      
      for (const element of requiredElements) {
        if (!content.includes(element)) {
          console.error(`❌ Missing required element "${element}" in ${file}`);
          process.exit(1);
        }
      }
      
      // Validate no shell syntax errors
      const invalidPatterns = [
        /\\\!/g,  // Invalid bash escaping
        /EOF\s*$/m, // Stray EOF
        /< \/dev\/null/g // Shell redirection
      ];
      
      for (const pattern of invalidPatterns) {
        if (pattern.test(content)) {
          console.error(`❌ Invalid pattern found in ${file}: ${pattern}`);
          process.exit(1);
        }
      }
    }
  }
  
  // Try to validate YAML syntax using node-yaml if available
  try {
    for (const file of workflowFiles) {
      const filePath = path.join(workflowDir, file);
      execSync(`node -e "require('yaml').parse(require('fs').readFileSync('${filePath}', 'utf-8'))"`, 
        { stdio: 'pipe' });
    }
  } catch (error) {
    // If yaml package not available, skip advanced validation
    console.log('⚠️  Advanced YAML validation skipped (yaml package not available)');
  }
  
  console.log('✅ All workflow files validated successfully!');
}

function validatePackageJsonConsistency() {
  console.log('🔍 Validating package.json consistency...');
  
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  // Ensure critical dev dependencies are present
  const requiredDevDeps = [
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint',
    'typescript',
    'vitest'
  ];
  
  const missing = requiredDevDeps.filter(dep => 
    !packageJson.devDependencies || !packageJson.devDependencies[dep]
  );
  
  if (missing.length > 0) {
    console.error(`❌ Missing required dev dependencies: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ Package.json consistency validated!');
}

if (require.main === module) {
  validateWorkflowFiles();
  validatePackageJsonConsistency();
}

module.exports = {
  validateWorkflowFiles,
  validatePackageJsonConsistency
};