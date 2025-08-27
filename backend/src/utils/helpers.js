const { validationResult } = require('express-validator');
const crypto = require('crypto');
const path = require('path');
const logger = require('./logger');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array().reduce((acc, error) => {
        acc[error.param] = error.msg;
        return acc;
      }, {})
    });
  }
  next();
};

const validateRepoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
  return githubUrlPattern.test(url);
};

const parseGitHubUrl = (url) => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', '')
  };
};

const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip: Math.max(0, skip),
    limit: Math.min(Math.max(1, parseInt(limit)), 100) 
  };
};

const generatePaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateApiKey = (prefix = 'cqd') => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${timestamp}_${randomPart}`;
};

const hashString = (str, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(str).digest('hex');
};

const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    logger.warn('Failed to parse JSON:', error.message);
    return defaultValue;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (milliseconds) => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const retryWithBackoff = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let attempt = 1;
  
  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
};

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};

const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().slice(1);
};

const isCodeFile = (filename) => {
  const codeExtensions = [
    'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cs', 'cpp', 'c', 'h',
    'php', 'rb', 'go', 'rs', 'kt', 'swift', 'scala', 'r', 'm',
    'html', 'css', 'scss', 'sass', 'less', 'vue', 'svelte'
  ];
  
  const ext = getFileExtension(filename);
  return codeExtensions.includes(ext);
};


const getQualityColor = (score) => {
  if (score >= 90) return '#4c1'; 
  if (score >= 80) return '#97ca00'; 
  if (score >= 70) return '#a4a61d'; 
  if (score >= 60) return '#dfb317'; 
  if (score >= 50) return '#fe7d37'; 
  return '#e05d44'; 
};

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const calculatePercentage = (part, total, decimals = 1) => {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(decimals));
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const createResponse = (success = true, data = null, message = null, error = null) => {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  if (error !== null) response.error = error;
  if (!success && !error) response.error = 'An error occurred';
  
  response.timestamp = new Date().toISOString();
  
  return response;
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const generateRateLimitKey = (req, identifier = 'ip') => {
  switch (identifier) {
    case 'user':
      return req.user?.id || req.ip;
    case 'api-key':
      return req.headers['x-api-key'] || req.ip;
    case 'ip':
    default:
      return req.ip;
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const truncateString = (str, maxLength = 100, suffix = '...') => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

const stripHtmlTags = (str) => {
  return str.replace(/<[^>]*>/g, '');
};

const capitalizeWords = (str) => {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

const formatDateWithTimezone = (date = new Date(), timezone = 'UTC') => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date).replace(', ', 'T') + 'Z';
};

const cleanUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    return null;
  }
};


const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .filter(key => obj[key] !== null && obj[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};


const queryStringToObject = (queryString) => {
  if (!queryString) return {};
  
  return queryString
    .substring(1) 
    .split('&')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      if (key) {
        acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
      return acc;
    }, {});
};

const maskSensitiveData = (obj, sensitiveKeys = ['password', 'token', 'secret', 'key']) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const masked = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitiveKey => 
        lowerKey.includes(sensitiveKey.toLowerCase())
      );
      
      if (isSensitive && typeof obj[key] === 'string') {
        masked[key] = '*'.repeat(Math.min(obj[key].length, 8));
      } else if (typeof obj[key] === 'object') {
        masked[key] = maskSensitiveData(obj[key], sensitiveKeys);
      } else {
        masked[key] = obj[key];
      }
    }
  }
  
  return masked;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const createRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();
  
  return (key) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    requests.set(key, recentRequests);
    
    if (recentRequests.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil((Math.min(...recentRequests) + windowMs) / 1000)
      };
    }
    
    recentRequests.push(now);
    
    return {
      allowed: true,
      remaining: maxRequests - recentRequests.length,
      resetTime: Math.ceil((now + windowMs) / 1000)
    };
  };
};

const formatMemoryUsage = () => {
  const usage = process.memoryUsage();
  const formatMB = (bytes) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;
  
  return {
    rss: formatMB(usage.rss),
    heapTotal: formatMB(usage.heapTotal),
    heapUsed: formatMB(usage.heapUsed),
    external: formatMB(usage.external)
  };
};

const getEnvironment = () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  };
};

module.exports = {
  validateRequest,
  validateRepoUrl,
  parseGitHubUrl,
  paginate,
  generatePaginationMeta,
  sanitizeFilename,
  generateRandomString,
  generateApiKey,
  hashString,
  safeJsonParse,
  formatFileSize,
  formatDuration,
  debounce,
  throttle,
  retryWithBackoff,
  deepClone,
  isEmpty,
  deepMerge,
  getFileExtension,
  isCodeFile,
  getQualityColor,
  formatNumber,
  calculatePercentage,
  sleep,
  createResponse,
  asyncHandler,
  generateRateLimitKey,
  validateEmail,
  generateSlug,
  truncateString,
  camelToSnake,
  snakeToCamel,
  stripHtmlTags,
  capitalizeWords,
  generateRandomColor,
  isValidJson,
  daysBetween,
  formatDateWithTimezone,
  cleanUrl,
  extractDomain,
  objectToQueryString,
  queryStringToObject,
  maskSensitiveData,
  generateUUID,
  createRateLimiter,
  formatMemoryUsage,
  getEnvironment
};