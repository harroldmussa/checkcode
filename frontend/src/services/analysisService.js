import { apiService } from './apiService';

export const analysisService = {
  // Analyze repository
  analyzeRepository: async (repoUrl) => {
    try {
      const response = await apiService.analyzeRepository(repoUrl);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get analysis by ID
  getAnalysis: async (analysisId) => {
    try {
      const response = await apiService.getAnalysisById(analysisId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get analysis history for repository
  getAnalysisHistory: async (repoId, limit = 10) => {
    try {
      const response = await apiService.getAnalysisHistory(repoId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get badge variants
  getBadgeVariants: async (owner, repo) => {
    try {
      const response = await apiService.getBadgeVariants(owner, repo);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate badge URL
  generateBadgeUrl: (owner, repo, type = 'quality', style = 'flat') => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    const badgeType = type === 'quality' ? '' : `/${type}`;
    return `${baseUrl}/analysis/badge/${owner}/${repo}${badgeType}?style=${style}`;
  },

  // Get analysis trends
  getAnalysisTrends: async (repoId, period = '30d') => {
    try {
      const response = await apiService.get(`/analysis/trends/${repoId}?period=${period}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Compare analyses
  compareAnalyses: async (analysisId1, analysisId2) => {
    try {
      const response = await apiService.get(`/analysis/compare/${analysisId1}/${analysisId2}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export analysis report
  exportAnalysis: async (analysisId, format = 'pdf') => {
    try {
      const response = await apiService.get(`/analysis/${analysisId}/export?format=${format}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-report-${analysisId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};