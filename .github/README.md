# 🚀 CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated testing, quality checks, and deployment of the BREAD Creative Platform.

## 📋 Workflows Overview

### 1. Main CI/CD Pipeline (`ci.yml`)
**Triggers**: Push to `main`/`develop`, Pull Requests to `main`

**Jobs**:
- **Quality Gates**: ESLint, Prettier formatting checks
- **Testing**: Run test suite with coverage reporting
- **Build**: Create production build artifacts
- **Deploy**: Deploy to Netlify production (main branch only)

**Features**:
- ✅ Parallel job execution for faster builds
- 📊 Test coverage reporting with Codecov
- 🚀 Automatic production deployment
- 💬 Deployment status comments on PRs

### 2. Preview Deployment (`preview.yml`)
**Triggers**: Pull Request events (opened, updated, reopened)

**Features**:
- 🔍 Deploy preview builds for every PR
- 📍 Unique preview URLs with PR aliases
- 💬 Automatic PR comments with preview links
- 🧹 Cleanup preview deployments when PRs are closed
- ✅ Quality checks before deployment

### 3. Security & Dependencies (`security.yml`)
**Triggers**: Daily schedule (2 AM UTC), Push to main, PRs

**Features**:
- 🔒 Security vulnerability scanning with Snyk
- 📦 Dependency review for PRs
- 🔄 Automated outdated dependency reports
- 📊 SARIF upload for GitHub Security tab
- 🤖 Automatic issue creation for dependency updates

## 🔧 Required Secrets

Add these secrets in your GitHub repository settings:

### Netlify Deployment
```
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
```

### Security Scanning (Optional)
```
SNYK_TOKEN=your_snyk_token
```

### Code Coverage (Optional)
```
CODECOV_TOKEN=your_codecov_token
```

## 📊 Quality Gates

All workflows enforce these quality standards:

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting consistency
- **Tests**: All tests must pass
- **Build**: Successful production build
- **Security**: No high-severity vulnerabilities

## 🚀 Deployment Strategy

### Production Deployment
- **Trigger**: Push to `main` branch
- **Target**: Netlify production environment
- **URL**: Your main domain
- **Requirements**: All quality gates must pass

### Preview Deployment
- **Trigger**: Pull Request to `main`
- **Target**: Netlify preview environment
- **URL**: `https://pr-{number}--{site-name}.netlify.app`
- **Cleanup**: Automatic when PR is closed

## 📈 Monitoring & Reporting

### Test Coverage
- Coverage reports uploaded to Codecov
- Minimum thresholds: 70% (lines, functions, branches, statements)
- Coverage reports available in PR comments

### Security Scanning
- Daily automated scans
- Results uploaded to GitHub Security tab
- Automatic issue creation for vulnerabilities

### Dependency Management
- Daily checks for outdated dependencies
- Automatic issue creation with update recommendations
- License compliance checking

## 🔄 Workflow Status

You can monitor workflow status in:
- **Actions tab**: Real-time workflow execution
- **PR checks**: Status checks on pull requests
- **Security tab**: Vulnerability reports
- **Issues**: Automated dependency reports

## 🛠️ Local Development

To run the same checks locally:

```bash
# Quality checks
npm run lint
npm run format

# Testing
npm run test:run
npm run test:coverage

# Build
npm run build
```

## 📝 Customization

### Adding New Workflows
1. Create `.yml` file in `.github/workflows/`
2. Define triggers, jobs, and steps
3. Add required secrets if needed
4. Test with a pull request

### Modifying Quality Gates
- Update ESLint rules in `.eslintrc.js`
- Modify Prettier config in `.prettierrc`
- Adjust coverage thresholds in `vitest.config.ts`

### Environment Configuration
- Add environment-specific secrets
- Configure deployment targets
- Set up additional quality checks

---

*This CI/CD pipeline ensures code quality, security, and reliable deployments for the BREAD Creative Platform.*
