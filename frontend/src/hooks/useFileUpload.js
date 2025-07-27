import { useState, useEffect } from 'react';
import { fileService } from '../services/fileService.js';
import { formatFileSize } from '../utils/formatters.js';

export const useFileUpload = (token) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('');

  // Fetch existing files when component loads
  useEffect(() => {
    if (token) {
      fetchFiles();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch files from server
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fileService.getFiles(token);
      const formattedFiles = response.files.map(file => fileService.formatFileData(file));
      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setUploadStatus(`Error loading files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Upload files
  const uploadFiles = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadStatus('No files selected');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading files...');

    const validFiles = selectedFiles.filter(file => {
      if (!fileService.validateFileType(file)) {
        setUploadStatus(`Invalid file type: ${file.name}. Only PDF, TXT, and DOCX files are allowed.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    for (const file of validFiles) {
      try {
        await fileService.uploadFile(file, token);
        
        // Add file to local state
        const newFile = {
          name: file.name,
          size: file.size,
          created: new Date().toISOString()
        };
        
        setFiles(prev => [...prev, newFile]);
        setUploadStatus(`Uploaded: ${file.name}`);
      } catch (error) {
        setUploadStatus(`Error uploading ${file.name}: ${error.message}`);
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // Delete file
  const deleteFile = async (filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      await fileService.deleteFile(filename, token);
      setFiles(prev => prev.filter(file => file.name !== filename));
      setUploadStatus(`Deleted: ${filename}`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      setUploadStatus(`Error deleting ${filename}: ${error.message}`);
      console.error('Delete error:', error);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  // Handle file input change - now accepts files array directly
  const handleFileChange = (selectedFiles) => {
    uploadFiles(selectedFiles);
  };

  // Get file count
  const getFileCount = () => files.length;

  // Get total file size
  const getTotalSize = () => {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  };

  // Format total size
  const getFormattedTotalSize = () => {
    return formatFileSize(getTotalSize());
  };

  return {
    files,
    uploading,
    loading,
    uploadStatus,
    uploadFiles,
    deleteFile,
    handleFileChange,
    fetchFiles,
    getFileCount,
    getTotalSize,
    getFormattedTotalSize
  };
}; 