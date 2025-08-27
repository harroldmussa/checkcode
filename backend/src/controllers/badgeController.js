const Repository = require('../models/Repository');
const githubService = require('../services/githubService');
const analysisService = require('../services/analysisService');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

class BadgeController {
  async generateBadge(req, res) {
    try {
      const { owner, repo } = req.params;
      const { style = 'flat', format = 'svg' } = req.query;
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600'); 
      const cacheKey = `badge:${owner}:${repo}:${style}`;
      const cachedBadge = await cache.get(cacheKey);
      
      if (cachedBadge) {
        return res.send(cachedBadge);
      }

      let repository = await Repository.findOne({
        owner: owner.toLowerCase(),
        name: repo.toLowerCase()
      }).populate('latestAnalysis');

      let qualityScore = null;

      if (repository && repository.latestAnalysis) {
        qualityScore = repository.latestAnalysis.qualityScore;
      } else {
        try {
          const analysis = await analysisService.performFullAnalysis(owner, repo);
          qualityScore = analysis.qualityScore;
        } catch (error) {
          logger.warn(`Failed to analyze ${owner}/${repo} for badge:`, error.message);
          qualityScore = null;
        }
      }

      const badge = this.generateSVGBadge(qualityScore, style);
      
      await cache.set(cacheKey, badge, 3600);

      res.send(badge);

    } catch (error) {
      logger.error('Failed to generate badge:', error);
      const errorBadge = this.generateErrorBadge();
      res.send(errorBadge);
    }
  }

