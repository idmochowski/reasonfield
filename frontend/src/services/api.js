import { API_BASE_URL } from '../utils/constants.js';

// API client configuration
export const apiClient = {
  baseURL: API_BASE_URL,
  
  // Default headers
  getHeaders: (token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },
  
  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.token),
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  },
  
  // GET request
  async get(endpoint, token = null) {
    return this.request(endpoint, { method: 'GET', token });
  },
  
  // POST request
  async post(endpoint, data = null, token = null) {
    const options = {
      method: 'POST',
      token,
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return this.request(endpoint, options);
  },
  
  // DELETE request
  async delete(endpoint, token = null) {
    return this.request(endpoint, { method: 'DELETE', token });
  },
  
  // File upload request
  async uploadFile(endpoint, file, token = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(token);
    delete headers['Content-Type']; // Let browser set content-type for FormData
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`File upload failed: ${endpoint}`, error);
      throw error;
    }
  },
}; 