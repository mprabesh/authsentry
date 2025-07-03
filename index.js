const { connectDB } = require('./db');
const auth = require('./auth');
const middleware = require('./middleware');
const { rolePermissions } = require('./permissions');

module.exports = {
  // Database
  connectDB,
  
  // Authentication functions
  ...auth,
  
  // Middleware functions
  ...middleware,
  
  // Permissions
  rolePermissions
};
