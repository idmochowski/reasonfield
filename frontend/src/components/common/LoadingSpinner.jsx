export const LoadingSpinner = ({ size = 40, color = '#200048', backgroundColor = '#e0d5f0' }) => {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      border: `4px solid ${backgroundColor}`,
      borderTop: `4px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }}></div>
  );
}; 