export const InstructionsBox = () => {
  return (
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
          <strong>4. Download Results:</strong> Download your bias analysis report in PDF. This might take a minute.
        </p>
      </div>
    </div>
  );
}; 