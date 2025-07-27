import { useEffect, useRef } from 'react';

export const GoogleSignIn = () => {
  const buttonRef = useRef(null);

  // Initialize Google Sign-In with programmatic rendering
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && buttonRef.current) {
        // Clear any existing state to prevent conflicts
                        try {
                  window.google.accounts.id.cancel();
                  window.google.accounts.id.disableAutoSelect();
                } catch (error) {
                  // Silent cleanup
                }

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: window.handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button programmatically
        try {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'sign_in_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });

        } catch (error) {
          console.error('Error rendering Google Sign-In button:', error);
          // Retry after a short delay
          setTimeout(initializeGoogleSignIn, 100);
        }
      } else {

        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    // Start initialization
    initializeGoogleSignIn();

    // Cleanup function
    return () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {

        }
      }
    };
  }, []);

  return (
    <div 
      ref={buttonRef}
      id="google-signin-button"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40px' // Ensure container has height even before button renders
      }}
    />
  );
}; 