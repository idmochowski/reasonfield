import { apiClient } from './api.js';
import { ENDPOINTS } from '../utils/constants.js';

export const fileService = {
  // Upload a file
  async uploadFile(file, token) {
    return apiClient.uploadFile(ENDPOINTS.UPLOAD, file, token);
  },
  
  // Get list of user files
  async getFiles(token) {
    return apiClient.get(ENDPOINTS.FILES, token);
  },
  
  // Delete a file
  async deleteFile(filename, token) {
    const encodedFilename = encodeURIComponent(filename);
    return apiClient.delete(`${ENDPOINTS.FILES}/${encodedFilename}`, token);
  },
  
  // Validate file type
  validateFileType(file) {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    
    // Check MIME type
    if (allowedTypes.includes(file.type)) {
      return true;
    }
    
    // Check file extension as fallback
    return allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  },
  
  // Format file data for display
  formatFileData(fileData) {
    return {
      name: fileData.filename,
      size: fileData.size,
      created: fileData.created,
      updated: fileData.updated
    };
  },
}; 