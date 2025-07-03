const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDB } = require('../db');
const { storeRefreshToken, verifyRefreshToken, revokeRefreshToken } = require('../auth');
const RefreshToken = require('../models/RefreshToken');

describe('Database Integration Tests', () => {
  let mongoServer;
  let mongoUri;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await connectDB(mongoUri);
    // Clean database before each test
    await RefreshToken.deleteMany({});
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('Database Connection', () => {
    test('should connect to database successfully', async () => {
      const connection = await connectDB(mongoUri);
      expect(connection).toBeDefined();
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });

    test('should handle connection errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      await expect(connectDB('invalid-uri')).rejects.toThrow();

      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });

  describe('Refresh Token Database Operations', () => {
    test('should store refresh token', async () => {
      const userId = 'user123';
      const token = 'sample-refresh-token';

      await storeRefreshToken(userId, token);

      const storedToken = await RefreshToken.findOne({ token });
      expect(storedToken).toBeDefined();
      expect(storedToken.userId.toString()).toBe(userId);
      expect(storedToken.token).toBe(token);
      expect(storedToken.expiresAt).toBeInstanceOf(Date);
    });

    test('should verify valid refresh token', async () => {
      const userId = 'user123';
      
      // Create a valid JWT refresh token
      const jwt = require('jsonwebtoken');
      const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
      const token = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });

      await storeRefreshToken(userId, token);

      const result = await verifyRefreshToken(token);
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });

    test('should return null for non-existent refresh token', async () => {
      const jwt = require('jsonwebtoken');
      const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
      const token = jwt.sign({ id: 'user123' }, REFRESH_SECRET, { expiresIn: '7d' });

      // Don't store the token
      const result = await verifyRefreshToken(token);
      expect(result).toBeNull();
    });

    test('should return null for expired refresh token', async () => {
      const userId = 'user123';
      
      // Create an expired JWT token
      const jwt = require('jsonwebtoken');
      const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
      const token = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '-1d' }); // Expired

      await storeRefreshToken(userId, token);

      const result = await verifyRefreshToken(token);
      expect(result).toBeNull();
    });

    test('should revoke refresh token', async () => {
      const userId = 'user123';
      const jwt = require('jsonwebtoken');
      const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
      const token = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });

      await storeRefreshToken(userId, token);

      // Verify token exists
      let storedToken = await RefreshToken.findOne({ token });
      expect(storedToken).toBeDefined();

      // Revoke token
      await revokeRefreshToken(token);

      // Verify token is removed
      storedToken = await RefreshToken.findOne({ token });
      expect(storedToken).toBeNull();
    });

    test('should handle multiple tokens for same user', async () => {
      const userId = 'user123';
      const jwt = require('jsonwebtoken');
      const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
      
      const token1 = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
      const token2 = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });

      await storeRefreshToken(userId, token1);
      await storeRefreshToken(userId, token2);

      const tokens = await RefreshToken.find({ userId });
      expect(tokens).toHaveLength(2);
    });

    test('should enforce unique token constraint', async () => {
      const userId = 'user123';
      const token = 'duplicate-token';

      await storeRefreshToken(userId, token);

      // Trying to store the same token again should fail
      await expect(storeRefreshToken(userId, token)).rejects.toThrow();
    });
  });

  describe('RefreshToken Model', () => {
    test('should have correct schema structure', () => {
      const schema = RefreshToken.schema;
      
      expect(schema.paths.userId).toBeDefined();
      expect(schema.paths.token).toBeDefined();
      expect(schema.paths.expiresAt).toBeDefined();
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });

    test('should require userId and token fields', async () => {
      const invalidToken = new RefreshToken({});
      
      await expect(invalidToken.save()).rejects.toThrow();
    });

    test('should automatically set timestamps', async () => {
      const userId = 'user123';
      const token = 'test-token';

      await storeRefreshToken(userId, token);

      const storedToken = await RefreshToken.findOne({ token });
      expect(storedToken.createdAt).toBeInstanceOf(Date);
      expect(storedToken.updatedAt).toBeInstanceOf(Date);
    });
  });
});
