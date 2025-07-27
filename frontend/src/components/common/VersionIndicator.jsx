import { formatVersion } from '../../utils/formatters.js';

export const VersionIndicator = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      fontSize: '14px', 
      color: '#666', 
      fontFamily: 'monospace',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '4px 8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      zIndex: 1000
    }}>
      version: {formatVersion(import.meta.env.VITE_APP_VERSION)}
    </div>
  );
}; 