import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { BrowserRouter } from 'react-router-dom';
    import App from '@/App';
    import '@/index.css';
    import { Toaster } from '@/components/ui/toaster';
    import { HelmetProvider } from 'react-helmet-async';

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <HelmetProvider>
          <BrowserRouter>
            <App />
            <Toaster />
          </BrowserRouter>
        </HelmetProvider>
      </React.StrictMode>
    );