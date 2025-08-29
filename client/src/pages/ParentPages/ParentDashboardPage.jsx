import React, { useState } from 'react';
import ParentDashboardLayout from '../../components/parent/ParentDashboardLayout';
import OverviewPage from '../../components/parent/pages/OverviewPage';
import ChildrenPage from '../../components/parent/pages/ChildrenPage';
import SessionsPage from '../../components/parent/pages/SessionsPage';
import ParentProfilePage from '../../components/parent/pages/ParentProfilePage';

const ParentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage onTabChange={setActiveTab} />;
      case 'children':
        return <ChildrenPage />;
      case 'sessions':
        return <SessionsPage />;
      case 'profile':
        return <ParentProfilePage />;
      case 'payments':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Payments Page
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coming soon! This page will show payment history and billing.
            </p>
          </div>
        );
      case 'progress':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Progress Page
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coming soon! This page will show academic progress tracking.
            </p>
          </div>
        );
      case 'messages':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Messages Page
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coming soon! This page will show communication with tutors.
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Settings Page
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coming soon! This page will show account settings and preferences.
            </p>
          </div>
        );
      default:
        return <OverviewPage onTabChange={setActiveTab} />;
    }
  };

  return (
    <ParentDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </ParentDashboardLayout>
  );
};

export default ParentDashboardPage;
