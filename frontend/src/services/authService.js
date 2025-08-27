import { apiService } from './apiService';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiService.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Logout should work even if API call fails
      console.warn('Logout API call failed:', error);
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const response = await apiService.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiService.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiService.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate API key
  generateApiKey: async (name, permissions = []) => {
    try {
      const response = await apiService.post('/auth/api-keys', {
        name,
        permissions,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get API keys
  getApiKeys: async () => {
    try {
      const response = await apiService.get('/auth/api-keys');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Revoke API key
  revokeApiKey: async (keyId) => {
    try {
      const response = await apiService.delete(`/auth/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await apiService.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ===== src/services/repositoryService.js =====
import { apiService } from './apiService';

export const repositoryService = {
  // Get all repositories with pagination and filters
  getRepositories: async (params = {}) => {
    try {
      const response = await apiService.getRepositories(params);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single repository by ID
  getRepository: async (id) => {
    try {
      const response = await apiService.getRepository(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get repository by GitHub owner/name
  getRepositoryByGitHub: async (owner, name) => {
    try {
      const response = await apiService.getRepositoryByGitHub(owner, name);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new repository
  addRepository: async (repoUrl, options = {}) => {
    try {
      const response = await apiService.addRepository(repoUrl, options.autoAnalyze);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update repository
  updateRepository: async (id, data) => {
    try {
      const response = await apiService.updateRepository(id, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete repository
  deleteRepository: async (id) => {
    try {
      const response = await apiService.deleteRepository(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Sync repository with GitHub
  syncRepository: async (id) => {
    try {
      const response = await apiService.syncRepository(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get repository statistics
  getRepositoryStats: async () => {
    try {
      const response = await apiService.getRepositoryStats();
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search repositories
  searchRepositories: async (query, filters = {}) => {
    try {
      const response = await apiService.searchRepositories(query, filters);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get top rated repositories
  getTopRatedRepositories: async (limit = 10) => {
    try {
      const response = await apiService.getRepositories({
        sortBy: 'lastQualityScore',
        sortOrder: 'desc',
        limit,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recently analyzed repositories
  getRecentlyAnalyzed: async (limit = 10) => {
    try {
      const response = await apiService.getRepositories({
        sortBy: 'lastAnalyzedAt',
        sortOrder: 'desc',
        limit,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get repositories by language
  getRepositoriesByLanguage: async (language, limit = 10) => {
    try {
      const response = await apiService.getRepositories({
        language,
        limit,
        sortBy: 'lastQualityScore',
        sortOrder: 'desc',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
