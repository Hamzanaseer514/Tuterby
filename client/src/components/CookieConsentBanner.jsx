import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Error accessing local storage for cookie consent:", error);
      
    }
  }, []);

  const handleAccept = useCallback(() => {
    try {
      localStorage.setItem('cookieConsent', 'accepted');
    } catch (error) {
      console.error("Error setting cookie consent (accept) in local storage:", error);
    }
    setIsVisible(false);
  }, []);

  const handleDecline = useCallback(() => {
    try {
      localStorage.setItem('cookieConsent', 'declined');
    } catch (error) {
      console.error("Error setting cookie consent (decline) in local storage:", error);
    }
    setIsVisible(false);
    
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg p-4 z-50"
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-sm">
              <Cookie className="w-6 h-6 mr-3 text-primary flex-shrink-0" aria-hidden="true" />
              <div>
                <h2 id="cookie-consent-title" className="sr-only">Cookie Consent</h2>
                <p id="cookie-consent-description" className="text-muted-foreground">
                  We use cookies and local storage to enhance your experience and remember your preferences (like partially filled forms). By continuing to use this site, you agree to our use of these essential functional cookies. See our <Link to="/privacy-policy#cookies" className="underline hover:text-primary">Privacy Policy</Link> for more details.
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button onClick={handleAccept} size="sm">Accept</Button>
              <Button onClick={handleDecline} variant="outline" size="sm">Decline</Button>
            </div>
            <Button onClick={handleClose} variant="ghost" size="icon" className="absolute top-2 right-2 md:hidden" aria-label="Close cookie consent banner">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(CookieConsentBanner);