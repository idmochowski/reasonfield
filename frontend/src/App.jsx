import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function LoginPage() {
  // Check if already logged in
  const navigate = useNavigate();
  useEffect(() => {
    const user = window.localStorage.getItem('rf_user');
    if (user) navigate('/upload');
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: '#200048', fontWeight: 800, fontSize: '3rem', marginBottom: '3rem', letterSpacing: '0.03em' }}>Reasonfield beta</h1>
      {/* Google Sign-In button */}
      <div id="g_id_onload"
        data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false">
      </div>
      <div className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="sign_in_with"
        data-size="large"
        data-logo_alignment="left">
      </div>
      {/* Version indicator */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        fontSize: '12px', 
        color: '#666', 
        fontFamily: 'monospace' 
      }}>
        v{import.meta.env.VITE_APP_VERSION || '1.0.0'} • {new Date().toLocaleDateString()}
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

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
      <h2 style={{ color: '#200048', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem' }}>Upload your files</h2>
      
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
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
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
