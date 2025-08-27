import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Verify token with backend
        const userData = await authService.verifyToken(token);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { user: userData, token } = response.data;
        
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('Successfully logged in!');
        return { success: true, user: userData };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        toast.success('Account created successfully! Please log in.');
        return { success: true };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await authService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Successfully logged out');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      const response = await authService.requestPasswordReset(email);
      
      if (response.success) {
        toast.success('Password reset link sent to your email!');
        return { success: true };
      } else {
        throw new Error(response.error || 'Password reset request failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password reset request failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(token, newPassword);
      
      if (response.success) {
        toast.success('Password reset successfully! Please log in.');
        return { success: true };
      } else {
        throw new Error(response.error || 'Password reset failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
