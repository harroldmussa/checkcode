// ===== src/middleware/auth.js =====
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class AuthMiddleware {
  generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn,
      issuer: 'code-quality-dashboard',
      audience: 'dashboard-users'
    });
  }

  verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          error: 'Access denied',
          message: 'No token provided'
        });
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Token verification failed:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Please login again'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Token is malformed or invalid'
        });
      }

      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }
  }

  optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        req.user = null;
        return next();
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.user = decoded;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }

  // API Key authentication 
  verifyApiKey(req, res, next) {
    try {
      const apiKey = req.headers['x-api-key'] || req.query.apiKey;
      
      if (!apiKey) {
        return res.status(401).json({
          error: 'API key required',
          message: 'Provide API key in x-api-key header or apiKey query parameter'
        });
      }

      // LATER this is to store API keys in database with proper hashing
      const validApiKeys = (process.env.VALID_API_KEYS || '').split(',');
      
      if (!validApiKeys.includes(apiKey)) {
        logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 8)}...`);
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'The provided API key is not valid'
        });
      }

      req.apiKey = apiKey;
      req.user = { type: 'api-key', key: apiKey };
      next();
    } catch (error) {
      logger.error('API key verification failed:', error);
      return res.status(500).json({
        error: 'Authentication error',
        message: 'Internal authentication error'
      });
    }
  }

  // Hash password utility
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `Required role(s): ${requiredRoles.join(', ')}`
        });
      }

      next();
    };
  }

  userRateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
      const userId = req.user?.id || req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!requests.has(userId)) {
        requests.set(userId, []);
      }

      const userRequests = requests.get(userId);
      
      // This is to remove old requests outside the window
      const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
      requests.set(userId, recentRequests);

      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000} seconds`,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      recentRequests.push(now);
      next();
    };
  }
}

module.exports = new AuthMiddleware();