export const ReportDownload = ({ onDownload, disabled = false }) => {
  return (
    <button
      style={{
        background: '#2e7d32',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 2rem',
        fontSize: '1.1rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
        transition: 'background 0.2s',
        opacity: disabled ? 0.7 : 1,
      }}
      onClick={onDownload}
      disabled={disabled}
      onMouseEnter={(e) => !disabled && (e.target.style.background = '#1b5e20')}
      onMouseLeave={(e) => !disabled && (e.target.style.background = '#2e7d32')}
    >
      Download Report
    </button>
  );
}; 