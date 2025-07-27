import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useFileUpload } from '../hooks/useFileUpload.js';
import { useReportGeneration } from '../hooks/useReportGeneration.js';
import { InstructionsBox } from '../components/upload/InstructionsBox.jsx';
import { FileUpload } from '../components/upload/FileUpload.jsx';
import { FileList } from '../components/upload/FileList.jsx';
import { ReportGenerator } from '../components/report/ReportGenerator.jsx';
import { ReportDownload } from '../components/report/ReportDownload.jsx';
import { ReportDisplay } from '../components/report/ReportDisplay.jsx';
import { StatusMessage } from '../components/common/StatusMessage.jsx';
import { VersionIndicator } from '../components/common/VersionIndicator.jsx';

export const UploadPage = () => {
  const { user, logout, requireAuth } = useAuth();
  const token = user?.token;
  
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

  // Check authentication on mount
  useEffect(() => {
    requireAuth();
  }, []);

  const handleGenerateReport = async () => {
    const result = await generateReport(files.length);
    if (result.success) {
      // Status message would be handled by the hook
    }
  };

  const handleDownloadReport = () => {
    downloadReport();
  };

  const handleLogout = () => {
    logout();
  };

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
          background: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(244,67,54,0.2)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
        onMouseLeave={(e) => e.target.style.background = '#f44336'}
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
          <ReportDownload onDownload={handleDownloadReport} />
        )}
      </div>

      <ReportDisplay reportData={reportData} reportError={reportError} />
      <VersionIndicator />
    </div>
  );
}; 