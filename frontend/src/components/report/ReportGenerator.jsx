import { LoadingSpinner } from '../common/LoadingSpinner.jsx';

export const ReportGenerator = ({ onGenerate, generating, disabled = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        style={{
          background: '#200048',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 600,
          cursor: generating || disabled ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(32,0,72,0.08)',
          transition: 'background 0.2s',
          opacity: generating || disabled ? 0.7 : 1,
        }}
        onClick={onGenerate}
        disabled={generating || disabled}
      >
        {generating ? 'Generating Report...' : 'Generate Report'}
      </button>
      
      {/* Loading Animation and Disclaimer */}
      {generating && (
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
          <LoadingSpinner />
          
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
    </div>
  );
}; 