const winston = require('winston');
const path = require('path');
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: {
    service: 'code-quality-dashboard',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, 
      maxFiles: 5
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, 
      maxFiles: 5
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'analysis.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, repositoryId, analysisId, duration, ...meta }) => {
          if (message.includes('analysis') || repositoryId || analysisId) {
            return JSON.stringify({
              timestamp,
              level,
              message,
              repositoryId,
              analysisId,
              duration,
              ...meta
            });
          }
          return null;
        })
      ).transform((info) => info.message ? info : false),
      maxsize: 5242880,
      maxFiles: 3
    })
  ],
  
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

if (process.env.NODE_ENV === 'production') {
  // TO-DO: add external logging services here
  logger.add(new winston.transports.Console({
    level: 'warn',
    format: consoleFormat
  }));
}

logger.stream = {
  write: function(message) {
    logger.info(message.trim(), { component: 'http' });
  }
};

logger.logAnalysis = (message, data = {}) => {
  logger.info(message, {
    component: 'analysis',
    repositoryId: data.repositoryId,
    analysisId: data.analysisId,
    duration: data.duration,
    ...data
  });
};

logger.logSecurity = (message, data = {}) => {
  logger.warn(message, {
    component: 'security',
    ip: data.ip,
    userAgent: data.userAgent,
    endpoint: data.endpoint,
    ...data
  });
};

logger.logPerformance = (message, data = {}) => {
  logger.info(message, {
    component: 'performance',
    duration: data.duration,
    endpoint: data.endpoint,
    method: data.method,
    statusCode: data.statusCode,
    ...data
  });
};

logger.logGitHub = (message, data = {}) => {
  logger.info(message, {
    component: 'github-api',
    repository: data.repository,
    rateLimitRemaining: data.rateLimitRemaining,
    resetTime: data.resetTime,
    ...data
  });
};

module.exports = logger;