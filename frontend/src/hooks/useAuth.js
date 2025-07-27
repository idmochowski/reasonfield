import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Login function
  const login = async (credential) => {
    try {
      const userData = await authService.authenticateWithGoogle(credential);
      const fullUserData = { ...userData, token: credential };
      
      authService.saveUser(fullUserData);
      setUser(fullUserData);
      
      return { success: true, user: fullUserData };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    authService.removeUser();
    setUser(null);
    navigate('/');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user && user.token;
  };

  // Get user token
  const getToken = () => {
    return user?.token;
  };

  // Redirect if not authenticated
  const requireAuth = () => {
    if (!isAuthenticated()) {
      navigate('/');
      return false;
    }
    return true;
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    getToken,
    requireAuth
  };
}; 