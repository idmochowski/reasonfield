import { useEffect } from 'react';

export const StatusMessage = ({ message, type = 'info', autoDismiss = true, dismissTime = 3000 }) => {
  useEffect(() => {
    if (autoDismiss && message) {
      const timer = setTimeout(() => {
        // This would need to be handled by parent component
        // For now, we'll just log that it should be dismissed
    
      }, dismissTime);
      
      return () => clearTimeout(timer);
    }
  }, [message, autoDismiss, dismissTime]);

  if (!message) return null;

  const getMessageStyle = () => {
    const baseStyle = {
      marginBottom: '1rem',
      fontWeight: 500,
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          color: '#2e7d32',
          backgroundColor: '#f1f8e9',
          borderColor: '#c8e6c9'
        };
      case 'error':
        return {
          ...baseStyle,
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          borderColor: '#ffcdd2'
        };
      case 'warning':
        return {
          ...baseStyle,
          color: '#ed6c02',
          backgroundColor: '#fff3e0',
          borderColor: '#ffcc02'
        };
      default:
        return {
          ...baseStyle,
          color: '#0288d1',
          backgroundColor: '#e3f2fd',
          borderColor: '#bbdefb'
        };
    }
  };

  return (
    <div style={getMessageStyle()}>
      {message}
    </div>
  );
}; 