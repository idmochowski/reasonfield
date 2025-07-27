import { apiClient } from './api.js';
import { ENDPOINTS } from '../utils/constants.js';

export const authService = {
  // Google authentication
  async authenticateWithGoogle(credential) {
    return apiClient.post(ENDPOINTS.AUTH, { credential });
  },
  
  // Get current user from localStorage
  getCurrentUser() {
    const userData = localStorage.getItem('rf_user');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  // Save user to localStorage
  saveUser(userData) {
    localStorage.setItem('rf_user', JSON.stringify(userData));
  },
  
  // Remove user from localStorage
  removeUser() {
    localStorage.removeItem('rf_user');
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    const user = this.getCurrentUser();
    return user && user.token;
  },
  
  // Get user token
  getToken() {
    const user = this.getCurrentUser();
    return user?.token;
  },
}; 