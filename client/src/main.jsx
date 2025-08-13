import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/hooks/useAuth';
import {SubjectProvider} from '@/hooks/useSubject'; // Import the SubjectProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SubjectProvider> {/* ✅ Wrap everything inside AuthProvider */}
        <AuthProvider> {/* ✅ Wrap everything inside AuthProvider */}
          <App />
          <Toaster />
        </AuthProvider>
        </SubjectProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
