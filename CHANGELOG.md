# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
