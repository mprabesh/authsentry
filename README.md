# Auth Package

A lightweight, reusable authentication and authorization package for Node.js/Express applications featuring JWT tokens, refresh tokens, and Role-Based Access Control (RBAC).

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication with access and refresh tokens
- **Password Security** - Bcrypt-based password hashing and verification
- **Refresh Token Management** - Automatic token refresh with database storage
- **Role-Based Access Control (RBAC)** - Flexible role and permission system
- **Express Middleware** - Ready-to-use middleware for authentication and authorization
- **MongoDB Integration** - Seamless database connection and token storage
- **Token Revocation** - Secure logout with token invalidation

## 📦 Installation

```bash
npm install
```

## 🔧 Dependencies

- `bcryptjs` - Password hashing and comparison
- `jsonwebtoken` - JWT token generation and verification
- `mongoose` - MongoDB object modeling

## 🏗️ Project Structure

```
auth-package/
├── db.js              # Database connection utilities
├── auth.js            # Authentication functions
├── permissions.js     # Role-based permission definitions
├── middleware.js      # Express middleware functions
├── models/
│   └── RefreshToken.js # Refresh token database model
├── index.js           # Main entry point
├── package.json       # Package configuration
└── README.md          # This file
```

## 🚦 Quick Start

### 1. Database Connection

```javascript
const { connectDB } = require('./index');

// Connect to MongoDB
await connectDB('mongodb://localhost:27017/your-database');
```

### 2. User Registration & Authentication

```javascript
const { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken,
  storeRefreshToken 
} = require('./index');

// Register a new user
const password = 'userPassword123';
const hashedPassword = hashPassword(password);

// Save user to database with hashed password
const newUser = {
  email: 'user@example.com',
  password: hashedPassword,
  role: 'user'
};

// Login authentication
const loginPassword = 'userPassword123';
const isValidPassword = comparePassword(loginPassword, hashedPassword);

if (isValidPassword) {
  const user = { id: 'user123', email: 'user@example.com', role: 'user' };
  
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Store refresh token in database
  await storeRefreshToken(user.id, refreshToken);
  
  console.log('Login successful!');
}
```

### 3. Express Middleware Usage

```javascript
const express = require('express');
const { authMiddleware, authorizeRoles, authorizePermissions } = require('./index');

const app = express();

// Protected route - requires valid JWT token
app.get('/profile', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Welcome to your profile',
    user: req.user 
  });
});

// Admin-only route
app.get('/admin/dashboard', 
  authMiddleware, 
  authorizeRoles('admin'), 
  (req, res) => {
    res.json({ message: 'Admin dashboard access granted' });
  }
);

// Permission-based route
app.get('/users', 
  authMiddleware, 
  authorizePermissions('read:user'), 
  (req, res) => {
    res.json({ message: 'User data retrieved' });
  }
);
```

## 📚 API Reference

### Database Functions

#### `connectDB(uri)`
Establishes connection to MongoDB database.

- **Parameters**: `uri` (string) - MongoDB connection string
- **Returns**: Promise that resolves when connected
- **Example**: `await connectDB('mongodb://localhost:27017/myapp')`

### Authentication Functions

#### `hashPassword(password)`
Securely hashes a plain text password using bcrypt.

- **Parameters**: `password` (string) - Plain text password
- **Returns**: (string) - Hashed password
- **Example**: `const hash = hashPassword('mypassword123')`

#### `comparePassword(password, hash)`
Compares a plain text password with its hash.

- **Parameters**: 
  - `password` (string) - Plain text password
  - `hash` (string) - Hashed password
- **Returns**: (boolean) - True if passwords match
- **Example**: `const isValid = comparePassword('mypassword123', hashedPassword)`

#### `generateAccessToken(user)`
Creates a JWT access token with 15-minute expiration.

- **Parameters**: `user` (object) - User object containing `{ id, email, role }`
- **Returns**: (string) - JWT access token
- **Example**: `const token = generateAccessToken({ id: '123', email: 'user@test.com', role: 'user' })`

#### `generateRefreshToken(user)`
Creates a JWT refresh token with 7-day expiration.

- **Parameters**: `user` (object) - User object containing `{ id }`
- **Returns**: (string) - JWT refresh token
- **Example**: `const refreshToken = generateRefreshToken({ id: '123' })`

#### `storeRefreshToken(userId, token)`
Stores refresh token in MongoDB for future verification.

- **Parameters**: 
  - `userId` (string) - User identifier
  - `token` (string) - Refresh token to store
- **Returns**: Promise
- **Example**: `await storeRefreshToken('user123', refreshToken)`

#### `verifyRefreshToken(token)`
Validates refresh token and returns user data if valid.

- **Parameters**: `token` (string) - Refresh token to verify
- **Returns**: (object|null) - User payload or null if invalid
- **Example**: `const user = await verifyRefreshToken(token)`

#### `revokeRefreshToken(token)`
Invalidates a refresh token (used for logout).

- **Parameters**: `token` (string) - Refresh token to revoke
- **Returns**: Promise
- **Example**: `await revokeRefreshToken(token)`

