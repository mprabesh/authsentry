# GitHub Actions Workflows Guide

This repository includes two GitHub Actions workflows to automate testing, building, and publishing of the `authsentry` package.

## Workflows Overview

### 1. Continuous Integration (CI) - `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
- Tests the package on Node.js versions 18 and 20 (primary support)
- Tests Node.js 16 compatibility separately (non-blocking)
- Runs security audits
- Generates test coverage reports
- Uploads coverage to Codecov (optional)

### 2. Build and Publish - `.github/workflows/publish.yml`

**Triggers:**
- When a version tag is pushed (e.g., `v1.0.3`, `v2.1.0`)
- Manual workflow dispatch

**What it does:**
- Runs full test suite on Node.js versions 18 and 20
- Verifies package version matches the git tag
- Publishes package to GitHub Packages as `@mprabesh/authsentry`
- Creates a GitHub Release with release notes
- Provides installation instructions

## Publishing a New Version

### Step 1: Update Version and Changelog

1. **Update version in `package.json`:**
   ```bash
   npm version patch  # for bug fixes (1.0.2 -> 1.0.3)
   npm version minor  # for new features (1.0.2 -> 1.1.0)
   npm version major  # for breaking changes (1.0.2 -> 2.0.0)
   ```

2. **Update `CHANGELOG.md`:**
   - Add new version section
   - Document all changes, fixes, and new features
   - Follow semantic versioning principles

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "chore: bump version to X.Y.Z"
   ```

### Step 2: Create and Push Version Tag

```bash
# Create annotated tag
git tag -a v1.0.3 -m "Release version 1.0.3"

# Push tag to trigger publish workflow
git push origin v1.0.3
```

### Step 3: Monitor Workflow

1. Go to GitHub → Actions tab
2. Watch the "Build and Publish to GitHub Packages" workflow
3. Verify all jobs complete successfully

### Step 4: Verify Publication

After successful workflow completion:

1. **Check GitHub Packages:**
   - Go to GitHub → Packages tab
   - Verify `@mprabesh/authsentry` package is published

2. **Check GitHub Releases:**
   - Go to GitHub → Releases tab
   - Verify new release is created with proper notes

## Installation Instructions for Users

### From GitHub Packages

1. **Create or update `.npmrc` file in your project:**
   ```
   @mprabesh:registry=https://npm.pkg.github.com
   ```

2. **Install the package:**
   ```bash
   npm install @mprabesh/authsentry
   ```

3. **Use in your code:**
   ```javascript
   const { createAuth, authMiddleware } = require('@mprabesh/authsentry');
   // or
   import { createAuth, authMiddleware } from '@mprabesh/authsentry';
   ```

### Authentication for Private Packages

If the package becomes private, users need to authenticate:

1. **Create GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `read:packages` permission

2. **Login to GitHub Packages:**
   ```bash
   npm login --scope=@mprabesh --registry=https://npm.pkg.github.com
   ```

## Workflow Configuration Details

### Environment Variables and Secrets

The workflows use these GitHub secrets (automatically available):
- `GITHUB_TOKEN`: For authentication with GitHub Packages and API

### Node.js Version Support

The package is tested on:
- Node.js 18 (LTS, primary support)
- Node.js 20 (Current, primary support)
- Node.js 16 (compatibility testing, may have limitations)

Primary CI testing focuses on Node.js 18 and 20 for optimal compatibility with all dependencies. Node.js 16 compatibility is tested separately in a non-blocking manner due to some modern dependencies requiring Node.js 18+.

### Package Configuration

During publishing, the workflow temporarily modifies `package.json` to:
- Add scope: `@mprabesh/authsentry`
- Configure `publishConfig` for GitHub Packages
- Restore original configuration after publishing

## Troubleshooting

### Common Issues

1. **Version mismatch error:**
   - Ensure `package.json` version matches the git tag version
   - Example: Tag `v1.0.3` must match `"version": "1.0.3"` in package.json

2. **Authentication failed:**
   - Verify repository permissions
   - Check if `GITHUB_TOKEN` has proper permissions

3. **Tests failing:**
   - Run tests locally: `npm test`
   - Fix any failing tests before tagging

4. **Package already exists:**
   - GitHub Packages doesn't allow overwriting existing versions
   - Increment version number and create new tag

### Manual Publishing (Fallback)

If workflows fail, you can publish manually:

```bash
# Configure npm for GitHub Packages
npm config set @mprabesh:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN

# Temporarily update package.json
cp package.json package.json.backup
# Manually add scope and publishConfig

# Publish
npm publish

# Restore original package.json
mv package.json.backup package.json
```

## Best Practices

1. **Always test locally before tagging:**
   ```bash
   npm test
   npm run test:coverage
   npm audit
   ```

2. **Use semantic versioning:**
   - Patch (1.0.1): Bug fixes
   - Minor (1.1.0): New features (backward compatible)
   - Major (2.0.0): Breaking changes

3. **Keep CHANGELOG.md updated:**
   - Document all changes
   - Include migration notes for breaking changes

4. **Test installation after publishing:**
   - Create test project
   - Install from GitHub Packages
   - Verify functionality

## Monitoring and Maintenance

- Monitor GitHub Actions for failed workflows
- Review security audit results regularly
- Keep dependencies updated
- Monitor package download statistics in GitHub Packages
