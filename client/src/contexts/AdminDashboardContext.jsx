import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAllUsers, getDashboardStats } from '../services/adminService';

const AdminDashboardContext = createContext();

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error('useAdminDashboard must be used within an AdminDashboardProvider');
  }
  return context;
};

export const AdminDashboardProvider = ({ children }) => {
  const [dashboardState, setDashboardState] = useState(() => {
    // Try to load from localStorage first
    const savedState = localStorage.getItem('adminDashboardState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Check if data is not too old (less than 10 minutes)
        if (parsed.lastUpdated && (Date.now() - new Date(parsed.lastUpdated).getTime()) < 10 * 60 * 1000) {
          return parsed;
        }
      } catch (error) {
        console.error('Error parsing saved dashboard state:', error);
      }
    }
    
    // Default state if no saved data or data is too old
    return {
      users: { tutors: [], students: [], parents: [] },
      stats: {},
      loading: false,
      tabLoading: { tutors: false, students: false, parents: false },
      error: null,
      lastUpdated: null
    };
  });

  // Save state to localStorage whenever dashboardState changes
  React.useEffect(() => {
    if (dashboardState.lastUpdated) {
      localStorage.setItem('adminDashboardState', JSON.stringify(dashboardState));
    }
  }, [dashboardState]);

  const updateDashboardState = useCallback((updates) => {
    setDashboardState(prev => ({ ...prev, ...updates }));
  }, []);

  const loadUsers = useCallback(async (userType, forceReload = false, showLoading = true) => {
    // Don't reload if data already exists and not forced
    if (!forceReload && dashboardState.users[userType] && dashboardState.users[userType].length > 0) {
      // Still show loading briefly for better UX
      if (showLoading) {
        setDashboardState(prev => ({
          ...prev,
          tabLoading: { ...prev.tabLoading, [userType]: true }
        }));
        
        // Simulate a brief loading time (not too fast as requested)
        setTimeout(() => {
          setDashboardState(prev => ({
            ...prev,
            tabLoading: { ...prev.tabLoading, [userType]: false }
          }));
        }, 800); // 800ms loading time
      }
      return;
    }

    // Set tab-specific loading to true when starting to load
    setDashboardState(prev => ({
      ...prev,
      tabLoading: { ...prev.tabLoading, [userType]: true },
      error: null
    }));

    try {
      const usersResponse = await getAllUsers({ 
        userType,
        page: 1,
        limit: 50
      });
      
      // Handle both old and new response formats
      const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse.users || [];
      
      setDashboardState(prev => ({
        ...prev,
        users: { ...prev.users, [userType]: usersData },
        tabLoading: { ...prev.tabLoading, [userType]: false },
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Failed to load users:', error);
      setDashboardState(prev => ({
        ...prev,
        users: { ...prev.users, [userType]: [] },
        tabLoading: { ...prev.tabLoading, [userType]: false },
        error: error.message
      }));
    }
  }, [dashboardState.users]);

  const loadDashboardData = useCallback(async () => {
    setDashboardState(prev => ({ ...prev, error: null }));
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No auth token found');
      }

      // Load stats and users in parallel
      const [statsData, usersResponse] = await Promise.all([
        getDashboardStats(),
        getAllUsers({ 
          userType: 'tutors',
          page: 1,
          limit: 50
        })
      ]);

      // Handle both old and new response formats
      const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse.users || [];

      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        users: { ...prev.users, tutors: usersData },
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  const refreshUserData = useCallback(async (userType) => {
    // Force reload specific user type
    await loadUsers(userType, true);
  }, [loadUsers]);

  const updateUserInList = useCallback((userType, updatedUser) => {
    setDashboardState(prev => ({
      ...prev,
      users: {
        ...prev.users,
        [userType]: prev.users[userType].map(user => 
          (user.id || user.user_id || user._id) === (updatedUser.id || updatedUser.user_id || updatedUser._id)
            ? { ...user, ...updatedUser }
            : user
        )
      },
      lastUpdated: new Date()
    }));
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem('adminDashboardState');
    setDashboardState({
      users: { tutors: [], students: [], parents: [] },
      stats: {},
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, []);

  const value = {
    dashboardState,
    updateDashboardState,
    loadUsers,
    loadDashboardData,
    refreshUserData,
    updateUserInList,
    clearCache
  };

  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
};
