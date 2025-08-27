const request = require('supertest');
const app = require('../../src/app');
const Repository = require('../../src/models/Repository');
const Analysis = require('../../src/models/Analysis');

describe('Analysis Controller', () => {
  describe('POST /api/analysis', () => {
    it('should analyze a valid repository', async () => {
      const repoUrl = 'https://github.com/test/repo';
      
      const response = await request(app)
        .post('/api/analysis')
        .send({ repoUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis).toBeDefined();
      expect(response.body.data.analysis.qualityScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.analysis.qualityScore).toBeLessThanOrEqual(100);
    });

    it('should reject invalid repository URL', async () => {
      const response = await request(app)
        .post('/api/analysis')
        .send({ repoUrl: 'invalid-url' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid repository URL');
    });

    it('should handle non-existent repository', async () => {
      const repoUrl = 'https://github.com/nonexistent/repo';
      
      const response = await request(app)
        .post('/api/analysis')
        .send({ repoUrl })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Repository not found or not accessible');
    });
  });

  describe('GET /api/analysis/history/:repoId', () => {
    it('should return analysis history for repository', async () => {
      const repo = new Repository({
        name: 'test-repo',
        owner: 'test-owner',
        fullName: 'test-owner/test-repo',
        githubId: 12345,
        url: 'https://github.com/test-owner/test-repo',
        cloneUrl: 'https://github.com/test-owner/test-repo.git',
        githubCreatedAt: new Date(),
        githubUpdatedAt: new Date()
      });
      await repo.save();

      const analysis = new Analysis({
        repository: repo._id,
        qualityScore: 85,
        codeMetrics: { linesOfCode: 1000, testCoverage: 80, maintainabilityIndex: 75 },
        security: { totalDependencies: 10, vulnerabilities: [], securityScore: 90 },
        complexity: { averageComplexity: 5, complexityGrade: 'B' },
        status: 'completed'
      });
      await analysis.save();

      const response = await request(app)
        .get(`/api/analysis/history/${repo._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle invalid repository ID', async () => {
      const response = await request(app)
        .get('/api/analysis/history/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
