import { apiClient } from './api.js';
import { ENDPOINTS } from '../utils/constants.js';

export const reportService = {
  // Generate bias report
  async generateReport(token) {
    return apiClient.post(ENDPOINTS.GENERATE_REPORT, null, token);
  },
  
  // Download report as JSON
  downloadReport(reportData, filename = 'bias-report.json') {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  },
  
  // Format report data for display
  formatReportData(reportData) {
    if (!reportData) return null;
    
    return {
      ...reportData,
      biasCount: reportData.detected_biases?.length || 0,
      summary: reportData.summary || 'No summary available',
      metadata: {
        ...reportData.metadata,
        processedAt: reportData.metadata?.processed_at || new Date().toISOString()
      }
    };
  },
  
  // Validate report data
  validateReportData(reportData) {
    if (!reportData) return false;
    
    const requiredFields = ['detected_biases', 'summary'];
    return requiredFields.every(field => reportData.hasOwnProperty(field));
  },
}; 