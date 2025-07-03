const express = require('express');
const request = require('supertest');
const { authMiddleware, authorizeRoles, authorizePermissions, optionalAuthMiddleware } = require('../middleware');
const { generateAccessToken } = require('../auth');
const { rolePermissions } = require('../permissions');

describe('Middleware Functions', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('authMiddleware', () => {
    test('should reject request without authorization header', async () => {
      app.get('/test', authMiddleware, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authorization header required');
    });

    test('should reject request with invalid authorization format', async () => {
      app.get('/test', authMiddleware, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'InvalidFormat token123');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Bearer token required');
    });

    test('should reject request with missing token', async () => {
      app.get('/test', authMiddleware, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer ');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token required');
    });

    test('should reject request with invalid token', async () => {
      app.get('/test', authMiddleware, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid.token.here');
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Token verification failed');
    });

    test('should accept request with valid token', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'user' };
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.role).toBe(user.role);
    });
  });

  describe('authorizeRoles', () => {
    test('should reject unauthenticated user', async () => {
      app.get('/test', authorizeRoles('admin'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    test('should reject user with wrong role', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'user' };
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, authorizeRoles('admin'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toContain('Required roles: admin');
      expect(response.body.message).toContain('Your role: user');
    });

    test('should accept user with correct role', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'admin' };
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, authorizeRoles('admin'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should accept user with any of multiple roles', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'moderator' };
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, authorizeRoles('admin', 'moderator'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject user without role property', async () => {
      const user = { id: 'user123', email: 'test@example.com' }; // No role
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, authorizeRoles('admin'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('User role not defined');
    });
  });

  describe('authorizePermissions', () => {
    test('should reject user without required permissions', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'user' };
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, authorizePermissions('delete:user'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
      expect(response.body.message).toContain('Missing permissions: delete:user');
    });

    test('should accept user with required permissions', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'admin' };
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, authorizePermissions('read:user'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should require all permissions when multiple specified', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'admin' };
      const token = generateAccessToken(user);

      app.get('/test', authMiddleware, authorizePermissions('read:user', 'nonexistent:permission'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Missing permissions: nonexistent:permission');
    });
  });

  describe('optionalAuthMiddleware', () => {
    test('should proceed without token', async () => {
      app.get('/test', optionalAuthMiddleware, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });

    test('should add user when valid token provided', async () => {
      const user = { id: 'user123', email: 'test@example.com', role: 'user' };
      const token = generateAccessToken(user);

      app.get('/test', optionalAuthMiddleware, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(user.id);
    });

    test('should set user to null for invalid token', async () => {
      app.get('/test', optionalAuthMiddleware, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid.token');
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });
  });
});
