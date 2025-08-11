
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
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import AdminSettings from "../../../pages/AdminPages/AdminSettings"

const AdminLayout = ({ children, tabValue = 'tutors', userCounts = { tutors: 0, students: 0, parents: 0 }, onTabChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();


  const handleTabChange = (newTabValue) => {
    if (newTabValue === 'dashboard') {
      navigate('/admin');
    } else if (newTabValue === 'tutors' || newTabValue === 'students' || newTabValue === 'parents') {
      navigate('/admin/users');
      if (onTabChange) {
        onTabChange({}, newTabValue);
      }
    }
    if (mobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const navItems = [
    { 
      id: 'dashboard', 
      icon: <DashboardIcon className="h-5 w-5" />, 
      label: 'Dashboard', 
      count: null 
    },
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
    },
  ];


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileOpen(false)}></div>
        <div className="relative flex flex-col w-64 bg-white h-full">
          <div className="flex items-center justify-center h-16 p-4 border-b">
            <span className="text-xl font-bold text-blue-600">TutorLink Admin</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center w-full px-4 py-2 text-sm rounded-md mb-1 ${
                    tabValue === item.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-3 ${tabValue === item.id ? 'text-blue-500' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.count > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="border-t px-2 py-4">
              <button onClick={() => navigate('/admin/settings')} className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 mb-1">
                <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-500" />
                <span className="font-medium">Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r bg-white">
          <div className="flex items-center justify-center h-16 p-4 border-b">
            <span className="text-xl font-bold text-blue-600">TutorLink Admin</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center w-full px-4 py-2 text-sm rounded-md mb-1 ${
                    tabValue === item.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-3 ${tabValue === item.id ? 'text-blue-500' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.count > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="border-t px-2 py-4">
              <button onClick={() => navigate('/admin/settings')} className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 mb-1">
                <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-500" />
                <span className="font-medium">Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      {/* Main content area - modified for full width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 w-full">
          <div className="flex items-center justify-between h-16 px-4 w-full">
            <button 
              className="md:hidden text-gray-500 focus:outline-none"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {tabValue === 'dashboard' ? 'Dashboard' : `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Management`}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="relative text-gray-500 hover:text-gray-700">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  4
                </span>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <UserCircleIcon className="h-7 w-7" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
