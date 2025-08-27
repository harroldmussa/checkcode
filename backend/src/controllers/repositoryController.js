const Repository = require('../models/Repository');
const Analysis = require('../models/Analysis');
const githubService = require('../services/githubService');
const analysisService = require('../services/analysisService');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { validateRepoUrl, paginate } = require('../utils/helpers');

class RepositoryController {
  async getAllRepositories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || 'updatedAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const search = req.query.search;
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { owner: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (req.query.language) {
        query.language = req.query.language;
      }

      if (req.query.minScore) {
        query.lastQualityScore = { $gte: parseInt(req.query.minScore) };
      }
      if (req.query.maxScore) {
        query.lastQualityScore = { 
          ...query.lastQualityScore, 
          $lte: parseInt(req.query.maxScore) 
        };
      }

      const repositories = await Repository.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('latestAnalysis');

      const total = await Repository.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          repositories,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get repositories:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve repositories',
        message: error.message 
      });
    }
  }

  async getRepository(req, res) {
    try {
      const { id } = req.params;
      
      const repository = await Repository.findById(id)
        .populate('latestAnalysis')
        .populate({
          path: 'analyses',
          options: { 
            sort: { createdAt: -1 },
            limit: 10 
          }
        });

      if (!repository) {
        return res.status(404).json({
          error: 'Repository not found',
          message: 'No repository found with the provided ID'
        });
      }

      res.json({
        success: true,
        data: repository
      });

    } catch (error) {
      logger.error('Failed to get repository:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve repository',
        message: error.message 
      });
    }
  }

  async getRepositoryByGitHub(req, res) {
    try {
      const { owner, name } = req.params;
      
      const repository = await Repository.findOne({ 
        owner: owner.toLowerCase(),
        name: name.toLowerCase()
      })
      .populate('latestAnalysis')
      .populate({
        path: 'analyses',
        options: { 
          sort: { createdAt: -1 },
          limit: 5 
        }
      });

      if (!repository) {
        return res.status(404).json({
          error: 'Repository not found',
          message: `Repository ${owner}/${name} not found in our database`
        });
      }

      res.json({
        success: true,
        data: repository
      });

    } catch (error) {
      logger.error('Failed to get repository by GitHub info:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve repository',
        message: error.message 
      });
    }
  }

  async addRepository(req, res) {
    try {
      const { repoUrl, autoAnalyze = true } = req.body;
      
      if (!validateRepoUrl(repoUrl)) {
        return res.status(400).json({
          error: 'Invalid repository URL',
          message: 'Please provide a valid GitHub repository URL'
        });
      }

      const { owner, repo } = githubService.parseRepoUrl(repoUrl);
      const existingRepo = await Repository.findOne({
        owner: owner.toLowerCase(),
        name: repo.toLowerCase()
      });

      if (existingRepo) {
        return res.status(409).json({
          error: 'Repository already exists',
          message: 'This repository is already being tracked',
          data: existingRepo
        });
      }

      const githubRepo = await githubService.getRepositoryInfo(owner, repo);
      
      if (!githubRepo) {
        return res.status(404).json({
          error: 'Repository not found',
          message: 'Repository not found on GitHub or not accessible'
        });
      }

      const repository = new Repository({
        name: githubRepo.name.toLowerCase(),
        owner: githubRepo.owner.toLowerCase(),
        fullName: githubRepo.fullName,
        description: githubRepo.description,
        language: githubRepo.language,
        githubId: githubRepo.id,
        url: githubRepo.url,
        cloneUrl: githubRepo.cloneUrl,
        stars: githubRepo.stars,
        forks: githubRepo.forks,
        openIssues: githubRepo.openIssues,
        size: githubRepo.size,
        isPrivate: githubRepo.isPrivate,
        defaultBranch: githubRepo.defaultBranch,
        githubCreatedAt: githubRepo.createdAt,
        githubUpdatedAt: githubRepo.updatedAt,
        addedBy: req.user?.id
      });

      await repository.save();

      let analysis = null;
      if (autoAnalyze) {
        try {
          analysis = await analysisService.performFullAnalysis(owner, repo);
          
          const analysisRecord = new Analysis({
            repository: repository._id,
            qualityScore: analysis.qualityScore,
            codeMetrics: analysis.codeMetrics,
            security: analysis.security,
            complexity: analysis.complexity,
            issues: analysis.issues || [],
            recommendations: analysis.recommendations || []
          });

          await analysisRecord.save();

          repository.latestAnalysis = analysisRecord._id;
          repository.lastQualityScore = analysis.qualityScore;
          repository.lastAnalyzedAt = new Date();
          await repository.save();

        } catch (analysisError) {
          logger.warn('Initial analysis failed:', analysisError.message);
        }
      }

      logger.info(`Repository ${owner}/${repo} added by user ${req.user?.id || 'anonymous'}`);

      res.status(201).json({
        success: true,
        data: {
          repository,
          analysis: analysis ? { qualityScore: analysis.qualityScore } : null
        },
        message: 'Repository added successfully'
      });

    } catch (error) {
      logger.error('Failed to add repository:', error);
      res.status(500).json({ 
        error: 'Failed to add repository',
        message: error.message 
      });
    }
  }

  async updateRepository(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      delete updates._id;
      delete updates.githubId;
      delete updates.analyses;
      delete updates.latestAnalysis;

      const repository = await Repository.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('latestAnalysis');

      if (!repository) {
        return res.status(404).json({
          error: 'Repository not found',
          message: 'No repository found with the provided ID'
        });
      }

      logger.info(`Repository ${repository.fullName} updated`);

      res.json({
        success: true,
        data: repository,
        message: 'Repository updated successfully'
      });

    } catch (error) {
      logger.error('Failed to update repository:', error);
      res.status(500).json({ 
        error: 'Failed to update repository',
        message: error.message 
      });
    }
  }

  async deleteRepository(req, res) {
    try {
      const { id } = req.params;
      
      const repository = await Repository.findById(id);
      
      if (!repository) {
        return res.status(404).json({
          error: 'Repository not found',
          message: 'No repository found with the provided ID'
        });
      }

      await Analysis.deleteMany({ repository: id });
      await Repository.findByIdAndDelete(id);
      await cache.delete(`analysis:${repository.owner}:${repository.name}`);

      logger.info(`Repository ${repository.fullName} deleted`);

      res.json({
        success: true,
        message: 'Repository and all associated data deleted successfully'
      });

    } catch (error) {
      logger.error('Failed to delete repository:', error);
      res.status(500).json({ 
        error: 'Failed to delete repository',
        message: error.message 
      });
    }
  }

  async getRepositoryStats(req, res) {
    try {
      const cacheKey = 'repository-stats';
      const cachedStats = await cache.get(cacheKey);
      
      if (cachedStats) {
        return res.json({
          success: true,
          data: cachedStats
        });
      }

      const [
        totalRepos,
        languageStats,
        qualityDistribution,
        recentActivity
      ] = await Promise.all([
        Repository.countDocuments(),
        
        Repository.aggregate([
          { $group: { _id: '$language', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        Repository.aggregate([
          {
            $bucket: {
              groupBy: '$lastQualityScore',
              boundaries: [0, 20, 40, 60, 80, 100],
              default: 'Unknown',
              output: { count: { $sum: 1 } }
            }
          }
        ]),
        
        Repository.find()
          .sort({ lastAnalyzedAt: -1 })
          .limit(5)
          .select('name owner lastQualityScore lastAnalyzedAt')
      ]);

      const stats = {
        totalRepositories: totalRepos,
        languageDistribution: languageStats,
        qualityScoreDistribution: qualityDistribution,
        recentlyAnalyzed: recentActivity,
        averageQualityScore: await this.calculateAverageQualityScore()
      };

      await cache.set(cacheKey, stats, 1800);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Failed to get repository statistics:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve statistics',
        message: error.message 
      });
    }
  }

  async syncWithGitHub(req, res) {
    try {
      const { id } = req.params;
      
      const repository = await Repository.findById(id);
      
      if (!repository) {
        return res.status(404).json({
          error: 'Repository not found',
          message: 'No repository found with the provided ID'
        });
      }


      const githubRepo = await githubService.getRepositoryInfo(
        repository.owner, 
        repository.name
      );

      if (!githubRepo) {
        return res.status(404).json({
          error: 'Repository not found on GitHub',
          message: 'Repository may have been deleted or made private'
        });
      }

      const updatedRepo = await Repository.findByIdAndUpdate(id, {
        description: githubRepo.description,
        language: githubRepo.language,
        stars: githubRepo.stars,
        forks: githubRepo.forks,
        openIssues: githubRepo.openIssues,
        size: githubRepo.size,
        githubUpdatedAt: githubRepo.updatedAt,
        lastSyncedAt: new Date()
      }, { new: true });

      logger.info(`Repository ${repository.fullName} synced with GitHub`);

      res.json({
        success: true,
        data: updatedRepo,
        message: 'Repository synced with GitHub successfully'
      });

    } catch (error) {
      logger.error('Failed to sync repository:', error);
      res.status(500).json({ 
        error: 'Failed to sync repository',
        message: error.message 
      });
    }
  }

  async calculateAverageQualityScore() {
    try {
      const result = await Repository.aggregate([
        { $match: { lastQualityScore: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgScore: { $avg: '$lastQualityScore' } } }
      ]);

      return result[0] ? Math.round(result[0].avgScore) : 0;
    } catch (error) {
      logger.error('Failed to calculate average quality score:', error);
      return 0;
    }
  }
}

module.exports = new RepositoryController();