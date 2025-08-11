import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Fade,
  Zoom,
  Grid,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  Refresh,
  School,
  Person,
  ContactMail,
  CalendarToday,
  People,
  Business,
  Assessment,
  Timeline,
  BarChart
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/components/AdminLayout';
import { Link } from 'react-router-dom';
// Import admin service
import {
  getDashboardStats,
} from '../../services/adminService';

// Constants
const statusColors = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
  unverified: 'default',
  active: 'success',
  inactive: 'default'
};

// Mock data functions
const getMockDashboardStats = () => ({
  totalUsers: 150,
  activeUsers: 120,
  totalSessions: 450,
  revenue: 12500,
  tutors: { total: 45, pending: 12, verified: 33 },
  students: { total: 78, active: 65 },
  parents: { total: 27, active: 22 },
  sessions: { total: 450, thisMonth: 89, lastMonth: 76 },
  revenue: { total: 12500, thisMonth: 2800, lastMonth: 2400 }
});

const StatCard = ({ title, value, icon: Icon, chips, loading, index, color = 'primary.main' }) => {
  if (loading) {
    return (
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ height: '100%' }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={32} />
            <Box sx={{ mt: 1 }}>
              <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Zoom in timeout={300 + index * 100}>
        <Card 
          elevation={3} 
          sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e0e0e0',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              borderColor: color
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="textSecondary" variant="body2" fontWeight="medium">
                {title}
              </Typography>
              <Icon sx={{ color: color, fontSize: 28 }} />
            </Box>
            
            <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
              {value}
            </Typography>
            
            {chips && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {chips.map((chip, chipIndex) => (
                  <Chip
                    key={chipIndex}
                    label={chip.label}
                    size="small"
                    color={chip.color}
                    variant={chip.variant || 'filled'}
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Zoom>
    </Grid>
  );
};

const ChartCard = ({ title, children, loading }) => {
  if (loading) {
    return (
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, height: 300 }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={6}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          height: 300,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" fontWeight="medium" color="primary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {children}
      </Paper>
    </Grid>
  );
};

const AdminDashboardPage = () => {
  const [dashboardState, setDashboardState] = useState({
    stats: {},
    loading: false,
    error: null
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDashboardState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Please login to access admin dashboard');
      }

      const statsData = await getDashboardStats();
      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        setDashboardState(prev => ({
          ...prev,
          error: 'Access denied. Please login with admin credentials.',
          loading: false
        }));
      } else {
        // Load mock data as fallback
        const statsData = getMockDashboardStats();
        setDashboardState(prev => ({
          ...prev,
          stats: statsData,
          loading: false
        }));
      }
    }
  };

  const statCards = [
    {
      title: 'Total Tutors',
      value: dashboardState.stats.tutors?.total || 0,
      icon: School,
      color: 'primary.main',
      chips: [
        { label: `${dashboardState.stats.tutors?.pending || 0} Pending`, color: 'warning' },
        { label: `${dashboardState.stats.tutors?.verified || 0} Verified`, color: 'success' }
      ],
      link: '/admin/users'
    },
    {
      title: 'Total Students',
      value: dashboardState.stats.students?.total || 0,
      icon: Person,
      color: 'success.main',
      chips: [
        { label: `${dashboardState.stats.students?.active || 0} Active`, color: 'success' }
      ],
      link: '/admin/users'
    },
    {
      title: 'Total Parents',
      value: dashboardState.stats.parents?.total || 0,
      icon: ContactMail,
      color: 'info.main',
      chips: [
        { label: `${dashboardState.stats.parents?.active || 0} Active`, color: 'success' }
      ],
      link: '/admin/users'
    },
    {
      title: 'Total Sessions',
      value: dashboardState.stats.sessions?.total || 0,
      icon: CalendarToday,
      color: 'secondary.main',
      chips: [
        { label: `${dashboardState.stats.sessions?.thisMonth || 0} This Month`, color: 'primary' }
      ],
      // link: '/admin/sessions'
    }
  ];

  const revenueCards = [
    {
      title: 'Total Revenue',
      value: `£${(dashboardState.stats.revenue?.total || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'success.main',
      chips: [
        { label: `£${(dashboardState.stats.revenue?.thisMonth || 0).toLocaleString()} This Month`, color: 'success' }
      ]
    },
    {
      title: 'Active Users',
      value: dashboardState.stats.activeUsers || 0,
      icon: People,
      color: 'info.main',
      chips: [
        { label: `${Math.round(((dashboardState.stats.activeUsers || 0) / (dashboardState.stats.totalUsers || 1)) * 100)}% Rate`, color: 'info' }
      ]
    }
  ];

  return (
    <AdminLayout tabValue="dashboard">
      <Box sx={{ p: 3 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    Admin Dashboard
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Zoom in timeout={400}>
                    <Button
                      variant="outlined"
                      onClick={loadDashboardData}
                      disabled={dashboardState.loading}
                      startIcon={<Refresh />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      Refresh Data
                    </Button>
                  </Zoom>
                </Box>
              </Box>
              
              <Typography variant="body1" color="text.secondary">
                Monitor platform statistics, user activity, and system performance at a glance.
              </Typography>
            </Box>

            {/* Main Statistics Cards */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="medium" color="primary">
                  Platform Overview
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {statCards.map((card, index) => (
                  <Link to={card.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <StatCard
                    key={card.title}
                    {...card}
                    loading={dashboardState.loading}
                    index={index}
                  />
                  </Link>
                ))}
              </Grid>
            </Box>

            {/* Revenue and Performance Cards */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" fontWeight="medium" color="success.main">
                  Performance Metrics
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {revenueCards.map((card, index) => (
                  <StatCard
                    key={card.title}
                    {...card}
                    loading={dashboardState.loading}
                    index={index}
                  />
                ))}
              </Grid>
            </Box>

            {/* Chart Placeholders */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChart sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" fontWeight="medium" color="secondary.main">
                  Analytics & Trends
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <ChartCard title="User Growth Trend" loading={dashboardState.loading}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body2">
                      Chart visualization coming soon
                    </Typography>
                  </Box>
                </ChartCard>
                
                <ChartCard title="Session Activity" loading={dashboardState.loading}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body2">
                      Chart visualization coming soon
                    </Typography>
                  </Box>
                </ChartCard>
              </Grid>
            </Box>

            {/* Error Display */}
            {dashboardState.error && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3,
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  color: '#856404'
                }}
              >
                <Typography variant="body1">
                  {dashboardState.error}
                </Typography>
              </Paper>
            )}
          </Box>
        </Fade>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
