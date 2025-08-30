import React, { useState } from 'react';
import ParentDashboardLayout from '../../components/parent/ParentDashboardLayout';
import OverviewPage from '../../components/parent/pages/OverviewPage';
import ChildrenPage from '../../components/parent/pages/ChildrenPage';
import SessionsPage from '../../components/parent/pages/SessionsPage';
import ParentProfilePage from '../../components/parent/pages/ParentProfilePage';
import ParentPaymentPage from '../../components/parent/pages/ParentPaymentPage';
import { useLocation, Routes, Route } from 'react-router-dom';
import ChildViewPage from '../../components/parent/pages/ChildViewPage';

const ParentDashboardPage = () => {
  const location = useLocation();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/children')) return 'children';
    if (path.includes('/sessions')) return 'sessions';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/progress')) return 'progress';
    if (path.includes('/messages')) return 'messages';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  const activeTab = getActiveTab();

  return (
    <ParentDashboardLayout activeTab={activeTab}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/children" element={<ChildrenPage />} />
        <Route path="/children/:childSlug" element={<ChildViewPage />} />
        <Route path="/children/:childSlug/edit" element={<ChildViewPage initialEditMode={true} />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/profile" element={<ParentProfilePage />} />
        <Route path="/payments" element={<ParentPaymentPage />} />
        <Route path="/progress" element={
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Progress Page
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coming soon! This page will show academic progress tracking.
            </p>
          </div>
        } />
        <Route path="/messages" element={
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Messages Page
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coming soon! This page will show communication with tutors.
            </p>
          </div>
        } />
        <Route path="/settings" element={
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Settings Page
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coming soon! This page will show account settings and preferences.
            </p>
          </div>
        } />
      </Routes>
    </ParentDashboardLayout>
  );
};

export default ParentDashboardPage;
