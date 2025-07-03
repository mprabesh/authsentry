const { verifyAccessToken } = require('./index');
const { rolePermissions } = require('./permissions');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  const user = verifyAccessToken(token);
  if (!user) return res.status(403).json({ error: 'Invalid token' });

  req.user = user;
  next();
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied for role' });
    next();
  };
}

function authorizePermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ error: 'Not authenticated' });
    const allowed = rolePermissions[req.user.role] || [];
    if (!permissions.every(p => allowed.includes(p))) return res.status(403).json({ error: 'Permission denied' });
    next();
  };
}

module.exports = { authMiddleware, authorizeRoles, authorizePermissions };
