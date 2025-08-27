const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const auth = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const app = express();
// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Rate limiting
app.use(rateLimiter.basic());
// API routes with different protection levels
app.use('/api/public', apiRoutes);
app.use('/api/analysis', rateLimiter.analysis(), auth.optionalAuth, analysisRoutes);
app.use('/api/admin', auth.verifyToken, auth.requireRole(['admin']), adminRoutes);
// 404 handler
app.use(errorHandler.notFound);
// Global error handler
app.use(errorHandler.handle);