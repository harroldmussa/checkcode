import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Search, Github, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useMutation } from 'react-query';
import { analysisService } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AnalyzePage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const navigate = useNavigate();

  const analysisMutation = useMutation(
    (url) => analysisService.analyzeRepository(url),
    {
      onSuccess: (data) => {
        setAnalysisResult(data.data);
        toast.success('Analysis completed successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Analysis failed');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL');
      return;
    }

    if (!repoUrl.includes('github.com')) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }

    analysisMutation.mutate(repoUrl.trim());
  };

  const handleViewDetails = () => {
    if (analysisResult?.repository) {
      const { owner, name } = analysisResult.repository;
      navigate(`/repository/${owner}/${name}`);
    }
  };

  const exampleRepositories = [
    'https://github.com/facebook/react',
    'https://github.com/vuejs/vue',
    'https://github.com/expressjs/express',
    'https://github.com/microsoft/vscode',
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'badge-green';
    if (score >= 80) return 'badge-blue';
    if (score >= 70) return 'badge-yellow';
    return 'badge-red';
  };

  return (
    <>
      <Helmet>
        <title>Analyze Repository - Code Quality Dashboard</title>
        <meta name="description" content="Analyze any GitHub repository for code quality, security vulnerabilities, and maintainability metrics." />
      </Helmet>

      <div className="lg:ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Analyze Repository
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Enter a GitHub repository URL to get comprehensive quality analysis
            </p>
          </div>

          {/* Analysis Form */}
          <div className="card p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Github className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="repo-url"
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="input-field pl-10"
                    disabled={analysisMutation.isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={analysisMutation.isLoading || !repoUrl.trim()}
                className="w-full btn-primary text-lg py-3"
              >
                {analysisMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" text="" className="mr-3" />
                    Analyzing Repository...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Analyze Repository
                  </>
                )}
              </button>
            </form>

            {/* Example repositories */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Try these example repositories:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleRepositories.map((url) => (
                  <button
                    key={url}
                    onClick={() => setRepoUrl(url)}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={analysisMutation.isLoading}
                  >
                    {url.replace('https://github.com/', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Progress */}
          {analysisMutation.isLoading && (
            <div className="card p-8 text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analyzing Repository
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This may take a few moments while we analyze your code...
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Fetching repository data</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Running code quality analysis</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Scanning for security issues</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Generating recommendations</span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="card p-8 text-center">
                <div className="mb-4">
                  <div className={`text-6xl font-bold ${getScoreColor(analysisResult.analysis.qualityScore)}`}>
                    {analysisResult.analysis.qualityScore}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Overall Quality Score
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-3 ${getScoreBadgeColor(analysisResult.analysis.qualityScore)}`}>
                    {analysisResult.analysis.qualityScore >= 90 ? 'Excellent' :
                     analysisResult.analysis.qualityScore >= 80 ? 'Good' :
                     analysisResult.analysis.qualityScore >= 70 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {analysisResult.repository.fullName}
                </h2>
                {analysisResult.repository.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {analysisResult.repository.description}
                  </p>
                )}

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span>{analysisResult.repository.language}</span>
                  </div>
                  <div>⭐ {analysisResult.repository.stars?.toLocaleString()}</div>
                  <div>🍴 {analysisResult.repository.forks?.toLocaleString()}</div>
                </div>

                <button
                  onClick={handleViewDetails}
                  className="mt-6 btn-primary"
                >
                  View Detailed Analysis
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Test Coverage</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analysisResult.analysis.codeMetrics?.testCoverage || 0}%
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Security Issues</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analysisResult.analysis.security?.vulnerabilities?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lines of Code</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analysisResult.analysis.codeMetrics?.linesOfCode?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Github className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {analysisResult.analysis.recommendations && analysisResult.analysis.recommendations.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Recommendations
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.analysis.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/50' :
                          rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                          'bg-blue-100 dark:bg-blue-900/50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-500' :
                            rec.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {rec.message || rec.title}
                          </p>
                          {rec.action && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {rec.action}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <strong>1. Repository Analysis</strong>
                <p>We fetch your repository and analyze the codebase structure.</p>
              </div>
              <div>
                <strong>2. Quality Assessment</strong>
                <p>Run multiple quality checks including complexity, maintainability, and security.</p>
              </div>
              <div>
                <strong>3. Actionable Insights</strong>
                <p>Get prioritized recommendations to improve your code quality.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyzePage;