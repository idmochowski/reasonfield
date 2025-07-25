import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Debug app startup
console.log('=== APP STARTING ===');
console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
alert('App is loading! Check console for debug info.');

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
    // Store user info in localStorage
    window.localStorage.setItem('rf_user', JSON.stringify({ ...data, token: response.credential }));
    // Redirect to upload page
    window.location = '/upload';
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
