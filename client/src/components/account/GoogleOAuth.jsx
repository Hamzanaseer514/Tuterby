import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BASE_URL, GOOGLE_CLIENT_ID } from '@/config';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

const GoogleOAuth = ({ role = "student", mode = "register" }) => {
  const navigate = useNavigate();
  const { login, clearAllAuthData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: mode === 'login' ? 'signin_with' : 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%',
          }
        );
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [mode]);

  const handleCredentialResponse = async (response) => {
    try {
      setIsLoading(true);
      const { credential } = response;
      
      // Determine the endpoint based on mode
      const endpoint = mode === 'login' ? '/api/auth/login-google' : '/api/auth/register-google';
      
      
      // Send the ID token to your backend
      const apiResponse = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: credential,
          role: role
        }),
        credentials: 'include'
      });

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        // Store the auth token and user data using existing structure
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Use the auth context to properly login (for both registration and login)
        login(data.user, data.accessToken, false);
        
        toast.success(data.message || `${mode === 'login' ? 'Login' : 'Registration'} successful!`);
        
        // For both registration and login, redirect based on user role
        if (data.user.role === 'student') {
          navigate('/student-dashboard');
        } else if (data.user.role === 'tutor') {
          navigate('/tutor-dashboard');
        } else if (data.user.role === 'parent') {
          navigate('/parent-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Handle specific error cases
        if (mode === 'register' && data.message?.includes('already registered')) {
          toast.error('Account already registered! Please login instead.');
          // Redirect to login page
          navigate('/login');
        } else {
          toast.error(data.message || `${mode === 'login' ? 'Login' : 'Registration'} failed`);
        }
      }
    } catch (error) {
      toast.error(`Google ${mode === 'login' ? 'login' : 'authentication'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or {mode === 'login' ? 'sign in' : 'continue'} with
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <div 
          id="google-signin-button" 
          className="w-full flex justify-center"
        />
      </div>
      
      {isLoading && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        </div>
      )}
      
      <p className="text-xs text-center text-muted-foreground mt-2">
        By {mode === 'login' ? 'signing in' : 'continuing'} with Google, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default GoogleOAuth;
