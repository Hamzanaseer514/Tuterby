import React, { useState, useEffect } from 'react';
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
  // State management
  const [dashboardState, setDashboardState] = useState({
    users: { tutors: [], students: [], parents: [] },
    stats: {},
    loading: false,
    error: null
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

  const showNotification = (message, severity = 'success') => {
    updateUiState({
      snackbar: { open: true, message, severity }
    });
  };

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

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
        loading: false
      }));

      showNotification('Data loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
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
          loading: false
        }));
      }
    }
  };

  const loadUsers = async (userType) => {
    updateDashboardState({ loading: true });
    
    try {
      const usersData = await getAllUsers({ userType });
      setDashboardState(prev => ({
        ...prev,
        users: { ...prev.users, [userType]: usersData },
        loading: false
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
        showNotification(`Failed to load ${userType}: ${error.message}`, 'error');
        updateDashboardState({
          users: { ...dashboardState.users, [userType]: [] },
          loading: false
        });
      }
    }
  };

  const handleRequestReload = () => {
    loadUsers(uiState.tabValue);
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

  const handleExport = () => {
    showNotification('Export functionality coming soon', 'info');
  };

  const handleImport = () => {
    showNotification('Import functionality coming soon', 'info');
  };

  const filteredUsers = dashboardState.users[uiState.tabValue || 'tutors']?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
      (user.subjects && user.subjects.some(subject => subject.toLowerCase().includes(uiState.searchTerm.toLowerCase())));
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
                        onClick={loadDashboardData}
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
                      
                      <Box
                        component="button"
                        onClick={handleExport}
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
                          }
                        }}
                      >
                        <Download sx={{ fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          Export
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
                onExport={handleExport}
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
            <LoadingOverlay 
              loading={dashboardState.loading} 
              message="Processing request..."
              type="refresh"
            />

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