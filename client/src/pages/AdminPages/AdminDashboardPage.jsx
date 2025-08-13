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
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  LinearProgress
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
  Assessment,
  BarChart,
  MonetizationOn,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  CheckCircle,
  PendingActions,
  Cancel
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/components/AdminLayout';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';

// Theme colors
const statusColors = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
  unverified: 'default',
  active: 'success',
  inactive: 'default'
};

// Mock data for development
const getMockDashboardStats = () => ({
  totalUsers: 1243,
  activeUsers: 987,
  totalSessions: 3245,
  revenue: 45230,
  tutors: { total: 145, pending: 23, verified: 122 },
  students: { total: 878, active: 765 },
  parents: { total: 220, active: 198 },
  sessions: { total: 3245, thisMonth: 489, lastMonth: 376, change: 30 },
  revenue: { total: 45230, thisMonth: 12800, lastMonth: 10200, change: 25 },
  recentActivities: [
    { id: 1, user: 'John Smith', action: 'New tutor registration', time: '2 mins ago', status: 'pending' },
    { id: 2, user: 'Sarah Johnson', action: 'Completed profile verification', time: '15 mins ago', status: 'verified' },
    { id: 3, user: 'Michael Brown', action: 'Scheduled new session', time: '1 hour ago', status: 'active' },
    { id: 4, user: 'Emily Davis', action: 'Payment received', time: '3 hours ago', status: 'completed' },
    { id: 5, user: 'Robert Wilson', action: 'Account deactivated', time: '5 hours ago', status: 'inactive' }
  ]
});

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  loading, 
  index, 
  color = 'primary.main',
  link 
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (loading) {
    return (
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={0} sx={{ 
          height: '100%',
          borderRadius: 3,
          background: theme.palette.background.paper
        }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={32} />
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={60} height={20} sx={{ ml: 1 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  const TrendIcon = trend === 'up' ? ArrowUpward : ArrowDownward;
  const trendColor = trend === 'up' ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Zoom in timeout={300 + index * 100}>
        <Card 
          component={link ? Link : 'div'}
          to={link}
          elevation={0}
          sx={{ 
            height: '100%',
            borderRadius: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4],
              borderColor: theme.palette[color.split('.')[0]].main
            }
          }}
        >
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography 
                variant="subtitle2" 
                color="textSecondary" 
                fontWeight="medium"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {title}
              </Typography>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette[color.split('.')[0]].light,
                color: theme.palette[color.split('.')[0]].main
              }}>
                <Icon fontSize="small" />
              </Box>
            </Box>
            
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="textPrimary" 
              sx={{ mb: 1 }}
            >
              {value}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendIcon 
                sx={{ 
                  fontSize: 16,
                  color: trendColor,
                  mr: 0.5
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: trendColor,
                  fontWeight: 'medium'
                }}
              >
                {trendValue}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ ml: 1 }}
              >
                {trend === 'up' ? 'vs last month' : 'vs last month'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    </Grid>
  );
};

const ActivityItem = ({ user, action, time, status, loading }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton variant="rectangular" width={80} height={24} />
      </Box>
    );
  }

  const statusIcons = {
    pending: <PendingActions color="warning" />,
    verified: <CheckCircle color="success" />,
    active: <CheckCircle color="success" />,
    completed: <CheckCircle color="success" />,
    inactive: <Cancel color="error" />
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      py: 2,
      '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`
      }
    }}>
      <Avatar sx={{ 
        width: 40, 
        height: 40, 
        mr: 2,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main
      }}>
        {user.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight="medium">
          {user}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {action}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
          {time}
        </Typography>
        {statusIcons[status]}
      </Box>
    </Box>
  );
};

const AdminDashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dashboardState, setDashboardState] = useState({
    stats: {},
    loading: true,
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

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      trend: dashboardState.stats.tutors?.verified > 60 ? 'up' : 'down',
      trendValue: `${Math.round(((dashboardState.stats.tutors?.verified || 0) / (dashboardState.stats.tutors?.total || 1)) * 100)}%`,
      link: '/admin/users'
    },
    {
      title: 'Active Students',
      value: dashboardState.stats.students?.active || 0,
      icon: Person,
      color: 'success.main',
      trend: 'up',
      trendValue: '+12%',
      link: '/admin/users'
    },
    {
      title: 'Engaged Parents',
      value: dashboardState.stats.parents?.active || 0,
      icon: ContactMail,
      color: 'info.main',
      trend: 'up',
      trendValue: '+8%',
      link: '/admin/users'
    },
    {
      title: 'Monthly Sessions',
      value: dashboardState.stats.sessions?.thisMonth || 0,
      icon: CalendarToday,
      color: 'secondary.main',
      trend: dashboardState.stats.sessions?.change > 0 ? 'up' : 'down',
      trendValue: `${dashboardState.stats.sessions?.change || 0}%`,
      link: '/admin/sessions'
    }
  ];

  const performanceCards = [
    {
      title: 'Total Revenue',
      value: `$${(dashboardState.stats.revenue?.total || 0).toLocaleString()}`,
      icon: MonetizationOn,
      color: 'warning.main',
      trend: dashboardState.stats.revenue?.change > 0 ? 'up' : 'down',
      trendValue: `${dashboardState.stats.revenue?.change || 0}%`,
      progress: 75,
      link: '/admin/finance'
    },
    {
      title: 'Active Users',
      value: dashboardState.stats.activeUsers || 0,
      icon: People,
      color: 'success.main',
      trend: 'up',
      trendValue: '+5%',
      progress: Math.round(((dashboardState.stats.activeUsers || 0) / (dashboardState.stats.totalUsers || 1)) * 100),
      link: '/admin/users'
    }
  ];

  return (
    <AdminLayout tabValue="dashboard">
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ 
              mb: 4,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: isMobile ? 2 : 0
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                  mr: 2
                }}>
                  <DashboardIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Dashboard Overview
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={loadDashboardData}
                  disabled={dashboardState.loading}
                  startIcon={<Refresh />}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    px: 3
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Main Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statCards.map((card, index) => (
                <StatCard
                  key={card.title}
                  {...card}
                  loading={dashboardState.loading}
                  index={index}
                />
              ))}
            </Grid>

            {/* Performance Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {performanceCards.map((card, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Zoom in timeout={400 + index * 100}>
                    <Card 
                      component={Link}
                      to={card.link}
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        textDecoration: 'none',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette[card.color.split('.')[0]].main
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mb: 2
                        }}>
                          <Typography 
                            variant="subtitle2" 
                            color="textSecondary" 
                            fontWeight="medium"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                          >
                            {card.title}
                          </Typography>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.palette[card.color.split('.')[0]].light,
                            color: theme.palette[card.color.split('.')[0]].main
                          }}>
                            <card.icon fontSize="small" />
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="h4" 
                          fontWeight="bold" 
                          color="textPrimary" 
                          sx={{ mb: 1 }}
                        >
                          {card.value}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {card.trend === 'up' ? (
                            <ArrowUpward sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                          ) : (
                            <ArrowDownward sx={{ color: theme.palette.error.main, fontSize: 16, mr: 0.5 }} />
                          )}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: card.trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                              fontWeight: 'medium'
                            }}
                          >
                            {card.trendValue}
                          </Typography>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={card.progress} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: theme.palette[card.color.split('.')[0]].main
                            }
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>

            {/* Recent Activity and Stats Section */}
            <Grid container spacing={3}>
              {/* Recent Activity */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <Typography variant="h6" fontWeight="medium">
                        Recent Activities
                      </Typography>
                      <Button 
                        size="small" 
                        endIcon={<MoreVert />}
                        sx={{ textTransform: 'none' }}
                      >
                        View All
                      </Button>
                    </Box>
                    
                    {dashboardState.loading ? (
                      <>
                        <ActivityItem loading />
                        <ActivityItem loading />
                        <ActivityItem loading />
                      </>
                    ) : (
                      dashboardState.stats.recentActivities?.map((activity, index) => (
                        <ActivityItem
                          key={index}
                          user={activity.user}
                          action={activity.action}
                          time={activity.time}
                          status={activity.status}
                        />
                      )) || (
                        <Box sx={{ 
                          height: 200, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <Typography color="textSecondary">
                            No recent activities found
                          </Typography>
                        </Box>
                      )
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Platform Stats */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                      Platform Statistics
                    </Typography>
                    
                    {dashboardState.loading ? (
                      <Box>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                      </Box>
                    ) : (
                      <Box sx={{ 
                        height: 200, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        textAlign: 'center'
                      }}>
                        <BarChart sx={{ 
                          fontSize: 60, 
                          color: theme.palette.primary.main,
                          mb: 2
                        }} />
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                          Detailed analytics coming soon
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          We're working on comprehensive visualization tools
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Error Display */}
            {dashboardState.error && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mt: 3, 
                  borderRadius: 3,
                  backgroundColor: theme.palette.error.light,
                  border: `1px solid ${theme.palette.error.light}`,
                  color: theme.palette.error.dark
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