import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Google credential response handler
window.handleCredentialResponse = async (response) => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    
    // Store user info in localStorage using the new service
    const fullUserData = { ...data, token: response.credential };
    window.localStorage.setItem('rf_user', JSON.stringify(fullUserData));
    
    // Use React Router navigation instead of window.location
    // This will be handled by the LoginPage component
    window.location.href = '/upload';
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
