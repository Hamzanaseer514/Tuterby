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

// Import context
import { useAdminDashboard } from '../../../contexts/AdminDashboardContext';

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
  
  // Use context for state management
  const { 
    dashboardState, 
    loadUsers, 
    loadDashboardData, 
    refreshUserData,
    clearCache 
  } = useAdminDashboard();

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
  const updateUiState = (updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };

  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const showNotification = (message, severity = 'success') => {
    updateUiState({
      snackbar: { open: true, message, severity }
    });
  };

  // Update tab when prop changes or URL changes - IMMEDIATE DATA LOAD
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTab = params.get('tab');
    const validTabs = ['tutors', 'students', 'parents'];
    
    // Use URL tab if it's valid, otherwise use prop
    const targetTab = urlTab && validTabs.includes(urlTab) ? urlTab : tabValue;
    
    if (targetTab !== uiState.tabValue) {
      setUiState(prev => ({ ...prev, tabValue: targetTab }));
      // Load data immediately when tab changes
      loadUsers(targetTab, false, false);
    }
  }, [tabValue, uiState.tabValue, location.search, loadUsers]);

  // Load initial data - IMMEDIATE LOADING
  useEffect(() => {
    // Load dashboard stats if empty
    if (!dashboardState.stats || Object.keys(dashboardState.stats).length === 0) {
      loadDashboardData();
    }
    // Load users for current tab immediately
    loadUsers(tabValue, false, false);
  }, [loadDashboardData, loadUsers, tabValue]);

  // Check for auth token and handle authentication
  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      showNotification('Please login to access admin dashboard', 'error');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, []);

  const handleRequestReload = () => {
    // Manual reload - only when user explicitly requests it
    loadUsers(uiState.tabValue, true, true);
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
    // Always load data for the new tab to show loading state
    loadUsers(newValue || 'tutors');
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
      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ mb: { xs: 2, sm: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between', 
                mb: 2,
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <DashboardIcon sx={{ 
                    mr: { xs: 1, sm: 2 }, 
                    color: 'primary.main', 
                    fontSize: { xs: 32, sm: 40 },
                    flexShrink: 0
                  }} />
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color="primary"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2.125rem' },
                      wordBreak: 'break-word'
                    }}
                  >
                    User Management - {(uiState.tabValue || 'tutors').charAt(0).toUpperCase() + (uiState.tabValue || 'tutors').slice(1)}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                }}>
                  <Zoom in timeout={400}>
                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                      <Box
                        component="button"
                        onClick={handleRequestReload}
                        disabled={dashboardState.loading}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: { xs: 1.5, sm: 1.75 },
                          py: { xs: 1, sm: 1.25 },
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          width: { xs: '100%', sm: 'auto' },
                          justifyContent: { xs: 'center', sm: 'flex-start' },
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
                        <Refresh sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        <Typography variant="body2" fontWeight="medium" sx={{ display: { xs: 'block', sm: 'block' } }}>
                          Refresh
                        </Typography>
                      </Box>
                 
                    </Box>
                  </Zoom>
                </Box>
              </Box>
              
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Manage {uiState.tabValue || 'tutors'}, verify documents, and handle user accounts.
              </Typography>
            </Box>



            {/* Main Content */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                width: '100%',
                overflow: 'hidden'
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
                onRefresh={handleRequestReload}
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
                loading={dashboardState.tabLoading[uiState.tabValue] || dashboardState.loading}
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