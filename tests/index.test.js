const authHelper = require('../index');

describe('Package Integration', () => {
  test('should export all required functions', () => {
    // Database functions
    expect(authHelper.connectDB).toBeDefined();
    expect(typeof authHelper.connectDB).toBe('function');

    // Authentication functions
    expect(authHelper.hashPassword).toBeDefined();
    expect(authHelper.comparePassword).toBeDefined();
    expect(authHelper.generateAccessToken).toBeDefined();
    expect(authHelper.generateRefreshToken).toBeDefined();
    expect(authHelper.storeRefreshToken).toBeDefined();
    expect(authHelper.verifyRefreshToken).toBeDefined();
    expect(authHelper.revokeRefreshToken).toBeDefined();
    expect(authHelper.verifyAccessToken).toBeDefined();

    // Middleware functions
    expect(authHelper.authMiddleware).toBeDefined();
    expect(authHelper.authorizeRoles).toBeDefined();
    expect(authHelper.authorizePermissions).toBeDefined();
    expect(authHelper.optionalAuthMiddleware).toBeDefined();
    expect(authHelper.authorizeAnyRole).toBeDefined();
    expect(authHelper.authorizeAnyPermission).toBeDefined();

    // Permissions
    expect(authHelper.rolePermissions).toBeDefined();
    expect(typeof authHelper.rolePermissions).toBe('object');
  });

  test('should maintain API consistency', () => {
    // Check that function signatures are consistent
    expect(authHelper.hashPassword.length).toBe(1);
    expect(authHelper.comparePassword.length).toBe(2);
    expect(authHelper.generateAccessToken.length).toBe(1);
    expect(authHelper.generateRefreshToken.length).toBe(1);
  });

  test('should allow role permissions modification', () => {
    const originalRoles = { ...authHelper.rolePermissions };

    // Test modification
    authHelper.rolePermissions.testRole = ['test:permission'];
    expect(authHelper.rolePermissions.testRole).toContain('test:permission');

    // Restore original state
    Object.keys(authHelper.rolePermissions).forEach(key => {
      if (!originalRoles[key]) {
        delete authHelper.rolePermissions[key];
      }
    });
  });

  test('should work with typical usage pattern', () => {
    const user = { id: 'test123', email: 'test@example.com', role: 'user' };
    
    // Hash password
    const hashedPassword = authHelper.hashPassword('testPassword');
    expect(hashedPassword).toBeDefined();
    
    // Verify password
    const isValid = authHelper.comparePassword('testPassword', hashedPassword);
    expect(isValid).toBe(true);
    
    // Generate tokens
    const accessToken = authHelper.generateAccessToken(user);
    const refreshToken = authHelper.generateRefreshToken(user);
    
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    
    // Verify access token
    const decoded = authHelper.verifyAccessToken(accessToken);
    expect(decoded.id).toBe(user.id);
  });
});
