export const ReportDownloadOptions = ({ onDownloadPDF, disabled = false }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      flexDirection: 'column', 
      alignItems: 'center',
      marginTop: '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexDirection: 'row', 
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* PDF Download Button */}
        <button
          style={{
            background: '#d32f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(211,47,47,0.2)',
            transition: 'all 0.3s ease',
            opacity: disabled ? 0.7 : 1,
          }}
          onClick={onDownloadPDF}
          disabled={disabled}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.target.style.background = '#b71c1c';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(211,47,47,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.target.style.background = '#d32f2f';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(211,47,47,0.2)';
            }
          }}
        >
          📋 Download PDF
        </button>
      </div>
    </div>
  );
}; 