### Middleware Functions

#### `authMiddleware(req, res, next)`
Express middleware that validates JWT tokens and adds user data to request.

- **Usage**: Protects routes requiring authentication
- **Headers**: Expects `Authorization: Bearer <token>`
- **Effect**: Adds `req.user` object with decoded token data
- **Example**: 
  ```javascript
  app.get('/protected', authMiddleware, (req, res) => {
    console.log(req.user); // { id, email, role }
  });
  ```

#### `authorizeRoles(...roles)`
Express middleware factory for role-based access control.

- **Parameters**: `roles` (string[]) - Array of allowed roles
- **Usage**: Restricts access to specific user roles
- **Example**: 
  ```javascript
  app.get('/admin', authMiddleware, authorizeRoles('admin', 'moderator'), handler);
  ```

#### `authorizePermissions(...permissions)`
Express middleware factory for permission-based access control.

- **Parameters**: `permissions` (string[]) - Array of required permissions
- **Usage**: Restricts access based on user permissions
- **Example**: 
  ```javascript
  app.delete('/users/:id', authMiddleware, authorizePermissions('delete:user'), handler);
  ```

## 🔐 Role-Based Access Control (RBAC)

### Default Permission System

The package includes a predefined role-permission mapping:

```javascript
const rolePermissions = {
  admin: ['read:user', 'write:user', 'delete:user'],
  user: ['read:user'],
  guest: []
};
```

### Role Definitions

- **admin**: Full access to user management (read, write, delete)
- **user**: Basic read access to user data
- **guest**: No permissions (restricted access)

### Custom Permissions

You can extend the permission system by modifying `permissions.js`:

```javascript
const rolePermissions = {
  admin: ['read:user', 'write:user', 'delete:user', 'manage:system'],
  moderator: ['read:user', 'write:user', 'moderate:content'],
  user: ['read:user', 'edit:profile'],
  guest: ['read:public']
};
```

## 🗄️ Database Models

### RefreshToken Schema

```javascript
{
  userId: ObjectId,        // Reference to user ID
  token: String,           // Unique refresh token
  expiresAt: Date,         // Token expiration timestamp
  createdAt: Date,         // Auto-generated creation time
  updatedAt: Date          // Auto-generated update time
}
```

## 🔧 Environment Variables

For production security, set these environment variables:

```bash
ACCESS_SECRET=your_super_secure_access_token_secret
REFRESH_SECRET=your_super_secure_refresh_token_secret
```

**Note**: If not provided, the package uses default secrets (not recommended for production).

## 💡 Complete Usage Example

```javascript
const express = require('express');
const {
  connectDB,
  authMiddleware,
  authorizeRoles,
  authorizePermissions,
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken
} = require('./index');

const app = express();
app.use(express.json());

// Initialize database connection
connectDB('mongodb://localhost:27017/auth-demo');

// User registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;
    
    // Hash password before storing
    const hashedPassword = hashPassword(password);
    
    // Store user in database (your implementation)
    const user = await saveUserToDatabase({ email, password: hashedPassword, role });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: user.id 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fetch user from database (your implementation)
    const user = await findUserByEmail(email);
    
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    const refreshToken = generateRefreshToken({ id: user.id });
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);
    
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token refresh
app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    const userData = await verifyRefreshToken(refreshToken);
    if (!userData) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const user = await findUserById(userData.id);
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
app.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Profile data',
    user: req.user
  });
});

// Admin-only route
app.get('/admin/users', 
  authMiddleware, 
  authorizeRoles('admin'), 
  (req, res) => {
    res.json({ message: 'All users data (admin only)' });
  }
);

// Permission-based route
app.delete('/users/:id', 
  authMiddleware, 
  authorizePermissions('delete:user'), 
  (req, res) => {
    res.json({ message: `User ${req.params.id} deleted` });
  }
);

// Multi-role access
app.get('/moderation', 
  authMiddleware, 
  authorizeRoles('admin', 'moderator'), 
  (req, res) => {
    res.json({ message: 'Moderation panel' });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Auth server running on port ${PORT}`);
});
```

## 🔒 Security Best Practices

1. **Use Environment Variables**: Always set `ACCESS_SECRET` and `REFRESH_SECRET` in production
2. **HTTPS Only**: Use HTTPS in production to protect tokens in transit
3. **Short-lived Access Tokens**: Default 15-minute expiry reduces risk exposure
4. **Secure Refresh Tokens**: 7-day expiry with database storage for revocation
5. **Password Strength**: Implement strong password requirements
6. **Rate Limiting**: Add rate limiting to authentication endpoints
7. **Input Validation**: Validate and sanitize all inputs
8. **Regular Token Cleanup**: Periodically remove expired tokens from database

## 🎯 Use Cases

- **REST APIs** - Secure API endpoints with JWT authentication
- **Web Applications** - Session management with refresh tokens
- **Multi-tenant Apps** - Role-based access control for different user types
- **Admin Dashboards** - Permission-based feature access
- **Mobile Apps** - Token-based authentication for mobile clients

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please create an issue in the repository.
