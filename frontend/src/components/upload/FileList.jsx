import { FileItem } from './FileItem.jsx';

export const FileList = ({ files, onDelete, loading }) => {
  if (loading) {
    return <div style={{ color: '#200048', marginBottom: '1rem' }}>Loading files...</div>;
  }

  if (files.length === 0) {
    return <div style={{ color: '#666', marginBottom: '1rem', fontStyle: 'italic' }}>No files uploaded yet.</div>;
  }

  return (
    <ul style={{ width: '100%', maxWidth: 500, listStyle: 'none', padding: 0 }}>
      {files.map((file, idx) => (
        <FileItem key={idx} file={file} onDelete={onDelete} />
      ))}
    </ul>
  );
}; 