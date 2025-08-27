const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    default: null
  },
  githubId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  cloneUrl: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: null,
    index: true
  },
  stars: {
    type: Number,
    default: 0,
    min: 0
  },
  forks: {
    type: Number,
    default: 0,
    min: 0
  },
  openIssues: {
    type: Number,
    default: 0,
    min: 0
  },
  size: {
    type: Number,
    default: 0,
    min: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  defaultBranch: {
    type: String,
    default: 'main'
  },
  latestAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    default: null
  },
  lastQualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
    index: true
  },
  analysisCount: {
    type: Number,
    default: 0,
    min: 0
  },
  githubCreatedAt: {
    type: Date,
    required: true
  },
  githubUpdatedAt: {
    type: Date,
    required: true
  },
  lastAnalyzedAt: {
    type: Date,
    default: null,
    index: true
  },
  lastSyncedAt: {
    type: Date,
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  autoAnalyze: {
    type: Boolean,
    default: true
  },
  analysisFrequency: {
    type: String,
    enum: ['manual', 'daily', 'weekly', 'monthly'],
    default: 'manual'
  },
  totalCommits: {
    type: Number,
    default: 0
  },
  contributors: {
    type: Number,
    default: 0
  },
  languageStats: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

repositorySchema.virtual('analyses', {
  ref: 'Analysis',
  localField: '_id',
  foreignField: 'repository'
});

repositorySchema.virtual('qualityGrade').get(function() {
  if (!this.lastQualityScore) return 'N/A';
  
  if (this.lastQualityScore >= 90) return 'A';
  if (this.lastQualityScore >= 80) return 'B';
  if (this.lastQualityScore >= 70) return 'C';
  if (this.lastQualityScore >= 60) return 'D';
  return 'F';
});

repositorySchema.virtual('githubUrl').get(function() {
  return `https://github.com/${this.owner}/${this.name}`;
});

repositorySchema.virtual('daysSinceLastAnalysis').get(function() {
  if (!this.lastAnalyzedAt) return null;
  
  const diffTime = Date.now() - this.lastAnalyzedAt.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

repositorySchema.index({ owner: 1, name: 1 }, { unique: true });
repositorySchema.index({ lastQualityScore: -1, lastAnalyzedAt: -1 });
repositorySchema.index({ language: 1, lastQualityScore: -1 });
repositorySchema.index({ stars: -1, forks: -1 });
repositorySchema.index({ createdAt: -1 });

repositorySchema.pre('save', function(next) {
  this.fullName = `${this.owner}/${this.name}`;
  if (this.language) {
    this.language = this.language.charAt(0).toUpperCase() + this.language.slice(1).toLowerCase();
  }
  
  next();
});

repositorySchema.statics.findByGitHub = function(owner, name) {
  return this.findOne({ 
    owner: owner.toLowerCase(), 
    name: name.toLowerCase() 
  });
};

repositorySchema.statics.getTopRated = function(limit = 10) {
  return this.find({ 
    lastQualityScore: { $exists: true, $ne: null },
    isActive: true 
  })
  .sort({ lastQualityScore: -1, stars: -1 })
  .limit(limit)
  .populate('latestAnalysis');
};

repositorySchema.statics.getLanguageStats = function() {
  return this.aggregate([
    { $match: { isActive: true, language: { $ne: null } } },
    { $group: { _id: '$language', count: { $sum: 1 }, avgScore: { $avg: '$lastQualityScore' } } },
    { $sort: { count: -1 } }
  ]);
};

repositorySchema.methods.needsAnalysis = function() {
  if (!this.lastAnalyzedAt) return true;
  
  const daysSince = this.daysSinceLastAnalysis;
  
  switch (this.analysisFrequency) {
    case 'daily': return daysSince >= 1;
    case 'weekly': return daysSince >= 7;
    case 'monthly': return daysSince >= 30;
    default: return false; 
  }
};

repositorySchema.methods.updateFromGitHub = function(githubData) {
  this.description = githubData.description;
  this.language = githubData.language;
  this.stars = githubData.stars;
  this.forks = githubData.forks;
  this.openIssues = githubData.openIssues;
  this.size = githubData.size;
  this.githubUpdatedAt = githubData.updatedAt;
  this.lastSyncedAt = new Date();
};

module.exports = mongoose.model('Repository', repositorySchema);