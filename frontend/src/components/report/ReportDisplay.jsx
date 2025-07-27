export const ReportDisplay = ({ reportData, reportError }) => {
  if (reportError) {
    return (
      <div style={{ 
        color: '#d32f2f', 
        marginTop: '1rem',
        fontWeight: 500,
        textAlign: 'center',
        maxWidth: 500
      }}>
        Error: {reportError}
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
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
        <strong>Total Biases Found:</strong> {reportData.biasCount || reportData.detected_biases?.length || 0}
      </div>
      
      {reportData.detected_biases?.map((bias, idx) => (
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
  );
}; 