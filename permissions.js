const rolePermissions = {
  admin: ['read:user', 'write:user', 'delete:user'],
  user: ['read:user'],
  guest: []
};

module.exports = { rolePermissions };
