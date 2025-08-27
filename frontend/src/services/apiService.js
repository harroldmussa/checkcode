// ===== src/services/apiService.js =====
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth_token');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please log in again.');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
          
        case 404:
          toast.error('The requested resource was not found.');
          break;
          
        case 429:
          toast.error('Rate limit exceeded. Please try again later.');
          break;
          
        case 500:
          toast.error('Internal server error. Please try again later.');
          break;
          
        default:
          if (data && data.message) {
            toast.error(data.message);
          } else {
            toast.error('An unexpected error occurred.');
          }
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection and try again.');
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Generic methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Analysis endpoints
  analyzeRepository: (repoUrl) => {
    return api.post('/analysis', { repoUrl });
  },

  getAnalysisHistory: (repoId) => {
    return api.get(`/analysis/history/${repoId}`);
  },

  getAnalysisById: (analysisId) => {
    return api.get(`/analysis/${analysisId}`);
  },

  // Repository endpoints
  getRepositories: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/repositories?${queryString}`);
  },

  getRepository: (id) => {
    return api.get(`/repositories/${id}`);
  },

  getRepositoryByGitHub: (owner, name) => {
    return api.get(`/repositories/${owner}/${name}`);
  },

  addRepository: (repoUrl, autoAnalyze = true) => {
    return api.post('/repositories', { repoUrl, autoAnalyze });
  },

  updateRepository: (id, data) => {
    return api.put(`/repositories/${id}`, data);
  },

  deleteRepository: (id) => {
    return api.delete(`/repositories/${id}`);
  },

  syncRepository: (id) => {
    return api.post(`/repositories/${id}/sync`);
  },

  getRepositoryStats: () => {
    return api.get('/repositories/stats');
  },

  // Badge endpoints
  getBadgeVariants: (owner, repo) => {
    return api.get(`/analysis/badge/${owner}/${repo}/variants`);
  },

  // Dashboard endpoints
  getDashboardStats: () => {
    return api.get('/dashboard/stats');
  },

  getRecentActivity: (limit = 10) => {
    return api.get(`/dashboard/activity?limit=${limit}`);
  },

  getTrendingRepositories: (limit = 10) => {
    return api.get(`/dashboard/trending?limit=${limit}`);
  },

  // Search endpoints
  searchRepositories: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/search/repositories?${queryString}`);
  },

  // Health check
  healthCheck: () => {
    return api.get('/health');
  },

  // File upload (for batch analysis)
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

export default api;