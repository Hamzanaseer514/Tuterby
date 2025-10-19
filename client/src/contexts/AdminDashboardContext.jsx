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
        // console.error('Error parsing saved dashboard state:', error);
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

  const loadUsers = useCallback(async (userType, forceReload = false, showLoading = false) => {
    // IMMEDIATE LOADING - Load data instantly without loading spinner
    if (!forceReload && dashboardState.users[userType] && dashboardState.users[userType].length > 0) {
      // Data exists - no loading needed
      return;
    }

    // Set loading state for this tab
    setDashboardState(prev => ({
      ...prev,
      tabLoading: { ...prev.tabLoading, [userType]: true }
    }));

    // Load data silently in background
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
      // console.error('Failed to load users:', error);
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
      // console.error('Failed to load dashboard data:', error);
      setDashboardState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  const refreshUserData = useCallback(async (userType) => {
    // SMART REFRESH - Only refresh when user is actually added/modified
    // Check if we have recent data (less than 2 minutes old)
    const lastUpdated = dashboardState.lastUpdated;
    const isRecent = lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) < 2 * 60 * 1000;
    
    // Only refresh if no data exists or data is not recent
    if (!dashboardState.users[userType] || dashboardState.users[userType].length === 0 || !isRecent) {
      await loadUsers(userType, true, false); // No loading spinner
    }
    // If data exists and is recent, do nothing
  }, [loadUsers, dashboardState.users, dashboardState.lastUpdated]);

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

  // Handle user addition - only load when user is actually added
  const handleUserAdded = useCallback(async (userType) => {
    // Force refresh when user is added
    await loadUsers(userType, true, true); // Show loading for user addition
  }, [loadUsers]);

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
    handleUserAdded,
    clearCache
  };

  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
};
