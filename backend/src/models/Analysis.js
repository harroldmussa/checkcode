const mongoose = require('mongoose');
const codeMetricsSchema = new mongoose.Schema({
  linesOfCode: {
    type: Number,
    required: true,
    min: 0
  },
  fileCount: {
    type: Number,
    default: 0,
    min: 0
  },
  testCoverage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  maintainabilityIndex: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  technicalDebt: {
    type: Number,
    default: 0,
    min: 0
  },
  duplicateLines: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const securitySchema = new mongoose.Schema({
  totalDependencies: {
    type: Number,
    default: 0,
    min: 0
  },
  vulnerabilities: [{
    package: String,
    version: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    title: String,
    description: String,
    cve: String,
    fixedIn: String
  }],
  outdatedDependencies: {
    type: Number,
    default: 0,
    min: 0
  },
  securityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  hasLockFile: {
    type: Boolean,
    default: false
  },
  licenseIssues: [{
    package: String,
    license: String,
    issue: String
  }]
}, { _id: false });

const complexitySchema = new mongoose.Schema({
  averageComplexity: {
    type: Number,
    default: 0,
    min: 0
  },
  maxComplexity: {
    type: Number,
    default: 0,
    min: 0
  },
  totalComplexity: {
    type: Number,
    default: 0,
    min: 0
  },
  fileCount: {
    type: Number,
    default: 0,
    min: 0
  },
  complexityGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    default: 'A'
  },
  highComplexityFiles: [{
    file: String,
    complexity: Number,
    functions: Number
  }]
}, { _id: false });

const issueSchema = new mongoose.Schema({
  file: String,
  line: Number,
  column: Number,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical']
  },
  category: {
    type: String,
    enum: ['security', 'performance', 'maintainability', 'reliability', 'style']
  },
  rule: String,
  message: String,
  ruleId: String
}, { _id: false });

const recommendationSchema = new mongoose.Schema({
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  category: {
    type: String,
    enum: ['security', 'performance', 'testing', 'code-quality', 'dependencies', 'documentation']
  },
  title: String,
  message: String,
  action: String,
  effort: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  impact: {
    type: String,
    enum: ['low', 'medium', 'high']
  }
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  qualityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  codeMetrics: {
    type: codeMetricsSchema,
    required: true
  },
  security: {
    type: securitySchema,
    required: true
  },
  complexity: {
    type: complexitySchema,
    required: true
  },
  issues: [issueSchema],
  recommendations: [recommendationSchema],
  analysisVersion: {
    type: String,
    default: '1.0.0'
  },
  analyzedBranch: {
    type: String,
    default: 'main'
  },
  analyzedCommit: {
    type: String,
    default: null
  },
  analysisType: {
    type: String,
    enum: ['full', 'quick', 'security-only', 'quality-only'],
    default: 'full'
  },
  analysisDuration: {
    type: Number, 
    default: 0
  },
  filesAnalyzed: {
    type: Number,
    default: 0,
    min: 0
  },
  languageBreakdown: {
    type: Map,
    of: {
      lines: Number,
      files: Number,
      percentage: Number
    },
    default: new Map()
  },
  trends: {
    qualityScoreDelta: {
      type: Number,
      default: 0
    },
    coverageDelta: {
      type: Number,
      default: 0
    },
    complexityDelta: {
      type: Number,
      default: 0
    },
    issuesDelta: {
      type: Number,
      default: 0
    }
  },
  config: {
    rules: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    },
    excludePatterns: [String],
    includePatterns: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'completed',
    index: true
  },
  
  errorMessage: {
    type: String,
    default: null
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'scheduled', 'webhook', 'api'],
    default: 'manual'
  },
  triggeredByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

analysisSchema.virtual('qualityGrade').get(function() {
  if (this.qualityScore >= 90) return 'A';
  if (this.qualityScore >= 80) return 'B';
  if (this.qualityScore >= 70) return 'C';
  if (this.qualityScore >= 60) return 'D';
  return 'F';
});

analysisSchema.virtual('issuesSummary').get(function() {
  return this.issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});
});

analysisSchema.virtual('criticalRecommendationsCount').get(function() {
  return this.recommendations.filter(rec => 
    rec.priority === 'high' || rec.priority === 'critical'
  ).length;
});

analysisSchema.virtual('vulnerabilityBreakdown').get(function() {
  return this.security.vulnerabilities.reduce((acc, vuln) => {
    acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});
});

analysisSchema.index({ repository: 1, createdAt: -1 });
analysisSchema.index({ qualityScore: -1, createdAt: -1 });
analysisSchema.index({ status: 1, createdAt: -1 });
analysisSchema.index({ 'repository': 1, 'status': 1 });
analysisSchema.index({ 'codeMetrics.testCoverage': -1 });
analysisSchema.index({ 'security.securityScore': -1 });

analysisSchema.pre('save', function(next) {
  if (this.isNew) {
    this.calculateTrends();
  }
  next();
});

analysisSchema.statics.getLatestForRepository = function(repositoryId) {
  return this.findOne({ repository: repositoryId })
    .sort({ createdAt: -1 })
    .populate('repository');
};

analysisSchema.statics.getQualityTrends = function(repositoryId, limit = 10) {
  return this.find({ repository: repositoryId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('qualityScore codeMetrics.testCoverage security.securityScore createdAt');
};

analysisSchema.statics.getAverageScores = function() {
  return this.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        avgQuality: { $avg: '$qualityScore' },
        avgCoverage: { $avg: '$codeMetrics.testCoverage' },
        avgSecurity: { $avg: '$security.securityScore' },
        avgComplexity: { $avg: '$complexity.averageComplexity' },
        count: { $sum: 1 }
      }
    }
  ]);
};

analysisSchema.methods.calculateTrends = async function() {
  try {
    const previousAnalysis = await this.constructor.findOne({
      repository: this.repository,
      _id: { $ne: this._id },
      status: 'completed'
    }).sort({ createdAt: -1 });

    if (previousAnalysis) {
      this.trends.qualityScoreDelta = this.qualityScore - previousAnalysis.qualityScore;
      this.trends.coverageDelta = this.codeMetrics.testCoverage - previousAnalysis.codeMetrics.testCoverage;
      this.trends.complexityDelta = this.complexity.averageComplexity - previousAnalysis.complexity.averageComplexity;
      this.trends.issuesDelta = this.issues.length - previousAnalysis.issues.length;
    }
  } catch (error) {
    console.warn('Failed to calculate trends:', error.message);
  }
};

analysisSchema.methods.getSummary = function() {
  return {
    id: this._id,
    qualityScore: this.qualityScore,
    qualityGrade: this.qualityGrade,
    coverage: this.codeMetrics.testCoverage,
    security: this.security.securityScore,
    complexity: this.complexity.complexityGrade,
    issues: this.issuesSummary,
    vulnerabilities: this.vulnerabilityBreakdown,
    recommendations: this.criticalRecommendationsCount,
    createdAt: this.createdAt
  };
};

analysisSchema.methods.isStale = function(hours = 24) {
  const staleTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.createdAt < staleTime;
};

module.exports = mongoose.model('Analysis', analysisSchema);