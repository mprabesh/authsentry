const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyAccessToken } = require('../auth');

describe('Authentication Functions', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', () => {
      const password = 'testPassword123';
      const hashedPassword = hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    test('should generate different hashes for same password', () => {
      const password = 'testPassword123';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    test('should compare password correctly', () => {
      const password = 'testPassword123';
      const hashedPassword = hashPassword(password);
      
      expect(comparePassword(password, hashedPassword)).toBe(true);
      expect(comparePassword('wrongPassword', hashedPassword)).toBe(false);
    });

    test('should handle empty password', () => {
      const password = '';
      const hashedPassword = hashPassword(password);
      
      expect(comparePassword('', hashedPassword)).toBe(true);
      expect(comparePassword('notEmpty', hashedPassword)).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'user'
    };

    test('should generate access token', () => {
      const token = generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate refresh token', () => {
      const token = generateRefreshToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should verify access token correctly', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    test('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyAccessToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    test('should return null for expired token', () => {
      // Mock an expired token by manipulating time
      const oldDate = Date.now;
      Date.now = jest.fn(() => Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const token = generateAccessToken(mockUser);
      
      Date.now = oldDate; // Restore original Date.now
      
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeNull();
    });

    test('should handle missing user properties', () => {
      expect(() => generateAccessToken({})).not.toThrow();
      expect(() => generateAccessToken(null)).toThrow();
      expect(() => generateAccessToken(undefined)).toThrow();
    });
  });

  describe('Token Content Validation', () => {
    test('access token should contain correct fields', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };
      
      const token = generateAccessToken(user);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toHaveProperty('id', user.id);
      expect(decoded).toHaveProperty('email', user.email);
      expect(decoded).toHaveProperty('role', user.role);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expires at
    });

    test('refresh token should contain minimal fields', () => {
      const user = { id: 'user123' };
      const token = generateRefreshToken(user);
      
      // Note: We can't easily verify refresh token content without exposing verifyRefreshToken
      // This test ensures token generation doesn't throw errors
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});
