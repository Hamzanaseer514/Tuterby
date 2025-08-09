import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Refresh,
  Download,
  Upload
} from '@mui/icons-material';

// Import admin service
import {
  getDashboardStats,
  getAllUsers,
} from '../../../services/adminService';

// Import custom components
import DashboardStats from './DashboardStats';
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
        getDashboardStats().catch(() => getMockDashboardStats()),
        getAllUsers({ userType: uiState.tabValue }).catch(() => getMockUsers(uiState.tabValue))
      ]);

      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        users: { ...prev.users, [uiState.tabValue]: usersData },
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
        showNotification('Failed to load real data. Using mock data.', 'warning');
        // Load mock data as fallback
        const [statsData, usersData] = await Promise.all([
          getMockDashboardStats(),
          getMockUsers(uiState.tabValue)
        ]);
        setDashboardState(prev => ({
          ...prev,
          stats: statsData,
          users: { ...prev.users, [uiState.tabValue]: usersData },
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

  const handleCloseDialog = () => {
    updateUiState({
      openDialog: false,
      selectedUser: null
    });
  };

  const handleTabChange = (event, newValue) => {
    updateUiState({
      tabValue: newValue,
      page: 0
    });
    loadUsers(newValue);
  };

  const handleMenuClick = (event, user) => {
    updateUiState({
      anchorEl: event.currentTarget,
      selectedActionUser: user
    });
  };

  const handleMenuClose = () => {
    updateUiState({
      anchorEl: null,
      selectedActionUser: null
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

  const filteredUsers = dashboardState.users[uiState.tabValue]?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
      (user.subjects && user.subjects.some(subject => subject.toLowerCase().includes(uiState.searchTerm.toLowerCase())));
    return matchesSearch;
  }) || [];

  const getStatusCounts = () => {
    const counts = { tutors: {}, students: {}, parents: {} };

    dashboardState.users.tutors.forEach(tutor => {
      counts.tutors[tutor.status] = (counts.tutors[tutor.status] || 0) + 1;
    });

    dashboardState.users.students.forEach(student => {
      counts.students[student.status] = (counts.students[student.status] || 0) + 1;
    });

    dashboardState.users.parents.forEach(parent => {
      counts.parents[parent.status] = (counts.parents[parent.status] || 0) + 1;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Fade in timeout={800}>
      <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Dashboard sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                Admin Dashboard
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
                      p: 1.5,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
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
                      p: 1.5,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
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
            Manage tutors, students, and parents. Monitor applications, verify documents, and schedule interviews.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <DashboardStats 
          stats={dashboardState.stats}
          statusCounts={statusCounts}
          users={dashboardState.users}
          loading={dashboardState.loading}
        />

        {/* Main Content */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}
        >
          {/* Search and Filter Bar */}
          <SearchAndFilterBar
            tabValue={uiState.tabValue}
            searchTerm={uiState.searchTerm}
            filters={uiState.filters}
            viewMode={uiState.viewMode}
            onTabChange={handleTabChange}
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

        {/* User Detail Dialog */}
        {/* The UserDetailDialog component is now handled within UserTable */}
      </Box>
    </Fade>
  );
};



export default AdminDashboard;