  async getBadgeVariants(req, res) {
    try {
      const { owner, repo } = req.params;
      
      const repository = await Repository.findOne({
        owner: owner.toLowerCase(),
        name: repo.toLowerCase()
      }).populate('latestAnalysis');

      if (!repository || !repository.latestAnalysis) {
        return res.status(404).json({
          error: 'Repository not found',
          message: 'Repository not found or not analyzed yet'
        });
      }

      const analysis = repository.latestAnalysis;
      const badges = {
        quality: {
          url: `/api/analysis/badge/${owner}/${repo}?style=flat`,
          markdown: `![Code Quality](${req.protocol}://${req.get('host')}/api/analysis/badge/${owner}/${repo})`
        },
        security: {
          url: `/api/analysis/badge/${owner}/${repo}/security?style=flat`,
          markdown: `![Security Score](${req.protocol}://${req.get('host')}/api/analysis/badge/${owner}/${repo}/security)`
        },
        coverage: {
          url: `/api/analysis/badge/${owner}/${repo}/coverage?style=flat`,
          markdown: `![Test Coverage](${req.protocol}://${req.get('host')}/api/analysis/badge/${owner}/${repo}/coverage)`
        },
        complexity: {
          url: `/api/analysis/badge/${owner}/${repo}/complexity?style=flat`,
          markdown: `![Code Complexity](${req.protocol}://${req.get('host')}/api/analysis/badge/${owner}/${repo}/complexity)`
        }
      };

      res.json({
        success: true,
        data: {
          repository: `${owner}/${repo}`,
          badges,
          scores: {
            quality: analysis.qualityScore,
            security: analysis.security?.securityScore || 'N/A',
            coverage: analysis.codeMetrics?.testCoverage || 'N/A',
            complexity: analysis.complexity?.complexityGrade || 'N/A'
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get badge variants:', error);
      res.status(500).json({
        error: 'Failed to generate badge variants',
        message: error.message
      });
    }
  }

  async generateSecurityBadge(req, res) {
    try {
      const { owner, repo } = req.params;
      const { style = 'flat' } = req.query;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      const repository = await Repository.findOne({
        owner: owner.toLowerCase(),
        name: repo.toLowerCase()
      }).populate('latestAnalysis');

      const securityScore = repository?.latestAnalysis?.security?.securityScore || null;
      const badge = this.generateSecuritySVGBadge(securityScore, style);

      res.send(badge);

    } catch (error) {
      logger.error('Failed to generate security badge:', error);
      res.send(this.generateErrorBadge('security'));
    }
  }

  async generateCoverageBadge(req, res) {
    try {
      const { owner, repo } = req.params;
      const { style = 'flat' } = req.query;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      const repository = await Repository.findOne({
        owner: owner.toLowerCase(),
        name: repo.toLowerCase()
      }).populate('latestAnalysis');

      const coverage = repository?.latestAnalysis?.codeMetrics?.testCoverage || null;
      const badge = this.generateCoverageSVGBadge(coverage, style);

      res.send(badge);

    } catch (error) {
      logger.error('Failed to generate coverage badge:', error);
      res.send(this.generateErrorBadge('coverage'));
    }
  }

  async generateComplexityBadge(req, res) {
    try {
      const { owner, repo } = req.params;
      const { style = 'flat' } = req.query;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      const repository = await Repository.findOne({
        owner: owner.toLowerCase(),
        name: repo.toLowerCase()
      }).populate('latestAnalysis');

      const complexity = repository?.latestAnalysis?.complexity?.complexityGrade || null;
      const badge = this.generateComplexitySVGBadge(complexity, style);

      res.send(badge);

    } catch (error) {
      logger.error('Failed to generate complexity badge:', error);
      res.send(this.generateErrorBadge('complexity'));
    }
  }

  generateSVGBadge(score, style = 'flat') {
    if (score === null || score === undefined) {
      return this.generateErrorBadge();
    }

    const color = this.getScoreColor(score);
    const label = 'code quality';
    const message = `${score}/100`;

    return this.createSVGBadge(label, message, color, style);
  }

  generateSecuritySVGBadge(score, style = 'flat') {
    if (score === null || score === undefined) {
      return this.generateErrorBadge('security');
    }

    const color = this.getScoreColor(score);
    const label = 'security';
    const message = `${score}/100`;

    return this.createSVGBadge(label, message, color, style);
  }

  generateCoverageSVGBadge(coverage, style = 'flat') {
    if (coverage === null || coverage === undefined) {
      return this.generateErrorBadge('coverage');
    }

    const color = this.getCoverageColor(coverage);
    const label = 'coverage';
    const message = `${coverage}%`;

    return this.createSVGBadge(label, message, color, style);
  }

  generateComplexitySVGBadge(complexity, style = 'flat') {
    if (!complexity) {
      return this.generateErrorBadge('complexity');
    }

    const color = this.getComplexityColor(complexity);
    const label = 'complexity';
    const message = complexity;

    return this.createSVGBadge(label, message, color, style);
  }

  createSVGBadge(label, message, color, style) {
    const labelWidth = Math.max(label.length * 6 + 10, 50);
    const messageWidth = Math.max(message.length * 6 + 10, 30);
    const totalWidth = labelWidth + messageWidth;

    const radius = style === 'flat' ? '0' : '3';
    
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
        <linearGradient id="b" x2="0" y2="100%">
          <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
          <stop offset="1" stop-opacity=".1"/>
        </linearGradient>
        <clipPath id="a">
          <rect width="${totalWidth}" height="20" rx="${radius}" fill="#fff"/>
        </clipPath>
        <g clip-path="url(#a)">
          <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
          <path fill="${color}" d="M${labelWidth} 0h${messageWidth}v20H${labelWidth}z"/>
          <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
        </g>
        <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
          <text x="${labelWidth/2 * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth-10)*10}">${label}</text>
          <text x="${labelWidth/2 * 10}" y="140" transform="scale(.1)" textLength="${(labelWidth-10)*10}">${label}</text>
          <text x="${(labelWidth + messageWidth/2) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(messageWidth-10)*10}">${message}</text>
          <text x="${(labelWidth + messageWidth/2) * 10}" y="140" transform="scale(.1)" textLength="${(messageWidth-10)*10}">${message}</text>
        </g>
      </svg>
    `.trim();
  }

  generateErrorBadge(type = 'quality') {
    const color = '#e05d44'; 
    const label = type;
    const message = 'unknown';

    return this.createSVGBadge(label, message, color, 'flat');
  }

  getScoreColor(score) {
    if (score >= 90) return '#4c1'; 
    if (score >= 80) return '#97ca00'; 
    if (score >= 70) return '#a4a61d'; 
    if (score >= 60) return '#dfb317'; 
    if (score >= 50) return '#fe7d37'; 
    return '#e05d44'; 
  }

  getCoverageColor(coverage) {
    if (coverage >= 90) return '#4c1';
    if (coverage >= 80) return '#97ca00';
    if (coverage >= 70) return '#a4a61d';
    if (coverage >= 60) return '#dfb317';
    if (coverage >= 50) return '#fe7d37';
    return '#e05d44';
  }

  getComplexityColor(grade) {
    switch (grade.toUpperCase()) {
      case 'A': return '#4c1';
      case 'B': return '#97ca00';
      case 'C': return '#dfb317';
      case 'D': return '#fe7d37';
      case 'F': return '#e05d44';
      default: return '#9f9f9f';
    }
  }
}

module.exports = new BadgeController();