import { ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '../../utils/constants.js';

export const FileUpload = ({ onFileChange, disabled = false }) => {
  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    onFileChange(selectedFiles);
  };

  return (
    <div style={{ 
      marginBottom: '2rem',
      width: '100%',
      maxWidth: '500px',
      textAlign: 'center'
    }}>
      <label
        htmlFor="file-upload"
        style={{
          padding: '1.5rem 3rem',
          fontSize: '1.2rem',
          fontWeight: 600,
          color: disabled ? '#999' : '#fff',
          backgroundColor: disabled ? '#e0e0e0' : '#200048',
          border: '3px dashed #200048',
          borderRadius: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(32, 0, 72, 0.2)',
          minWidth: '300px',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.target.style.backgroundColor = '#4a148c';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(32, 0, 72, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.target.style.backgroundColor = '#200048';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(32, 0, 72, 0.2)';
          }
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          📁
        </div>
        <div>
          {disabled ? 'Uploading...' : 'Choose Files or Drag & Drop'}
        </div>
        <div style={{ 
          fontSize: '0.9rem', 
          opacity: 0.8, 
          marginTop: '0.5rem',
          fontWeight: 400
        }}>
          PDF, TXT, DOCX files
        </div>
      </label>
      
      <input
        id="file-upload"
        type="file"
        accept={[...ALLOWED_FILE_TYPES, ...ALLOWED_FILE_EXTENSIONS].join(',')}
        multiple
        onChange={handleChange}
        disabled={disabled}
        style={{ 
          display: 'none' // Hide the default input
        }}
      />
    </div>
  );
}; 