import { formatFileSize } from '../../utils/formatters.js';

export const FileItem = ({ file, onDelete }) => {
  const handleDelete = () => {
    onDelete(file.name);
  };

  return (
    <li style={{ 
      background: '#f3f0fa', 
      color: '#200048', 
      padding: '0.75rem 1rem', 
      borderRadius: 8, 
      marginBottom: 8, 
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        {file.name}
        {file.size && (
          <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '0.5rem' }}>
            ({formatFileSize(file.size)})
          </span>
        )}
      </div>
      <button
        onClick={handleDelete}
        style={{
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
        onMouseEnter={(e) => e.target.style.background = '#b71c1c'}
        onMouseLeave={(e) => e.target.style.background = '#d32f2f'}
      >
        Delete
      </button>
    </li>
  );
}; 