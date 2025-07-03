# Testing the GitHub Actions Workflow

## Quick Test Guide

To test the new GitHub Actions workflow for automated publishing:

### 1. Verify CI Workflow is Working

The CI workflow should already be running on the latest push. Check:
- Go to GitHub → Actions tab
- Look for "CI" workflow runs
- Verify it passes on Node.js 16, 18, and 20

### 2. Test the Publishing Workflow

**Option A: Create a Patch Release (Recommended)**
```bash
# Bump version to 1.0.3
npm version patch

# This will update package.json and create a git commit
# Now create and push the tag
git tag -a v1.0.3 -m "Release version 1.0.3 - Test GitHub Actions workflow"
git push origin v1.0.3
```

**Option B: Manual Testing (Alternative)**
```bash
# Create a test tag without version bump
git tag -a v1.0.2-test -m "Test GitHub Actions workflow"
git push origin v1.0.2-test
```

### 3. Monitor the Workflow

1. **Go to GitHub Actions:**
   - Navigate to: https://github.com/mprabesh/authsentry/actions
   - Look for "Build and Publish to GitHub Packages" workflow

2. **Check Progress:**
   - **Test Job**: Runs tests on Node.js 16, 18, 20
   - **Publish Job**: Publishes to GitHub Packages
   - **Notify Job**: Shows success/failure status

### 4. Verify Success

After successful workflow completion:

1. **Check GitHub Packages:**
   - Go to: https://github.com/mprabesh/authsentry/packages
   - Verify `authsentry` package appears

2. **Check GitHub Releases:**
   - Go to: https://github.com/mprabesh/authsentry/releases
   - Verify new release is created

3. **Test Installation:**
   ```bash
   # Create test directory
   mkdir test-authsentry && cd test-authsentry
   npm init -y
   
   # Create .npmrc for GitHub Packages
   echo "@mprabesh:registry=https://npm.pkg.github.com" > .npmrc
   
   # Install the package
   npm install @mprabesh/authsentry
   
   # Test import
   node -e "console.log(require('@mprabesh/authsentry'))"
   ```

## Expected Workflow Results

### Successful CI Run
- ✅ Tests pass on Node.js 16, 18, 20
- ✅ Security audit shows no high vulnerabilities
- ✅ Test coverage report generated

### Successful Publish Run
- ✅ Package version matches git tag
- ✅ Package published to GitHub Packages as `@mprabesh/authsentry`
- ✅ GitHub Release created with release notes
- ✅ Installation instructions included in release

## Troubleshooting

### Common Issues

1. **Version Mismatch Error:**
   ```
   Error: Package version (1.0.2) does not match tag version (1.0.3)
   ```
   **Solution:** Ensure `npm version` was run before creating the tag

2. **Authentication Error:**
   ```
   Error: 401 Unauthorized
   ```
   **Solution:** Check repository permissions (should work automatically with GITHUB_TOKEN)

3. **Package Already Exists:**
   ```
   Error: Cannot publish over existing version
   ```
   **Solution:** GitHub Packages doesn't allow overwriting versions. Use a new version number.

### Manual Verification

If workflows fail, verify manually:

```bash
# Check if package.json is correct
cat package.json | grep -E "(name|version)"

# Check if all tests pass locally
npm test

# Check if security audit passes
npm audit

# Verify git tag matches package version
git describe --tags --abbrev=0
node -p "require('./package.json').version"
```

## Next Steps After Testing

1. **Update CHANGELOG.md** if using real version (not test tag)
2. **Delete test tags** if created:
   ```bash
   git tag -d v1.0.2-test
   git push origin :refs/tags/v1.0.2-test
   ```
3. **Document any issues** found during testing
4. **Share installation instructions** with users

## Production Release Process

After testing confirms everything works:

1. **Plan the release:**
   - Decide on version number (patch/minor/major)
   - Update CHANGELOG.md with all changes
   - Ensure all features are documented

2. **Create the release:**
   ```bash
   npm version [patch|minor|major]
   git push origin main
   git push origin --tags
   ```

3. **Monitor and verify:**
   - Check GitHub Actions completion
   - Verify package availability
   - Test installation in clean environment
   - Update documentation if needed

The authsentry package is now ready for automated releases! 🚀
