# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-07-03

### Fixed
- **GitHub Actions Permissions**: Fixed "resource not accessible by integration" error
- **Release Creation**: Replaced deprecated `actions/create-release@v1` with GitHub CLI
- **Workflow Permissions**: Added proper permissions for GitHub Packages and release creation

## [1.0.3] - 2025-07-03

### Added
- **GitHub Actions Workflows**: Complete CI/CD pipeline
  - CI workflow for automated testing on push/PR
  - Publish workflow for automated releases to GitHub Packages
  - Multi-Node.js version testing (16, 18, 20)
  - Security audit integration
  - Test coverage reporting
  - Automatic GitHub Release creation
- **GitHub Packages Integration**: Package published as `@mprabesh/authsentry`
- **Comprehensive Documentation**: Added workflow guides and release process documentation

### Changed
- **Installation Instructions**: Updated README.md with GitHub Packages installation steps
- **Repository Metadata**: Updated all references to point to `mprabesh/authsentry`

## [1.0.2] - 2025-07-03

### Changed
- **Package Name**: Renamed from `auth-helper-advanced` to `authsentry`
  - Updated package.json name field
  - Updated all documentation and examples
  - Simplified import statement: `require('authsentry')`

## [1.0.1] - 2025-07-03

### Updated
- **bcryptjs**: Updated from v2.4.3 to v3.0.2
  - Now generates 2b hashes by default (backward compatible with 2a hashes)
  - Improved ES module support
  - Better TypeScript support
- **jest**: Updated from v29.7.0 to v30.0.4
  - Improved test performance and reliability
  - Updated error messages in middleware tests
- **supertest**: Updated from v6.3.3 to v7.1.1
  - Better HTTP testing capabilities
- **mongodb-memory-server**: Updated from v9.1.1 to v10.1.4
  - Improved test database performance
- **Node.js**: Minimum version requirement updated from 14.0.0 to 16.0.0

### Fixed
- Removed deprecated MongoDB connection options (`useNewUrlParser`, `useUnifiedTopology`)
- Fixed test compatibility with updated dependencies
- Improved error handling in database connection tests
- Fixed JWT token generation in tests to avoid duplicate key errors

### Changed
- RefreshToken model now accepts mixed types for `userId` field for better flexibility
- Database connection function now returns connection object for better testing

### Security
- All dependencies updated to latest secure versions
- No known vulnerabilities in dependency tree

## [1.0.0] - 2025-01-01

### Added
- Initial release of auth-helper-advanced
- JWT authentication with access and refresh tokens
- Password hashing and verification
- Role-Based Access Control (RBAC)
- Express middleware for authentication and authorization
- MongoDB integration for token storage
- Comprehensive test suite
- Full documentation and examples
