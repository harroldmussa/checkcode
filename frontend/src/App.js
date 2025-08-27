import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Layout components
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/Common/ErrorBoundary';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AnalyzePage = React.lazy(() => import('./pages/AnalyzePage'));
const RepositoriesPage = React.lazy(() => import('./pages/RepositoriesPage'));
const RepositoryDetailPage = React.lazy(() => import('./pages/RepositoryDetailPage'));
const AnalysisDetailPage = React.lazy(() => import('./pages/AnalysisDetailPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <div className="App">
      <Helmet>
        <title>Code Quality Dashboard</title>
        <meta
          name="description"
          content="Analyze GitHub repositories for code quality, security vulnerabilities, and maintainability metrics. Get actionable insights to improve your codebase."
        />
        <meta name="keywords" content="code quality, github analysis, static analysis, security scanning, technical debt" />
        <link rel="canonical" href={window.location.origin} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:title" content="Code Quality Dashboard" />
        <meta property="og:description" content="Analyze GitHub repositories for code quality, security, and maintainability" />
        <meta property="og:image" content={`${window.location.origin}/og-image.png`} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.origin} />
        <meta property="twitter:title" content="Code Quality Dashboard" />
        <meta property="twitter:description" content="Analyze GitHub repositories for code quality, security, and maintainability" />
        <meta property="twitter:image" content={`${window.location.origin}/og-image.png`} />
      </Helmet>

      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/repository/:owner/:name" element={<RepositoryDetailPage />} />
              <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Catch all route - 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </div>
  );
}

export default App;