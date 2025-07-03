const { verifyAccessToken } = require('./auth');
const { rolePermissions } = require('./permissions');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token required' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const user = verifyAccessToken(token);
    if (!user) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token verification failed' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.role) {
      return res.status(403).json({ error: 'User role not defined' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
}

function authorizePermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.role) {
      return res.status(403).json({ error: 'User role not defined' });
    }

    const userPermissions = rolePermissions[req.user.role] || [];
    const missingPermissions = permissions.filter(p => !userPermissions.includes(p));

    if (missingPermissions.length > 0) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Missing permissions: ${missingPermissions.join(', ')}`,
        required: permissions,
        userPermissions: userPermissions
      });
    }

    next();
  };
}

// Optional authentication - doesn't fail if no token provided
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user;
  } catch (error) {
    req.user = null;
  }
  
  next();
}

// Middleware to combine multiple role checks with OR logic
function authorizeAnyRole(...roles) {
  return authorizeRoles(...roles);
}

// Middleware to check if user has ANY of the specified permissions
function authorizeAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.role) {
      return res.status(403).json({ error: 'User role not defined' });
    }

    const userPermissions = rolePermissions[req.user.role] || [];
    const hasAnyPermission = permissions.some(p => userPermissions.includes(p));

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Need at least one of: ${permissions.join(', ')}`,
        userPermissions: userPermissions
      });
    }

    next();
  };
}

module.exports = { 
  authMiddleware, 
  authorizeRoles, 
  authorizePermissions,
  optionalAuthMiddleware,
  authorizeAnyRole,
  authorizeAnyPermission
};
