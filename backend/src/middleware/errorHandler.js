const logger = require('../utils/logger');

class ErrorHandler {
  handle(error, req, res, next) {
    logger.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    const isDevelopment = process.env.NODE_ENV === 'development';

    if (error.name === 'ValidationError') {
      return this.handleValidationError(error, res);
    }

    if (error.name === 'CastError') {
      return this.handleCastError(error, res);
    }

    if (error.code === 11000) {
      return this.handleDuplicateError(error, res);
    }

    if (error.name === 'JsonWebTokenError') {
      return this.handleJWTError(error, res);
    }

    if (error.name === 'TokenExpiredError') {
      return this.handleTokenExpiredError(error, res);
    }

    if (error.response && error.response.status) {
      return this.handleHTTPError(error, res);
    }

    if (error.message && error.message.includes('GitHub')) {
      return this.handleGitHubError(error, res);
    }

    if (error.status === 429) {
      return this.handleRateLimitError(error, res);
    }

    res.status(error.status || 500).json({
      success: false,
      error: 'Internal Server Error',
      message: isDevelopment ? error.message : 'Something went wrong. Please try again later.',
      ...(isDevelopment && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  handleValidationError(error, res) {
    const errors = {};
    
    if (error.details) {
      error.details.forEach(detail => {
        errors[detail.path.join('.')] = detail.message;
      });
    } else if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
    }

    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  handleCastError(error, res) {
    res.status(400).json({
      success: false,
      error: 'Invalid Data Format',
      message: `Invalid ${error.path}: ${error.value}`,
      timestamp: new Date().toISOString()
    });
  }

  handleDuplicateError(error, res) {
    const duplicateField = Object.keys(error.keyValue)[0];
    const duplicateValue = error.keyValue[duplicateField];

    res.status(409).json({
      success: false,
      error: 'Duplicate Entry',
      message: `${duplicateField} '${duplicateValue}' already exists`,
      field: duplicateField,
      timestamp: new Date().toISOString()
    });
  }

  handleJWTError(error, res) {
    res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Please log in again',
      timestamp: new Date().toISOString()
    });
  }

  handleTokenExpiredError(error, res) {
    res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Your session has expired. Please log in again',
      timestamp: new Date().toISOString()
    });
  }

  handleHTTPError(error, res) {
    const status = error.response.status;
    let message = 'External service error';

    switch (status) {
      case 400:
        message = 'Bad request to external service';
        break;
      case 401:
        message = 'Authentication failed with external service';
        break;
      case 403:
        message = 'Access forbidden by external service';
        break;
      case 404:
        message = 'Resource not found';
        break;
      case 429:
        message = 'Rate limit exceeded on external service';
        break;
      case 500:
      case 502:
      case 503:
        message = 'External service unavailable';
        break;
    }

    res.status(status >= 500 ? 502 : status).json({
      success: false,
      error: 'External Service Error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  handleGitHubError(error, res) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Repository Not Found',
        message: 'The specified repository does not exist or is not accessible',
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'GitHub Rate Limit Exceeded',
        message: 'GitHub API rate limit exceeded. Please try again later.',
        retryAfter: 3600, // 1 hour
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('private')) {
      return res.status(403).json({
        success: false,
        error: 'Repository Access Denied',
        message: 'Cannot access private repository. Please check permissions.',
        timestamp: new Date().toISOString()
      });
    }

    res.status(502).json({
      success: false,
      error: 'GitHub API Error',
      message: 'Failed to communicate with GitHub API',
      timestamp: new Date().toISOString()
    });
  }

  handleRateLimitError(error, res) {
    res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please slow down.',
      retryAfter: error.retryAfter || 60,
      timestamp: new Date().toISOString()
    });
  }

  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  notFound(req, res, next) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;
    next(error);
  }

  handleUnhandledRejection(reason, promise) {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason,
      promise: promise,
      timestamp: new Date().toISOString()
    });

    if (process.env.NODE_ENV === 'production') {
      console.log('Shutting down due to unhandled promise rejection');
      process.exit(1);
    }
  }

  handleUncaughtException(error) {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    console.log('Shutting down due to uncaught exception');
    process.exit(1);
  }

  setupGlobalHandlers() {
    process.on('unhandledRejection', this.handleUnhandledRejection);
    process.on('uncaughtException', this.handleUncaughtException);
  }
}

const errorHandler = new ErrorHandler();
errorHandler.setupGlobalHandlers();
module.exports = errorHandler;