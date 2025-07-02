# Security Policy

## Supported Versions

We provide security updates for the following versions of coverage-runner:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do NOT create a public issue

Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Contact us privately

Send an email to **noritakaikeda@example.com** with:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes or mitigations

### 3. Response timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### 4. Disclosure process

1. We will acknowledge receipt of your report
2. We will confirm the vulnerability and determine its impact
3. We will develop and test a fix
4. We will release a patched version
5. We will publicly disclose the vulnerability with appropriate credit

## Security considerations

### Code execution risks

coverage-runner executes test commands and processes coverage files. Be aware that:

- Test commands are executed in the working directory
- Coverage files are parsed and processed
- The `--repo` option clones and executes code from remote repositories

### Safe usage guidelines

1. **Review test configurations** before running coverage-runner
2. **Validate repository URLs** when using the `--repo` option
3. **Use trusted coverage files** only
4. **Run in isolated environments** when analyzing untrusted repositories
5. **Keep dependencies updated** regularly

### Dependency security

We regularly audit our dependencies for security vulnerabilities using:

- `npm audit`
- Dependabot security alerts
- Manual security reviews

## Scope

This security policy applies to:

- The core coverage-runner package
- CLI interface and commands
- Configuration parsing and processing
- Test runner integrations
- Coverage file processing and merging

## Out of scope

- Security issues in third-party test frameworks (Jest, Vitest, etc.)
- Issues in dependencies that don't affect coverage-runner
- General Node.js or npm security issues

## Security best practices

When using coverage-runner:

1. **Pin dependency versions** in production
2. **Use package-lock.json** for reproducible builds
3. **Audit dependencies** regularly
4. **Limit file system permissions** where possible
5. **Use CI/CD pipelines** for automated security scanning

## Contact

For security-related questions or concerns:

- **Email**: noritakaikeda@example.com
- **Security advisories**: https://github.com/NoritakaIkeda/coverage-runner/security/advisories

Thank you for helping keep coverage-runner secure!