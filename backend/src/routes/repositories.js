const express = require('express');
const repositoryController = require('../controllers/repositoryController');
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/helpers');
const router = express.Router();
const validateRepositoryId = [
  param('id').isMongoId().withMessage('Invalid repository ID')
];

const validateGitHubParams = [
  param('owner').isLength({ min: 1, max: 39 }).withMessage('Invalid owner name'),
  param('name').isLength({ min: 1, max: 100 }).withMessage('Invalid repository name')
];

const validateAddRepository = [
  body('repoUrl')
    .isURL()
    .withMessage('Invalid repository URL')
    .custom((value) => {
      if (!value.includes('github.com')) {
        throw new Error('Only GitHub repositories are supported');
      }
      return true;
    }),
  body('autoAnalyze').optional().isBoolean().withMessage('autoAnalyze must be a boolean')
];

const validateUpdateRepository = [
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isLength({ min: 1, max: 50 }).withMessage('Invalid tag length'),
  body('autoAnalyze').optional().isBoolean().withMessage('autoAnalyze must be a boolean'),
  body('analysisFrequency').optional().isIn(['manual', 'daily', 'weekly', 'monthly']).withMessage('Invalid analysis frequency')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'owner', 'stars', 'lastQualityScore', 'lastAnalyzedAt', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

router.get('/', 
  validatePagination,
  validateRequest,
  repositoryController.getAllRepositories
);

router.get('/stats', 
  repositoryController.getRepositoryStats
);

router.get('/:owner/:name',
  validateGitHubParams,
  validateRequest,
  repositoryController.getRepositoryByGitHub
);

router.get('/:id',
  validateRepositoryId,
  validateRequest,
  repositoryController.getRepository
);

router.post('/',
  rateLimiter.authenticated(),
  auth.optionalAuth,
  validateAddRepository,
  validateRequest,
  repositoryController.addRepository
);

router.put('/:id',
  rateLimiter.authenticated(),
  auth.verifyToken,
  validateRepositoryId,
  validateUpdateRepository,
  validateRequest,
  repositoryController.updateRepository
);

router.delete('/:id',
  rateLimiter.authenticated(),
  auth.verifyToken,
  validateRepositoryId,
  validateRequest,
  repositoryController.deleteRepository
);

router.post('/:id/sync',
  rateLimiter.authenticated(),
  auth.optionalAuth,
  validateRepositoryId,
  validateRequest,
  repositoryController.syncWithGitHub
);

module.exports = router;