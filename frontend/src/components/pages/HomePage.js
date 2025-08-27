import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Github, 
  Search, 
  Shield, 
  BarChart3, 
  Zap, 
  Users,
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useQuery } from 'react-query';
import { repositoryService } from '../services/repositoryService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const HomePage = () => {
  const { data: stats, isLoading } = useQuery(
    'repository-stats',
    repositoryService.getRepositoryStats,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const features = [
    {
      icon: Search,
      title: 'Code Analysis',
      description: 'Comprehensive analysis of code quality, complexity, and maintainability metrics.'
    },
    {
      icon: Shield,
      title: 'Security Scanning',
      description: 'Identify security vulnerabilities and outdated dependencies in your codebase.'
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description: 'Visual reports with actionable insights and improvement recommendations.'
    },
    {
      icon: Zap,
      title: 'Fast Analysis',
      description: 'Quick repository analysis with caching for improved performance.'
    },
    {
      icon: TrendingUp,
      title: 'Trend Tracking',
      description: 'Monitor code quality improvements over time with historical data.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share quality reports and collaborate on code improvements.'
    }
  ];

  const benefits = [
    'Improve code maintainability',
    'Reduce technical debt',
    'Enhance security posture',
    'Increase development velocity',
    'Better code reviews',
    'Track quality metrics'
  ];

  return (
    <>
      <Helmet>
        <title>Code Quality Dashboard - Analyze GitHub Repositories</title>
        <meta name="description" content="Analyze GitHub repositories for code quality, security vulnerabilities, and maintainability. Get actionable insights to improve your codebase." />
      </Helmet>

      <div className="lg:ml-64">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjciLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
          
          <div className="relative px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                Analyze Your Code Quality
                <span className="gradient-text block">Instantly</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get comprehensive insights into your GitHub repositories. Analyze code quality, 
                security vulnerabilities, and maintainability with actionable recommendations.
              </p>
              
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/analyze" className="btn-primary text-lg px-8 py-3">
                  <Search className="h-5 w-5 mr-2" />
                  Analyze Repository
                </Link>
                <Link to="/repositories" className="btn-secondary text-lg px-8 py-3">
                  <Github className="h-5 w-5 mr-2" />
                  Browse Examples
                </Link>
              </div>

              {/* Stats */}
              {!isLoading && stats?.data && (
                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.data.totalRepositories?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Repositories Analyzed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.data.averageQualityScore || '0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Average Quality Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.data.languageDistribution?.length || '0'}+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Languages Supported
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Powerful Code Analysis Features
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Everything you need to understand and improve your codebase
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.title} className="flex flex-col items-center text-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Why Choose Our Platform?
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                  Join thousands of developers improving their code quality
                </p>
              </div>
              
              <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="lg:pl-8">
                  <div className="glass-card p-8 rounded-2xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Get Started Today
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Analyze your first repository in seconds. No signup required for basic analysis.
                    </p>
                    <div className="space-y-4">
                      <Link to="/analyze" className="block w-full btn-primary text-center">
                        Start Free Analysis
                      </Link>
                      <Link to="/about" className="block w-full btn-secondary text-center">
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 bg-blue-600 dark:bg-blue-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to improve your code quality?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
                Join the community of developers using data-driven insights to build better software.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link 
                  to="/analyze" 
                  className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get started
                </Link>
                <a 
                  href="https://github.com/yourusername/code-quality-dashboard" 
                  className="text-lg font-semibold leading-6 text-white hover:text-blue-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;