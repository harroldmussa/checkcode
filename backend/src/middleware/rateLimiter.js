const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const requestStore = new Map();

class RateLimiterMiddleware {
  basic() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, 
      max: 100, 
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 15 * 60 
      },
      standardHeaders: true, 
      legacyHeaders: false, 
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(15 * 60)
        });
      }
    });
  }

  analysis() {
    return rateLimit({
      windowMs: 10 * 60 * 1000, 
      max: 5, 
      message: {
        error: 'Analysis rate limit exceeded',
        message: 'Too many analysis requests. Please wait before analyzing another repository.',
        retryAfter: 10 * 60
      },
      keyGenerator: (req) => {
        return req.headers['x-api-key'] || req.user?.id || req.ip;
      },
      handler: (req, res) => {
        logger.warn(`Analysis rate limit exceeded for: ${req.headers['x-api-key'] || req.ip}`);
        res.status(429).json({
          error: 'Analysis rate limit exceeded',
          message: 'Repository analysis is resource-intensive. Please wait 10 minutes between analyses.',
          retryAfter: 10 * 60,
          hint: 'Consider upgrading to a premium API key for higher limits'
        });
      }
    });
  }

  authenticated() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, 
      max: 300, 
      keyGenerator: (req) => {
        return req.user?.id || req.ip;
      },
      skip: (req) => {
        return req.user?.plan === 'premium';
      },
      message: {
        error: 'Rate limit exceeded',
        message: 'Authenticated user rate limit exceeded.',
        retryAfter: 15 * 60
      }
    });
  }

  slidingWindow(maxRequests = 60, windowMs = 60 * 1000) {
    return (req, res, next) => {
      const key = req.user?.id || req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!requestStore.has(key)) {
        requestStore.set(key, []);
      }

      const requests = requestStore.get(key);
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      requestStore.set(key, recentRequests);

      if (recentRequests.length >= maxRequests) {
        const oldestRequest = Math.min(...recentRequests);
        const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);

        logger.warn(`Sliding window rate limit exceeded for: ${key}`);
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000} seconds`,
          retryAfter: Math.max(retryAfter, 1),
          currentRequests: recentRequests.length,
          maxRequests
        });
      }

      recentRequests.push(now);
      
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - recentRequests.length),
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      });

      next();
    };
  }

  progressive() {
    return (req, res, next) => {
      const key = req.user?.id || req.ip;
      const now = Date.now();
      const windows = [
        { duration: 1 * 60 * 1000, limit: 20 }, 
        { duration: 5 * 60 * 1000, limit: 50 },   
        { duration: 15 * 60 * 1000, limit: 100 }   
      ];

      if (!requestStore.has(key)) {
        requestStore.set(key, []);
      }

      const requests = requestStore.get(key);

      for (const window of windows) {
        const windowStart = now - window.duration;
        const recentRequests = requests.filter(timestamp => timestamp > windowStart);

        if (recentRequests.length >= window.limit) {
          const retryAfter = Math.ceil(window.duration / 1000);
          
          logger.warn(`Progressive rate limit exceeded for: ${key} (${window.limit}/${window.duration/1000}s)`);
          
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Progressive rate limit exceeded: ${window.limit} requests per ${window.duration / 1000} seconds`,
            retryAfter,
            window: `${window.duration / 1000}s`,
            currentRequests: recentRequests.length
          });
        }
      }

      const maxWindow = Math.max(...windows.map(w => w.duration));
      const cleanupThreshold = now - maxWindow;
      const cleanRequests = requests.filter(timestamp => timestamp > cleanupThreshold);
      cleanRequests.push(now);
      requestStore.set(key, cleanRequests);

      next();
    };
  }

  githubApi() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, 
      max: 4500, 
      keyGenerator: (req) => 'github-api',
      message: {
        error: 'GitHub API rate limit approached',
        message: 'Approaching GitHub API rate limits. Please try again later.',
        retryAfter: 60 * 60
      },
      handler: (req, res) => {
        logger.error('GitHub API rate limit approached');
        res.status(429).json({
          error: 'GitHub API rate limit approached',
          message: 'The service is approaching GitHub API rate limits. Please try again in an hour.',
          retryAfter: 60 * 60,
          hint: 'This limit protects the service for all users'
        });
      }
    });
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      for (const [key, requests] of requestStore.entries()) {
        const recentRequests = requests.filter(timestamp => now - timestamp < maxAge);
        
        if (recentRequests.length === 0) {
          requestStore.delete(key);
        } else {
          requestStore.set(key, recentRequests);
        }
      }
      
      logger.info(`Rate limiter cleanup completed. Active keys: ${requestStore.size}`);
    }, 60 * 60 * 1000);
  }
}

// This should start the cleanup process
const rateLimiter = new RateLimiterMiddleware();
rateLimiter.startCleanup();

module.exports = rateLimiter;