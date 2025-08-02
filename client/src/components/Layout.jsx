import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsentBanner from '@/components/CookieConsentBanner'; 
import { Toaster } from "@/components/ui/toaster";
import { HelmetProvider } from 'react-helmet-async';


const Layout = ({ children }) => {
  return (
    <HelmetProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
        <CookieConsentBanner />
      </div>
    </HelmetProvider>
  );
};

export default React.memo(Layout);