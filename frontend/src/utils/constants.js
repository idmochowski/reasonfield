// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// File Upload Configuration
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.txt', '.docx'];

// App Configuration
export const APP_NAME = 'Reasonfield BETA';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'DEV';

// API Endpoints
export const ENDPOINTS = {
  AUTH: '/auth/google',
  UPLOAD: '/upload',
  FILES: '/files',
  GENERATE_REPORT: '/generate-report',
  HEALTH: '/health'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'rf_user'
};

// UI Constants
export const COLORS = {
  PRIMARY: '#200048',
  SECONDARY: '#f8f5ff',
  SUCCESS: '#2e7d32',
  ERROR: '#d32f2f',
  WARNING: '#ed6c02',
  INFO: '#0288d1'
}; 