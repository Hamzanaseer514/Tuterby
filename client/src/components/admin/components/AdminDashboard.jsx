import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  Refresh,
  Download,
  Upload
} from '@mui/icons-material';
import AdminLayout from './AdminLayout';

// Import admin service
import {
  getDashboardStats,
  getAllUsers,
} from '../../../services/adminService';

// Import custom components
import UserTable from './UserTable';
import SearchAndFilterBar from './SearchAndFilterBar';
import LoadingOverlay from './LoadingOverlay';
import NotificationSnackbar from './NotificationSnackbar';

// Constants
const statusColors = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
  unverified: 'default',
  active: 'success',
  inactive: 'default'
};



const AdminDashboard = ({ tabValue = 'tutors' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // State management with localStorage persistence
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
      error: null,
      lastUpdated: null
    };
  });

  const [uiState, setUiState] = useState({
    page: 0,
    rowsPerPage: 10,
    searchTerm: '',
    tabValue: tabValue,
    anchorEl: null,
    selectedActionUser: null,
    openDialog: false,
    selectedUser: null,
    showRejectionDialog: false,
    showInterviewResultDialog: false,
    showPreferredTimesDialog: false,
    snackbar: { open: false, message: '', severity: 'success' },
    filters: {},
    viewMode: 'table'
  });

  const [formState, setFormState] = useState({
    newInterviewDate: '',
    newInterviewTime: '',
    rejectionReason: '',
    interviewResult: { result: 'Passed', notes: '' },
    selectedSlot: null,
    availableSlots: [],
    preferredTimes: []
  });

  // Custom hooks for better state management
  const updateDashboardState = (updates) => {
    setDashboardState(prev => ({ ...prev, ...updates }));
  };

  const updateUiState = (updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };

  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Save state to localStorage whenever dashboardState changes
  useEffect(() => {
    if (dashboardState.lastUpdated) {
      localStorage.setItem('adminDashboardState', JSON.stringify(dashboardState));
    }
  }, [dashboardState]);

  const showNotification = (message, severity = 'success') => {
    updateUiState({
      snackbar: { open: true, message, severity }
    });
  };

  // Update tab when prop changes or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTab = params.get('tab');
    const validTabs = ['tutors', 'students', 'parents'];
    
    // Use URL tab if it's valid, otherwise use prop
    const targetTab = urlTab && validTabs.includes(urlTab) ? urlTab : tabValue;
    
    if (targetTab !== uiState.tabValue) {
      setUiState(prev => ({ ...prev, tabValue: targetTab }));
      // Load data for the new tab if it doesn't exist
      if (!dashboardState.users[targetTab] || dashboardState.users[targetTab].length === 0) {
        loadUsers(targetTab);
      }
    }
  }, [tabValue, uiState.tabValue, dashboardState.users, location.search]);

  // Load initial data only once
  useEffect(() => {
    // Only load if no data exists
    if (!dashboardState.stats || Object.keys(dashboardState.stats).length === 0) {
      loadDashboardData();
    }
    loadUsers(tabValue);
  }, []);

  const loadDashboardData = async () => {
    // Don't show loading state - load silently in background
    updateDashboardState({ error: null });
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!token) {
        showNotification('Please login to access admin dashboard', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      // Load stats and users in parallel with pagination
      const [statsData, usersResponse] = await Promise.all([
        getDashboardStats(),
        getAllUsers({ 
          userType: uiState.tabValue || 'tutors',
          page: 1,
          limit: 50 // Load more users for better performance
        })
      ]);

      // Handle both old and new response formats
      const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse.users || [];

      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        users: { ...prev.users, [uiState.tabValue || 'tutors']: usersData },
        loading: false,
        lastUpdated: new Date()
      }));

      // Don't show success notification for background loading
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        showNotification('Access denied. Please login with admin credentials.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        // Don't show error notification for background loading
        updateDashboardState({
          loading: false,
          error: error.message
        });
      }
    }
  };

  const loadUsers = async (userType, forceReload = false) => {
    // Don't reload if data already exists and not forced
    if (!forceReload && dashboardState.users[userType] && dashboardState.users[userType].length > 0) {
      return;
    }

    // Don't show loading state - load silently in background
    
    try {
      const usersResponse = await getAllUsers({ 
        userType,
        page: 1,
        limit: 50 // Load more users for better performance
      });
      
      // Handle both old and new response formats
      const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse.users || [];
      
      setDashboardState(prev => ({
        ...prev,
        users: { ...prev.users, [userType]: usersData },
        loading: false,
        lastUpdated: new Date()
      }));

      // Don't show notification for background loading
    } catch (error) {
      console.error('Failed to load users:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        showNotification('Access denied. Please login with admin credentials.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        // Don't show error notification for background loading
        updateDashboardState({
          users: { ...dashboardState.users, [userType]: [] },
          loading: false
        });
      }
    }
  };

  const handleRequestReload = () => {
    // Clear localStorage cache when manually refreshing
    localStorage.removeItem('adminDashboardState');
    loadUsers(uiState.tabValue, true); // Force reload
  };

  // Event handlers
  const handleChangePage = (event, newPage) => {
    updateUiState({ page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    updateUiState({
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    });
  };

  const handleSearch = (event) => {
    updateUiState({
      searchTerm: event.target.value,
      page: 0
    });
  };

  const handleClearSearch = () => {
    updateUiState({
      searchTerm: '',
      page: 0
    });
  };

  const handleViewUser = async (user) => {
    // console.log("AdminDashboard - handleViewUser called with user:", user);
  };


  const handleTabChange = (event, newValue) => {
    updateUiState({
      tabValue: newValue,
      page: 0
    });
    // Only load if data doesn't exist for this tab
    if (!dashboardState.users[newValue] || dashboardState.users[newValue].length === 0) {
      loadUsers(newValue || 'tutors');
    }
  };

  const handleMenuClick = (event, user) => {
    updateUiState({
      anchorEl: event.currentTarget,
      selectedActionUser: user
    });
  };

  const handleFilterChange = (newFilters) => {
    updateUiState({ filters: newFilters });
  };

  const handleViewModeChange = (mode) => {
    updateUiState({ viewMode: mode });
  };

  const handleImport = () => {
    showNotification('Import functionality coming soon', 'info');
  };
  const filteredUsers = dashboardState.users[uiState.tabValue || 'tutors']?.filter(user => {
    const search = uiState.searchTerm.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search)) ||
      (user.subjects &&
        user.subjects.some(subject =>
          subject.name && subject.name.toLowerCase().includes(search)
        ));
  
    return matchesSearch;
  }) || [];
  

  return (
    // <AdminLayout
    //   tabValue={uiState.tabValue}
    //   userCounts={{
    //     tutors: (dashboardState.users.tutors || []).length,
    //     students: (dashboardState.users.students || []).length,
    //     parents: (dashboardState.users.parents || []).length
    //   }}
    //   onTabChange={handleTabChange}
    // >
      <Box sx={{ p: 3 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    User Management - {(uiState.tabValue || 'tutors').charAt(0).toUpperCase() + (uiState.tabValue || 'tutors').slice(1)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Zoom in timeout={400}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box
                        component="button"
                        onClick={handleRequestReload}
                        disabled={dashboardState.loading}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.75,
                          py: 1.25,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'background.default',
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            opacity: 0.6,
                            cursor: 'not-allowed'
                          }
                        }}
                      >
                        <Refresh sx={{ fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          Refresh
                        </Typography>
                      </Box>
                 
                    </Box>
                  </Zoom>
                </Box>
              </Box>
              
              <Typography variant="body1" color="text.secondary">
                Manage {uiState.tabValue || 'tutors'}, verify documents, and handle user accounts.
              </Typography>
            </Box>



            {/* Main Content */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              {/* Search and Filter Bar */}
              <SearchAndFilterBar
                tabValue={uiState.tabValue}
                searchTerm={uiState.searchTerm}
                filters={uiState.filters}
                viewMode={uiState.viewMode}
                onSearch={handleSearch}
                onClearSearch={handleClearSearch}
                onFilterChange={handleFilterChange}
                onViewModeChange={handleViewModeChange}

                onImport={handleImport}
                onRefresh={loadDashboardData}
              />

              {/* User Table */}
              <UserTable
                users={filteredUsers}
                tabValue={uiState.tabValue}
                page={uiState.page}
                rowsPerPage={uiState.rowsPerPage}
                statusColors={statusColors}
                onViewUser={handleViewUser}
                onMenuClick={handleMenuClick}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                onRequestReload={handleRequestReload}
                showNotification={showNotification}
              />
            </Paper>

            {/* Loading Overlay */}
            {/* <LoadingOverlay 
              loading={dashboardState.loading} 
              message="Processing request..."
              type="refresh"
            /> */}

            {/* Notification Snackbar */}
            <NotificationSnackbar
              open={uiState.snackbar.open}
              message={uiState.snackbar.message}
              severity={uiState.snackbar.severity}
              onClose={() => updateUiState({ snackbar: { ...uiState.snackbar, open: false } })}
            />
          </Box>
        </Fade>
      </Box>
    // </AdminLayout>
  );
};

export default AdminDashboard;