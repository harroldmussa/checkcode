const mongoose = require('mongoose');
const Repository = require('../src/models/Repository');
const Analysis = require('../src/models/Analysis');
require('dotenv').config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await Repository.deleteMany({});
    await Analysis.deleteMany({});
    console.log('Cleared existing data');
    const sampleRepos = [
      {
        name: 'react',
        owner: 'facebook',
        fullName: 'facebook/react',
        githubId: 10270250,
        url: 'https://github.com/facebook/react',
        cloneUrl: 'https://github.com/facebook/react.git',
        description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
        language: 'JavaScript',
        stars: 200000,
        forks: 40000,
        openIssues: 800,
        githubCreatedAt: new Date('2013-05-24'),
        githubUpdatedAt: new Date(),
        lastQualityScore: 92
      },
      {
        name: 'vue',
        owner: 'vuejs',
        fullName: 'vuejs/vue',
        githubId: 11730342,
        url: 'https://github.com/vuejs/vue',
        cloneUrl: 'https://github.com/vuejs/vue.git',
        description: 'Vue.js is a progressive framework for building user interfaces.',
        language: 'TypeScript',
        stars: 180000,
        forks: 30000,
        openIssues: 600,
        githubCreatedAt: new Date('2013-07-29'),
        githubUpdatedAt: new Date(),
        lastQualityScore: 88
      },
      {
        name: 'express',
        owner: 'expressjs',
        fullName: 'expressjs/express',
        githubId: 237159,
        url: 'https://github.com/expressjs/express',
        cloneUrl: 'https://github.com/expressjs/express.git',
        description: 'Fast, unopinionated, minimalist web framework for Node.js',
        language: 'JavaScript',
        stars: 60000,
        forks: 10000,
        openIssues: 150,
        githubCreatedAt: new Date('2009-06-26'),
        githubUpdatedAt: new Date(),
        lastQualityScore: 85
      }
    ];

    const repositories = await Repository.insertMany(sampleRepos);
    console.log(`Inserted ${repositories.length} sample repositories`);
    const sampleAnalyses = repositories.map(repo => ({
      repository: repo._id,
      qualityScore: repo.lastQualityScore,
      codeMetrics: {
        linesOfCode: Math.floor(Math.random() * 100000) + 10000,
        fileCount: Math.floor(Math.random() * 1000) + 100,
        testCoverage: Math.floor(Math.random() * 40) + 60,
        maintainabilityIndex: Math.floor(Math.random() * 30) + 70
      },
      security: {
        totalDependencies: Math.floor(Math.random() * 50) + 20,
        vulnerabilities: [],
        outdatedDependencies: Math.floor(Math.random() * 10),
        securityScore: Math.floor(Math.random() * 20) + 80,
        hasLockFile: true
      },
      complexity: {
        averageComplexity: Math.random() * 10 + 2,
        maxComplexity: Math.random() * 20 + 10,
        totalComplexity: Math.random() * 1000 + 500,
        fileCount: Math.floor(Math.random() * 100) + 50,
        complexityGrade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      },
      issues: [],
      recommendations: [
        {
          priority: 'medium',
          category: 'testing',
          title: 'Increase test coverage',
          message: 'Consider adding more unit tests to improve coverage',
          action: 'Add tests for uncovered functions',
          effort: 'medium',
          impact: 'high'
        }
      ],
      status: 'completed'
    }));

    const analyses = await Analysis.insertMany(sampleAnalyses);
    console.log(`Inserted ${analyses.length} sample analyses`);

    for (let i = 0; i < repositories.length; i++) {
      repositories[i].latestAnalysis = analyses[i]._id;
      repositories[i].lastAnalyzedAt = new Date();
      await repositories[i].save();
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
