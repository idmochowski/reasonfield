import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useFileUpload } from '../hooks/useFileUpload.js';
import { useReportGeneration } from '../hooks/useReportGeneration.js';
import { InstructionsBox } from '../components/upload/InstructionsBox.jsx';
import { FileUpload } from '../components/upload/FileUpload.jsx';
import { FileList } from '../components/upload/FileList.jsx';
import { ReportGenerator } from '../components/report/ReportGenerator.jsx';
import { ReportDownloadOptions } from '../components/report/ReportDownloadOptions.jsx';
import { ReportDisplay } from '../components/report/ReportDisplay.jsx';
import { StatusMessage } from '../components/common/StatusMessage.jsx';
import { VersionIndicator } from '../components/common/VersionIndicator.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { reportService } from '../services/reportService.js';

export const UploadPage = () => {
  const { user, loading: authLoading, logout, requireAuth } = useAuth();
  const token = user?.token;
  const [pdfStatus, setPdfStatus] = useState('');
  
  const {
    files,
    uploading,
    loading: filesLoading,
    uploadStatus,
    handleFileChange,
    deleteFile
  } = useFileUpload(token);

  const {
    generatingReport,
    reportData,
    reportError,
    generateReport,
    downloadReport
  } = useReportGeneration(token);

  // Check authentication on mount (only after auth is loaded)
  useEffect(() => {
    if (!authLoading) {
      requireAuth();
    }
  }, [authLoading, requireAuth]);

  const handleGenerateReport = async () => {
    const result = await generateReport(files.length);
    if (result.success) {
      // Status message would be handled by the hook
    }
  };

  const handleDownloadJSON = () => {
    downloadReport();
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfStatus('Generating PDF...');
      await reportService.downloadPDFReport(token);
      setPdfStatus('PDF downloaded successfully!');
      setTimeout(() => setPdfStatus(''), 3000);
    } catch (error) {
      console.error('PDF download failed:', error);
      setPdfStatus(`PDF download failed: ${error.message}`);
      setTimeout(() => setPdfStatus(''), 5000);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100vw', 
        background: '#fff', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <LoadingSpinner size={60} />
        <div style={{ marginTop: '1rem', color: '#200048', fontSize: '1.1rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: '4rem', 
      position: 'relative' 
    }}>
      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '4rem',
          right: '2rem',
          background: '#d32f2f',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(211,47,47,0.2)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#b71c1c'}
        onMouseLeave={(e) => e.target.style.background = '#d32f2f'}
      >
        Logout
      </button>
      
      <h2 style={{ color: '#200048', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem' }}>
        Upload your files
      </h2>
      
      <InstructionsBox />
      
      <FileUpload onFileChange={handleFileChange} disabled={uploading} />
      
      <StatusMessage 
        message={uploadStatus} 
        type={uploadStatus.includes('Error') ? 'error' : 'success'} 
      />
      
      {pdfStatus && (
        <StatusMessage 
          message={pdfStatus} 
          type={pdfStatus.includes('failed') ? 'error' : 'success'} 
        />
      )}
      
      <FileList 
        files={files} 
        onDelete={deleteFile} 
        loading={filesLoading} 
      />
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
        <ReportGenerator 
          onGenerate={handleGenerateReport}
          generating={generatingReport}
          disabled={files.length === 0}
        />
        
        {reportData && (
          <ReportDownloadOptions 
            onDownloadJSON={handleDownloadJSON}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </div>

      <ReportDisplay reportData={reportData} reportError={reportError} />
      <VersionIndicator />
    </div>
  );
}; 