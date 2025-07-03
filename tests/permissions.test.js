const { rolePermissions } = require('../permissions');

describe('Permissions System', () => {
  test('should have default role permissions', () => {
    expect(rolePermissions).toBeDefined();
    expect(typeof rolePermissions).toBe('object');
  });

  test('should contain admin role with permissions', () => {
    expect(rolePermissions.admin).toBeDefined();
    expect(Array.isArray(rolePermissions.admin)).toBe(true);
    expect(rolePermissions.admin).toContain('read:user');
    expect(rolePermissions.admin).toContain('write:user');
    expect(rolePermissions.admin).toContain('delete:user');
  });

  test('should contain user role with limited permissions', () => {
    expect(rolePermissions.user).toBeDefined();
    expect(Array.isArray(rolePermissions.user)).toBe(true);
    expect(rolePermissions.user).toContain('read:user');
    expect(rolePermissions.user).not.toContain('write:user');
    expect(rolePermissions.user).not.toContain('delete:user');
  });

  test('should contain guest role with no permissions', () => {
    expect(rolePermissions.guest).toBeDefined();
    expect(Array.isArray(rolePermissions.guest)).toBe(true);
    expect(rolePermissions.guest).toHaveLength(0);
  });

  test('should allow dynamic role modification', () => {
    // Save original state
    const originalModerator = rolePermissions.moderator;
    
    // Add new role
    rolePermissions.moderator = ['read:user', 'moderate:content'];
    
    expect(rolePermissions.moderator).toBeDefined();
    expect(rolePermissions.moderator).toContain('read:user');
    expect(rolePermissions.moderator).toContain('moderate:content');
    
    // Restore original state
    if (originalModerator) {
      rolePermissions.moderator = originalModerator;
    } else {
      delete rolePermissions.moderator;
    }
  });

  test('should allow permission addition to existing roles', () => {
    const originalAdminPermissions = [...rolePermissions.admin];
    
    // Add new permission
    rolePermissions.admin.push('manage:system');
    
    expect(rolePermissions.admin).toContain('manage:system');
    
    // Restore original permissions
    rolePermissions.admin = originalAdminPermissions;
  });

  test('should handle undefined roles gracefully', () => {
    const nonExistentRole = rolePermissions.nonExistentRole;
    expect(nonExistentRole).toBeUndefined();
  });
});
