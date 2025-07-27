import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleSignIn } from '../components/auth/GoogleSignIn.jsx';
import { VersionIndicator } from '../components/common/VersionIndicator.jsx';
import { APP_NAME } from '../utils/constants.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  
  // Check if already logged in
  useEffect(() => {
    const user = window.localStorage.getItem('rf_user');
    if (user) navigate('/upload');
  }, [navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <h1 style={{ 
        color: '#200048', 
        fontWeight: 800, 
        fontSize: '3rem', 
        marginBottom: '3rem', 
        letterSpacing: '0.03em' 
      }}>
        🚀 {APP_NAME} 🚀
      </h1>
      
      <GoogleSignIn />
      <VersionIndicator />
    </div>
  );
}; 