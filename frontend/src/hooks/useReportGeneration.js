import { useState } from 'react';
import { reportService } from '../services/reportService.js';

export const useReportGeneration = (token) => {
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState('');

  // Generate report
  const generateReport = async (fileCount = 0) => {
    if (fileCount === 0) {
      setReportError('Please upload some files first before generating a report.');
      return { success: false, error: 'No files available' };
    }

    setGeneratingReport(true);
    setReportError('');
    setReportData(null);

    try {
      const report = await reportService.generateReport(token);
      
      if (reportService.validateReportData(report)) {
        const formattedReport = reportService.formatReportData(report);
        setReportData(formattedReport);
        return { 
          success: true, 
          report: formattedReport,
          message: `Report generated successfully! Found ${formattedReport.biasCount} biases.`
        };
      } else {
        throw new Error('Invalid report data received from server');
      }
    } catch (error) {
      const errorMessage = error.message || 'Report generation failed';
      setReportError(errorMessage);
      console.error('Report generation error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setGeneratingReport(false);
    }
  };

  // Download report
  const downloadReport = (filename = 'bias-report.json') => {
    if (!reportData) {
      console.error('No report data available for download');
      return false;
    }

    try {
      reportService.downloadReport(reportData, filename);
      return true;
    } catch (error) {
      console.error('Error downloading report:', error);
      setReportError('Failed to download report');
      return false;
    }
  };

  // Clear report data
  const clearReport = () => {
    setReportData(null);
    setReportError('');
  };

  // Get report statistics
  const getReportStats = () => {
    if (!reportData) return null;

    return {
      biasCount: reportData.biasCount || 0,
      summary: reportData.summary,
      processedAt: reportData.metadata?.processedAt,
      modelUsed: reportData.metadata?.model_used || 'Unknown'
    };
  };

  // Check if report is available
  const hasReport = () => {
    return reportData !== null && reportService.validateReportData(reportData);
  };

  return {
    generatingReport,
    reportData,
    reportError,
    generateReport,
    downloadReport,
    clearReport,
    getReportStats,
    hasReport
  };
}; 