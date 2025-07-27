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
  
  // Download report as PDF
  async downloadPDFReport(token) {
    try {
      // Get client's local time in ISO format
      const clientTime = new Date().toISOString();
      
      const response = await fetch(`${apiClient.baseURL}${ENDPOINTS.GENERATE_PDF_REPORT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Time': clientTime,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'bias-report.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('PDF download failed:', error);
      throw error;
    }
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