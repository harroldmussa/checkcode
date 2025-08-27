const logger = require('./logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.memoryCache = new Map();
    this.memoryTtl = new Map();
    
    this.init();
    this.startMemoryCleanup();
  }

  async init() {
    try {
      if (process.env.REDIS_URL) {
        const redis = require('redis');
        
        this.client = redis.createClient({
          url: process.env.REDIS_URL,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              logger.warn('Redis server is not available, falling back to memory cache');
              return undefined; 
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              return new Error('Retry time exhausted');
            }
            if (options.attempt > 3) {
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        this.client.on('connect', () => {
          logger.info('Connected to Redis cache server');
          this.isConnected = true;
        });

        this.client.on('error', (err) => {
          logger.warn('Redis cache error, falling back to memory cache:', err.message);
          this.isConnected = false;
        });

        this.client.on('end', () => {
          logger.warn('Redis connection closed, using memory cache');
          this.isConnected = false;
        });

        await this.client.connect();
      } else {
        logger.info('No Redis URL provided, using memory cache');
      }
    } catch (error) {
      logger.warn('Failed to connect to Redis, using memory cache:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        if (this.memoryCache.has(key)) {
          const ttl = this.memoryTtl.get(key);
          if (!ttl || ttl > Date.now()) {
            return this.memoryCache.get(key);
          } else {
            this.memoryCache.delete(key);
            this.memoryTtl.delete(key);
            return null;
          }
        }
        return null;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      } else {
        this.memoryCache.set(key, value);
        if (ttlSeconds > 0) {
          this.memoryTtl.set(key, Date.now() + (ttlSeconds * 1000));
        }
        if (this.memoryCache.size > 1000) {
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
          this.memoryTtl.delete(firstKey);
        }
      }
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      } else {
        this.memoryCache.delete(key);
        this.memoryTtl.delete(key);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (this.isConnected && this.client) {
        return (await this.client.exists(key)) === 1;
      } else {
        if (this.memoryCache.has(key)) {
          const ttl = this.memoryTtl.get(key);
          if (!ttl || ttl > Date.now()) {
            return true;
          } else {
            this.memoryCache.delete(key);
            this.memoryTtl.delete(key);
            return false;
          }
        }
        return false;
      }
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async flush() {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushAll();
      } else {
        this.memoryCache.clear();
        this.memoryTtl.clear();
      }
      logger.info('Cache flushed successfully');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  async keys(pattern = '*') {
    try {
      if (this.isConnected && this.client) {
        return await this.client.keys(pattern);
      } else {
        const allKeys = Array.from(this.memoryCache.keys());
        if (pattern === '*') {
          return allKeys;
        }
        const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return allKeys.filter(key => regex.test(key));
      }
    } catch (error) {
      logger.error('Cache keys error:', error);
      return [];
    }
  }

  async ttl(key) {
    try {
      if (this.isConnected && this.client) {
        return await this.client.ttl(key);
      } else {
        const ttl = this.memoryTtl.get(key);
        if (!ttl) return -1; 
        const remaining = Math.ceil((ttl - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2; 
      }
    } catch (error) {
      logger.error('Cache TTL error:', error);
      return -1;
    }
  }

  async wrap(key, fn, ttlSeconds = 3600) {
    try {
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = await fn();
      await this.set(key, result, ttlSeconds);
      return result;
    } catch (error) {
      logger.error('Cache wrap error:', error);
      return await fn();
    }
  }

  async getStats() {
    try {
      const stats = {
        type: this.isConnected ? 'redis' : 'memory',
        connected: this.isConnected
      };

      if (this.isConnected && this.client) {
        try {
          const info = await this.client.info('memory');
          stats.redis = {
            memoryUsed: this.parseRedisInfo(info, 'used_memory_human'),
            keyCount: await this.client.dbSize()
          };
        } catch (error) {
          logger.warn('Failed to get Redis stats:', error.message);
          stats.redis = { error: 'Unable to fetch Redis stats' };
        }
      } else {
        stats.memory = {
          keyCount: this.memoryCache.size,
          estimatedSize: this.estimateMemoryUsage()
        };
      }

      return stats;
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { error: error.message };
    }
  }

  startMemoryCleanup() {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys = [];

      for (const [key, ttl] of this.memoryTtl.entries()) {
        if (ttl && ttl <= now) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => {
        this.memoryCache.delete(key);
        this.memoryTtl.delete(key);
      });

      if (expiredKeys.length > 0) {
        logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
      }
    }, 60000); 
  }

  parseRedisInfo(info, key) {
    const match = info.match(new RegExp(`${key}:(.+)`));
    return match ? match[1] : 'Unknown';
  }

  estimateMemoryUsage() {
    let size = 0;
    for (const value of this.memoryCache.values()) {
      try {
        size += JSON.stringify(value).length;
      } catch (error) {
        size += 100; 
      }
    }
    return `${Math.round(size / 1024)}KB`;
  }

  async close() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        logger.info('Cache connection closed');
      } catch (error) {
        logger.warn('Error closing cache connection:', error.message);
      }
    }
  }
}

const cache = new CacheService();

process.on('SIGTERM', async () => {
  await cache.close();
});

process.on('SIGINT', async () => {
  await cache.close();
});

module.exports = cache;