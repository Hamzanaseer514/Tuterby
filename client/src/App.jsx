import React, { Suspense, lazy } from 'react';
    import { Routes, Route, useLocation } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import { ScrollToTop } from '@/components/ScrollToTop';
    import { Toaster } from '@/components/ui/toaster';
    import { AnimatePresence } from 'framer-motion';
    
    const HomePage = lazy(() => import('@/pages/HomePage'));
    const SubjectsPage = lazy(() => import('@/pages/SubjectsPage'));
    const PricingPage = lazy(() => import('@/pages/PricingPage'));
    const BlogsPage = lazy(() => import('@/pages/BlogsPage'));
    const BlogDetail = lazy(() => import('@/pages/BlogDetail'));
    const ContactPage = lazy(() => import('@/pages/ContactPage'));
    const TermsAndConditionsPage = lazy(() => import('@/pages/TermsAndConditionsPage'));
    const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
    const PremiumServicePage = lazy(() => import('@/pages/PremiumServicePage'));
    const ChatbotWidget = lazy(() => import('@/components/ChatbotWidget'));

    const Register = lazy(() => import('./components/account/register'));
    const AdminDashboard = lazy(() => import('./components/admin/admin'))
    const LoginForm = lazy(() => import('./components/account/LoginForm.jsx'));


    const PageLoader = () => (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

    function App() {
      const location = useLocation();
      return (
        <>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/subjects" element={<SubjectsPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/blog" element={<BlogsPage />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/premium-programme" element={<PremiumServicePage />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<AdminDashboard/>}/> 
                  <Route path="/login" element={<LoginForm />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </Layout>
          <Toaster />
          <Suspense fallback={null}>
            <ChatbotWidget />
          </Suspense>
        </>
      );
    }

    export default App;