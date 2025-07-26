import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

function LoginPage() {
  // Check if already logged in
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = window.localStorage.getItem('rf_user');
    if (user) navigate('/upload');
  }, [navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: window.handleCredentialResponse
      });
    }
  }, []);

  const handleGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      alert('Google Sign-In is not available. Please refresh the page.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: '#200048', fontWeight: 800, fontSize: '3rem', marginBottom: '3rem', letterSpacing: '0.03em' }}>🚀 Reasonfield BETA 🚀</h1>
      
      {/* Custom Google Sign-In button */}
      <button
        onClick={handleGoogleSignIn}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: '#fff',
          color: '#757575',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          minWidth: '240px',
          height: '40px'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
          e.target.style.borderColor = '#c1c1c1';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
          e.target.style.borderColor = '#dadce0';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </g>
        </svg>
        Sign in with Google
      </button>
      
      {/* Version indicator */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        fontSize: '14px', 
        color: '#666', 
        fontFamily: 'monospace',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        zIndex: 1000
      }}>
        version: {import.meta.env.VITE_APP_VERSION ? import.meta.env.VITE_APP_VERSION.substring(0, 7) : 'DEV'}
      </div>
    </div>
  )
}

function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = window.localStorage.getItem('rf_user');
    if (!user) navigate('/');
  }, [navigate]);

  // Fetch existing files when component loads
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const user = JSON.parse(window.localStorage.getItem('rf_user'));
        if (!user || !user.token) return;

        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/files`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFiles(data.files.map(file => ({ name: file.filename, size: file.size, created: file.created })));
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const deleteFile = async (filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      const user = JSON.parse(window.localStorage.getItem('rf_user'));
      const token = user.token;

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
              const response = await fetch(`${apiUrl}/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.name !== filename));
        setUploadStatus(`Deleted: ${filename}`);
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Delete failed');
      }
    } catch (error) {
      setUploadStatus(`Error deleting ${filename}: ${error.message}`);
      console.error('Delete error:', error);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files).filter(f =>
      ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)
      || f.name.endsWith('.docx')
    );

    if (selectedFiles.length === 0) {
      alert('Please select valid files (PDF, TXT, or DOCX)');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading files...');

    const user = JSON.parse(window.localStorage.getItem('rf_user'));
    const token = user.token;

    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Upload failed');
        }

        const result = await response.json();
        setFiles(prev => [...prev, { name: file.name, size: file.size, created: new Date().toISOString() }]);
        setUploadStatus(`Uploaded: ${file.name}`);
      } catch (error) {
        setUploadStatus(`Error uploading ${file.name}: ${error.message}`);
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const generateReport = async () => {
    if (files.length === 0) {
      alert('Please upload some files first before generating a report.');
      return;
    }

    setGeneratingReport(true);
    setReportError('');
    setReportData(null);

    try {
      const user = JSON.parse(window.localStorage.getItem('rf_user'));
      const token = user.token;

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
              const response = await fetch(`${apiUrl}/generate-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Report generation failed');
      }

      const report = await response.json();
      setReportData(report);
      setUploadStatus(`Report generated successfully! Found ${report.detected_biases.length} biases.`);
      setTimeout(() => setUploadStatus(''), 5000);
    } catch (error) {
      setReportError(error.message);
      console.error('Report generation error:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bias-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('rf_user');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', position: 'relative' }}>
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
      
      <h2 style={{ color: '#200048', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem' }}>Upload your files</h2>
      
      {/* User Instructions Textbox */}
      <div style={{ 
        width: '100%', 
        maxWidth: 500, 
        marginBottom: '2rem',
        background: '#f8f5ff',
        borderRadius: '8px',
        padding: '1.5rem',
        border: '1px solid #e0d5f0'
      }}>
        <h3 style={{ color: '#200048', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>How to use this tool:</h3>
        <div style={{ color: '#4a4a4a', lineHeight: '1.6', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>1. Upload Documents:</strong> Select PDF, TXT, or DOCX files containing text you want to analyze for cognitive biases.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>2. Review Files:</strong> Check that all your documents are uploaded correctly. You can delete files if needed.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>3. Generate Report:</strong> Click "Generate Report" to analyze your documents for cognitive biases using AI.
          </p>
          <p style={{ marginBottom: '0' }}>
            <strong>4. Download Results:</strong> Currently, the report is in JSON format. We are working on a better UI for the report.
          </p>
        </div>
      </div>
      
      <input
        type="file"
        accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        style={{ marginBottom: '1rem' }}
      />
      
      {uploadStatus && (
        <div style={{ 
          color: uploadStatus.includes('Error') ? '#d32f2f' : '#2e7d32', 
          marginBottom: '1rem',
          fontWeight: 500 
        }}>
          {uploadStatus}
        </div>
      )}
      
      {loading ? (
        <div style={{ color: '#200048', marginBottom: '1rem' }}>Loading files...</div>
      ) : (
        <ul style={{ width: '100%', maxWidth: 500, listStyle: 'none', padding: 0 }}>
          {files.map((file, idx) => (
            <li key={idx} style={{ background: '#f3f0fa', color: '#200048', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: 8, fontWeight: 500 }}>
              {file.name}
              {file.size && (
                <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '0.5rem' }}>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              )}
              <button
                onClick={() => deleteFile(file.name)}
                style={{
                  marginLeft: '1rem',
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(211,47,47,0.2)',
                  transition: 'background 0.2s',
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
        <button
          style={{
            background: '#200048',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: generatingReport ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(32,0,72,0.08)',
            transition: 'background 0.2s',
            opacity: generatingReport ? 0.7 : 1,
          }}
          onClick={generateReport}
          disabled={generatingReport}
        >
          {generatingReport ? 'Generating Report...' : 'Generate Report'}
        </button>
        
        {/* Loading Animation and Disclaimer */}
        {generatingReport && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginTop: '1rem',
            padding: '1.5rem',
            background: '#f8f5ff',
            borderRadius: '8px',
            border: '1px solid #e0d5f0',
            maxWidth: 400
          }}>
            {/* Loading Spinner */}
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e0d5f0',
              borderTop: '4px solid #200048',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            
            {/* Disclaimer */}
            <div style={{ 
              color: '#4a4a4a', 
              textAlign: 'center',
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }}>
              <strong>AI Analysis in Progress...</strong><br />
              This may take up to a minute.<br />
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                Analyzing your documents for cognitive biases using advanced AI models.
              </span>
            </div>
          </div>
        )}
        
        {reportData && (
          <button
            style={{
              background: '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
              transition: 'background 0.2s',
            }}
            onClick={downloadReport}
          >
            Download Report
          </button>
        )}
      </div>

      {reportError && (
        <div style={{ 
          color: '#d32f2f', 
          marginTop: '1rem',
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: 500
        }}>
          Error: {reportError}
        </div>
      )}

      {reportData && (
        <div style={{ 
          marginTop: '2rem', 
          width: '100%', 
          maxWidth: 800,
          background: '#f8f5ff',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e0d6ff'
        }}>
          <h3 style={{ color: '#200048', marginBottom: '1rem' }}>
            Bias Analysis Report
          </h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            {reportData.summary}
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Total Biases Found:</strong> {reportData.detected_biases.length}
          </div>
          
          {reportData.detected_biases.map((bias, idx) => (
            <div key={idx} style={{ 
              background: '#fff', 
              padding: '1rem', 
              borderRadius: 8, 
              marginBottom: '1rem',
              border: '1px solid #e0d6ff'
            }}>
              <h4 style={{ color: '#200048', marginBottom: '0.5rem' }}>
                {bias.bias_name} - {bias.filename}
              </h4>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Context:</strong> {bias.context}
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Why it occurs:</strong> {bias.argumentation}
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Consequence:</strong> {bias.consequence}
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                <strong>Countermeasure:</strong> {bias.countermeasure}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App
