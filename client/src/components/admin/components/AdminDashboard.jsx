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



const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // State management with localStorage persistence
  const [dashboardState, setDashboardState] = useState(() => {
    // Try to load from localStorage first
    const savedState = localStorage.getItem('adminDashboardState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Check if data is not too old (less than 5 minutes)
        if (parsed.lastUpdated && (Date.now() - new Date(parsed.lastUpdated).getTime()) < 5 * 60 * 1000) {
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
      error: null,
      lastUpdated: null
    };
  });

  const [uiState, setUiState] = useState({
    page: 0,
    rowsPerPage: 10,
    searchTerm: '',
    tabValue: 'tutors',
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

  // Initialize tab from query param or navigation state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const valid = ['tutors', 'students', 'parents'];
    
    // Check if coming back from detail page with preserved data
    const preserveData = location.state?.preserveData;
    const navTabValue = location.state?.tabValue;
    
    if (preserveData && navTabValue && valid.includes(navTabValue)) {
      // Coming back from detail page - switch tab and ensure data exists
      setUiState(prev => ({ ...prev, tabValue: navTabValue }));
      
      // Check if data exists for this tab, if not load it
      if (!dashboardState.users[navTabValue] || dashboardState.users[navTabValue].length === 0) {
        loadUsers(navTabValue);
      }
      return;
    }
    
    if (tab && valid.includes(tab)) {
      setUiState(prev => ({ ...prev, tabValue: tab }));
      // Only load if data doesn't exist for this tab
      if (!dashboardState.users[tab] || dashboardState.users[tab].length === 0) {
        loadUsers(tab);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.state]);

  // Load initial data only once
  useEffect(() => {
    // Don't load if coming back from detail page with preserved data
    const preserveData = location.state?.preserveData;
    if (preserveData) {
      return;
    }
    
    // Only load if no data exists
    if (!dashboardState.stats || Object.keys(dashboardState.stats).length === 0) {
      loadDashboardData();
    }
  }, [location.state]); // Add location.state as dependency

  const loadDashboardData = async () => {
    updateDashboardState({ loading: true, error: null });
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!token) {
        showNotification('Please login to access admin dashboard', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const [statsData, usersData] = await Promise.all([
        getDashboardStats(),
        getAllUsers({ userType: uiState.tabValue || 'tutors' })
      ]);

      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        users: { ...prev.users, [uiState.tabValue || 'tutors']: usersData },
        loading: false,
        lastUpdated: new Date()
      }));

      showNotification('Data loaded successfully');
    } catch (error) {
      // console.error('Failed to load dashboard data:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        showNotification('Access denied. Please login with admin credentials.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        showNotification('Failed to load real data.', 'warning');
        // Load mock data as fallback
        const [statsData, usersData] = await Promise.all([
          getDashboardStats(),
          getAllUsers({ userType: uiState.tabValue || 'tutors' })
        ]);
        setDashboardState(prev => ({
          ...prev,
          stats: statsData,
          users: { ...prev.users, [uiState.tabValue || 'tutors']: usersData },
          loading: false,
          lastUpdated: new Date()
        }));
      }
    }
  };

  const loadUsers = async (userType, forceReload = false) => {
    // Don't reload if data already exists and not forced
    if (!forceReload && dashboardState.users[userType] && dashboardState.users[userType].length > 0) {
      return;
    }

    updateDashboardState({ loading: true });
    
    try {
      const usersData = await getAllUsers({ userType });
      setDashboardState(prev => ({
        ...prev,
        users: { ...prev.users, [userType]: usersData },
        loading: false,
        lastUpdated: new Date()
      }));

      if (usersData.length === 0) {
        showNotification(`No ${userType} found in the database.`, 'info');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        showNotification('Access denied. Please login with admin credentials.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        // showNotification(`Failed to load ${userType}: ${error.message}`, 'error');
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
    console.log("AdminDashboard - handleViewUser called with user:", user);
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
    console.log("user",user)
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
    <AdminLayout 
      tabValue={uiState.tabValue}
      userCounts={{
        tutors: (dashboardState.users.tutors || []).length,
        students: (dashboardState.users.students || []).length,
        parents: (dashboardState.users.parents || []).length
      }}
      onTabChange={handleTabChange}
    >
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
                loading={dashboardState.loading}
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
    </AdminLayout>
  );
};

export default AdminDashboard;