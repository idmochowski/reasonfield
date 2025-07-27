import { ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '../../utils/constants.js';

export const FileUpload = ({ onFileChange, disabled = false }) => {
  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    onFileChange(selectedFiles);
  };

  return (
    <input
      type="file"
      accept={[...ALLOWED_FILE_TYPES, ...ALLOWED_FILE_EXTENSIONS].join(',')}
      multiple
      onChange={handleChange}
      disabled={disabled}
      style={{ marginBottom: '1rem' }}
    />
  );
}; 