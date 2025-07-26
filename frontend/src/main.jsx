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
    // Store user info in localStorage
    window.localStorage.setItem('rf_user', JSON.stringify({ ...data, token: response.credential }));
    // Redirect to upload page
    window.location = '/upload';
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
};

// Handle OAuth redirect (fallback for FedCM issues)
window.handleOAuthRedirect = async (accessToken) => {
  try {
    // Exchange access token for user info
    const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    const userInfo = await userInfoResponse.json();
    
    // Create a mock credential response
    const mockResponse = {
      credential: accessToken,
      user: userInfo
    };
    
    // Use the same handler
    window.handleCredentialResponse(mockResponse);
  } catch (err) {
    alert('OAuth login failed: ' + err.message);
  }
};

// Check for OAuth redirect on page load
if (window.location.hash.includes('access_token=')) {
  const accessToken = window.location.hash.split('access_token=')[1].split('&')[0];
  window.handleOAuthRedirect(accessToken);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
