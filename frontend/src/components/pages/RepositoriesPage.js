import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Filter, 
  Github, 
  Star, 
  GitFork, 
  AlertCircle,
  Calendar,
  Code,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useQuery } from 'react-query';
import { repositoryService } from '../services/repositoryService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';

const RepositoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const language = searchParams.get('language') || '';
  const sortBy = searchParams.get('sortBy') || 'lastAnalyzedAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const minScore = searchParams.get('minScore') || '';
  const maxScore = searchParams.get('maxScore') || '';

  const { data, isLoading, error } = useQuery(
    ['repositories', { page, search, language, sortBy, sortOrder, minScore, maxScore }],
    () => repositoryService.getRepositories({
      page,
      limit: 12,
      search,
      language,
      sortBy,
      sortOrder,
      minScore,
      maxScore,
    }),
    {
      keepPreviousData: true,
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when changing filters
    if (updates.page === undefined) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    updateSearchParams({ search: e.target.value });
  };

  const handleSortChange = (newSortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'badge-green';
    if (score >= 80) return 'badge-blue';
    if (score >= 70) return 'badge-yellow';
    return 'badge-red';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 
    'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin'
  ];

  const repositories = data?.data?.repositories || [];
  const pagination = data?.data?.pagination || {};

  return (
    <>
      <Helmet>
        <title>Repositories - Code Quality Dashboard</title>
        <meta name="description" content="Browse analyzed repositories and their quality scores. Find examples and inspiration for your own projects." />
      </Helmet>

      <div className="lg:ml-64">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Repositories
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Browse analyzed repositories and their quality metrics
              </p>
            </div>
            <Link to="/analyze" className="btn-primary mt-4 sm:mt-0">
              <Code className="h-4 w-4 mr-2" />
              Analyze New Repo
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="card p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search repositories..."
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => updateSearchParams({ language: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All Languages</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={(e) => updateSearchParams({ minScore: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={maxScore}
                    onChange={(e) => updateSearchParams({ maxScore: e.target.value })}
                    placeholder="100"
                    className="input-field"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => updateSearchParams({ 
                      language: '', 
                      minScore: '', 
                      maxScore: '' 
                    })}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 py-2">Sort by:</span>
            {[
              { key: 'lastQualityScore', label: 'Quality Score' },
              { key: 'lastAnalyzedAt', label: 'Last Analyzed' },
              { key: 'stars', label: 'Stars' },
              { key: 'name', label: 'Name' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => handleSortChange(option.key)}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                  sortBy === option.key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
                {sortBy === option.key && (
                  <span className="ml-1">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading repositories..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="card p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Repositories
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {error.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && repositories.length === 0 && (
            <EmptyState
              icon={Github}
              title="No repositories found"
              description={search ? 
                `No repositories match your search "${search}". Try adjusting your filters or search terms.` :
                "No repositories have been analyzed yet. Start by analyzing your first repository!"
              }
              action={
                <Link to="/analyze" className="btn-primary">
                  Analyze Repository
                </Link>
              }
            />
          )}

          {/* Repository Grid */}
          {!isLoading && !error && repositories.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
                  <Link
                    key={repo._id}
                    to={`/repository/${repo.owner}/${repo.name}`}
                    className="card p-6 hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {repo.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {repo.owner}
                        </p>
                      </div>
                      {repo.lastQualityScore && (
                        <div className={`text-2xl font-bold ${getScoreColor(repo.lastQualityScore)}`}>
                          {repo.lastQualityScore}
                        </div>
                      )}
                    </div>

                    {repo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        {repo.language && (
                          <div className="flex items-center space-x-1">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{repo.stars?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="h-3 w-3" />
                          <span>{repo.forks?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {repo.lastQualityScore && (
                        <span className={`${getScoreBadgeColor(repo.lastQualityScore)}`}>
                          {repo.lastQualityScore >= 90 ? 'Excellent' :
                           repo.lastQualityScore >= 80 ? 'Good' :
                           repo.lastQualityScore >= 70 ? 'Fair' : 'Poor'}
                        </span>
                      )}
                      {repo.lastAnalyzedAt && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(repo.lastAnalyzedAt)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {pagination.currentPage} of {pagination.totalPages}
                    ({pagination.totalItems} total repositories)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateSearchParams({ page: page - 1 })}
                      disabled={!pagination.hasPrev}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => updateSearchParams({ page: page + 1 })}
                      disabled={!pagination.hasNext}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RepositoriesPage;