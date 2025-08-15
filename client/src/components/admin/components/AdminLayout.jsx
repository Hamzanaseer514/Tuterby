import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon as MenuIcon,
  AcademicCapIcon,
  UserIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
// import { Dashboard as DashboardIcon } from '@mui/icons-material';

const AdminLayout = ({ children, tabValue = 'tutors', userCounts = { tutors: 0, students: 0, parents: 0 }, onTabChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(true); // For desktop sidebar toggle
  const navigate = useNavigate();

  const handleTabChange = (newTabValue) => {
  // Update the active tab state
  if (onTabChange) {
    onTabChange({}, newTabValue);
  }
  
  // Navigation logic
  if (newTabValue === 'dashboard') {
    navigate('/admin');
  } else if (newTabValue === 'tutors' || newTabValue === 'students' || newTabValue === 'parents') {
    navigate('/admin/users');
  } else if (newTabValue === 'chat') {
    navigate('/admin/chats');
  }
  
  setMobileOpen(false);
};

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const navItems = [
    { 
      section: 'Main',
      items: [
        { 
          id: 'dashboard', 
          icon: <ChartBarIcon className="h-5 w-5" />, 
          label: 'Dashboard', 
          count: null 
        }
      ]
    },
    { 
      section: 'User Management',
      items: [
        { 
          id: 'tutors', 
          icon: <UserGroupIcon className="h-5 w-5" />, 
          label: 'Tutors', 
          count: userCounts.tutors 
        },
        { 
          id: 'students', 
          icon: <AcademicCapIcon className="h-5 w-5" />, 
          label: 'Students', 
          count: userCounts.students 
        },
        { 
          id: 'parents', 
          icon: <UserIcon className="h-5 w-5" />, 
          label: 'Parents', 
          count: userCounts.parents 
        }
      ]
    },
    { 
      section: 'Communication',
      items: [
        { 
          id: 'chat', 
          icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, 
          label: 'Messages', 
          count: userCounts.chat 
        }
      ]
    }
  ];

  const renderNavItem = (item) => (
    <button
      key={item.id}
      onClick={() => handleTabChange(item.id)}
      className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors ${
        tabValue === item.id
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className={`mr-3 ${tabValue === item.id ? 'text-blue-500' : 'text-gray-500'}`}>
        {item.icon}
      </span>
      {expanded && (
        <>
          <span className="flex-1 text-left">{item.label}</span>
          {item.count > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {item.count}
            </span>
          )}
        </>
      )}
    </button>
  );

  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        {expanded ? (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-800">TutorLink</span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
        )}
        {expanded && (
          <button 
            onClick={() => setExpanded(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map((group) => (
          <div key={group.section} className="mb-6">
            {expanded && (
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.section}
              </h3>
            )}
            <div className="space-y-1 px-2">
              {group.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t px-2 py-4">
        <button 
          onClick={() => navigate('/admin/settings')}
          className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors ${
            tabValue === 'settings'
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Cog6ToothIcon className={`h-5 w-5 mr-3 ${tabValue === 'settings' ? 'text-blue-500' : 'text-gray-500'}`} />
          {expanded && <span>Settings</span>}
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600/75" onClick={() => setMobileOpen(false)}></div>
        <div className="relative flex flex-col w-72 bg-white h-full shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-800">TutorLink Admin</span>
            </div>
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            {navItems.map((group) => (
              <div key={group.section} className="mb-6">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.section}
                </h3>
                <div className="space-y-1 px-2">
                  {group.items.map(renderNavItem)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-2 py-4">
            <button 
              onClick={() => navigate('/admin/settings')}
              className="flex items-center w-full px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-500" />
              <span>Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 ${expanded ? 'w-64' : 'w-20'}`}>
        <div className="h-full flex flex-col">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button 
                className="md:hidden text-gray-500 hover:text-gray-600 mr-2"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              {!expanded && (
                <button 
                  onClick={() => setExpanded(true)}
                  className="hidden md:block text-gray-500 hover:text-gray-600 mr-2"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              )}
              <h1 className="text-lg font-bold text-gray-800">
                {tabValue === 'dashboard' ? 'Dashboard' : 
                 `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Management`}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                  <UserCircleIcon className="h-5 w-5" />
                </div>
                {expanded && <span className="text-sm font-medium">Admin</span>}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;