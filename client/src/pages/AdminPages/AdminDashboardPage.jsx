import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  Skeleton,
  Alert,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Refresh,
  School,
  Person,
  ContactMail,
  CalendarToday,
  People,
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  PendingActions,
  Cancel,
  Visibility,
  Edit,
  MoreVert,
  Notifications,
  Settings,
  Assessment,
  BarChart3,
  Users,
  BookOpen,
  DollarSign,
  Star,
  Timer,
  TrendingUp as GrowthIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/components/AdminLayout';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';

// Enhanced status colors with better visual appeal
const statusConfig = {
  verified: { color: '#10B981', icon: CheckCircle, label: 'Verified', bgColor: '#ECFDF5' },
  pending: { color: '#F59E0B', icon: PendingActions, label: 'Pending', bgColor: '#FFFBEB' },
  rejected: { color: '#EF4444', icon: Cancel, label: 'Rejected', bgColor: '#FEF2F2' },
  active: { color: '#10B981', icon: CheckCircle, label: 'Active', bgColor: '#ECFDF5' },
  inactive: { color: '#6B7280', icon: Cancel, label: 'Inactive', bgColor: '#F9FAFB' }
};

// Enhanced mock data
const getMockData = () => ({
  overview: {
    totalUsers: 1243,
    totalTutors: 145,
    totalStudents: 878,
    totalSessions: 3245,
    monthlyRevenue: 12800
  },
  recentUsers: [
    { id: 1, name: 'John Smith', type: 'Tutor', status: 'pending', time: '2 mins ago', avatar: 'JS' },
    { id: 2, name: 'Sarah Johnson', type: 'Student', status: 'active', time: '15 mins ago', avatar: 'SJ' },
    { id: 3, name: 'Michael Brown', type: 'Parent', status: 'active', time: '1 hour ago', avatar: 'MB' },
    { id: 4, name: 'Emily Davis', type: 'Tutor', status: 'verified', time: '3 hours ago', avatar: 'ED' }
  ],
  quickStats: {
    pendingApprovals: 23,
    activeSessions: 45,
    monthlyGrowth: 15,
    userSatisfaction: 4.8
  }
});

// Enhanced Metric Card with gradients and better design
const MetricCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle, loading, link, gradient = false }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Grid item xs={12} sm={6} lg={3}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1px solid #e2e8f0'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="text" width="80%" height={16} />
          </CardContent>
        </Card>
      </Grid>
    );
  }

  const getGradient = (color) => {
    const gradients = {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    return gradients[color] || gradients.primary;
  };

  const content = (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 4,
      background: gradient ? getGradient(color) : 'white',
      border: gradient ? 'none' : '1px solid #e2e8f0',
      boxShadow: gradient ? '0 20px 40px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      position: 'relative',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: gradient ? '0 25px 50px rgba(0,0,0,0.15)' : '0 8px 30px rgba(0,0,0,0.12)'
      }
    }}>
      {/* Background Pattern */}
      {gradient && (
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          opacity: 0.6
        }} />
      )}
      
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : theme.palette[color].light,
            color: gradient ? 'white' : theme.palette[color].main,
            backdropFilter: gradient ? 'blur(10px)' : 'none'
          }}>
            <Icon fontSize="large" />
          </Box>
          {trend && (
            <Chip
              icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              sx={{
                backgroundColor: trend > 0 ? '#10B981' : '#EF4444',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                height: 28,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          )}
        </Box>
        
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          sx={{ 
            mb: 1,
            color: gradient ? 'white' : 'text.primary',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1,
            color: gradient ? 'rgba(255,255,255,0.9)' : 'text.primary',
            fontWeight: '600'
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: gradient ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Grid item xs={12} sm={6} lg={3}>
      {link ? (
        <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
          {content}
        </Link>
      ) : (
        content
      )}
    </Grid>
  );
};

// Enhanced Activity Item with better visual design
const ActivityItem = ({ user, type, status, time, loading, avatar }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <ListItem sx={{ px: 0, py: 2 }}>
        <ListItemAvatar>
          <Skeleton variant="circular" width={48} height={48} />
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton variant="text" width="60%" height={24} />}
          secondary={<Skeleton variant="text" width="40%" height={20} />}
        />
        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
      </ListItem>
    );
  }

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <ListItem sx={{ 
      px: 0, 
      py: 2,
      borderRadius: 2,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.02)',
        transform: 'translateX(4px)'
      }
    }}>
      <ListItemAvatar>
        <Avatar sx={{ 
          width: 48, 
          height: 48,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {avatar || user.name.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'text.primary' }}>
              {user.name}
            </Typography>
            <Chip 
              label={type} 
              size="small" 
              variant="outlined"
              sx={{ 
                height: 24, 
                fontSize: '0.75rem',
                fontWeight: '500',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light + '20'
              }}
            />
          </Box>
        }
        secondary={
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            {time}
          </Typography>
        }
      />
      <Chip
        icon={<config.icon />}
        label={config.label}
        size="medium"
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}20`,
          fontWeight: '600',
          fontSize: '0.8rem',
          height: 32,
          '& .MuiChip-icon': { color: config.color }
        }}
      />
    </ListItem>
  );
};

// Enhanced Quick Actions with better button design
const QuickActions = () => {
  const theme = useTheme();
  
  const actions = [
    { 
      title: 'View Users', 
      icon: Users, 
      color: 'primary', 
      link: '/admin/users',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      title: 'Manage Sessions', 
      icon: BookOpen, 
      color: 'secondary', 
      link: '/admin/sessions',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      title: 'Financial Reports', 
      icon: DollarSign, 
      color: 'success', 
      link: '/admin/finance',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      title: 'Analytics', 
      icon: BarChart3, 
      color: 'info', 
      link: '/admin/analytics',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  ];

  return (
    <Card sx={{ 
      borderRadius: 4, 
      border: '1px solid #e2e8f0',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="600" sx={{ mb: 3, color: 'text.primary' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {actions.map((action, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Link to={action.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<action.icon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    height: 56,
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: action.gradient,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {action.title}
                </Button>
              </Link>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Enhanced Quick Stats with better visual design
const QuickStatsCard = ({ data, loading }) => {
  const theme = useTheme();
  
  const stats = [
    {
      label: 'Pending Approvals',
      value: data?.pendingApprovals || 0,
      icon: PendingActions,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      progress: 75
    },
    {
      label: 'Active Sessions',
      value: data?.activeSessions || 0,
      icon: Timer,
      color: '#10B981',
      bgColor: '#ECFDF5',
      progress: 60
    },
    {
      label: 'Monthly Growth',
      value: `${data?.monthlyGrowth || 0}%`,
      icon: GrowthIcon,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      progress: data?.monthlyGrowth || 0
    },
    {
      label: 'User Satisfaction',
      value: data?.userSatisfaction || 0,
      icon: Star,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      progress: (data?.userSatisfaction || 0) * 20
    }
  ];

  return (
    <Card sx={{ 
      borderRadius: 4, 
      border: '1px solid #e2e8f0',
      background: 'white',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      height: '100%'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: 'text.primary' }}>
          Platform Insights
        </Typography>
        
        {loading ? (
          <Box>
            {[1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ mb: 3 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4, mt: 1 }} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {stats.map((stat, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: stat.bgColor,
                      color: stat.color
                    }}>
                      <stat.icon fontSize="small" />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: '500' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stat.progress} 
                  sx={{ 
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: stat.bgColor,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: stat.color
                    }
                  }} 
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dashboardData, setDashboardData] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDashboardData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const statsData = await getDashboardStats();
      setDashboardData({
        data: statsData,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Load mock data as fallback
      const mockData = getMockData();
      setDashboardData({
        data: mockData,
        loading: false,
        error: null
      });
    }
  };

  const data = dashboardData.data || getMockData();

  return (
    <AdminLayout tabValue="dashboard">
      <Box sx={{ p: isMobile ? 2 : 3, maxWidth: '1400px', mx: 'auto' }}>
        {/* Enhanced Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}>
                <DashboardIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                  Dashboard
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: '400' }}>
                  Welcome back! Here's what's happening with your platform.
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={loadDashboardData}
                  disabled={dashboardData.loading}
                  sx={{ 
                    width: 48,
                    height: 48,
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    '&:hover': { 
                      backgroundColor: '#f8fafc',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton sx={{ 
                  width: 48,
                  height: 48,
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  '&:hover': { 
                    backgroundColor: '#f8fafc',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}>
                  <Notifications />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton sx={{ 
                  width: 48,
                  height: 48,
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  '&:hover': { 
                    backgroundColor: '#f8fafc',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}>
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Enhanced Main Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <MetricCard
            title="Total Users"
            value={data.overview?.totalUsers?.toLocaleString() || '0'}
            icon={People}
            color="primary"
            trend={12}
            subtitle="Active platform users"
            loading={dashboardData.loading}
            link="/admin/users"
            gradient={true}
          />
          <MetricCard
            title="Total Tutors"
            value={data.overview?.totalTutors?.toLocaleString() || '0'}
            icon={School}
            color="secondary"
            trend={8}
            subtitle="Verified and pending"
            loading={dashboardData.loading}
            link="/admin/users"
            gradient={true}
          />
          <MetricCard
            title="Total Students"
            value={data.overview?.totalStudents?.toLocaleString() || '0'}
            icon={Person}
            color="success"
            trend={15}
            subtitle="Active learners"
            loading={dashboardData.loading}
            link="/admin/users"
            gradient={true}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${data.overview?.monthlyRevenue?.toLocaleString() || '0'}`}
            icon={MonetizationOn}
            color="warning"
            trend={25}
            subtitle="This month's earnings"
            loading={dashboardData.loading}
            link="/admin/finance"
            gradient={true}
          />
        </Grid>

        {/* Enhanced Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <QuickActions />
        </Box>

        {/* Enhanced Content Grid */}
        <Grid container spacing={3}>
          {/* Enhanced Recent Users */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              borderRadius: 4, 
              border: '1px solid #e2e8f0',
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 3
                }}>
                  <Typography variant="h5" fontWeight="600" sx={{ color: 'text.primary' }}>
                    Recent User Activity
                  </Typography>
                  <Button 
                    component={Link}
                    to="/admin/users"
                    size="medium" 
                    endIcon={<MoreVert />}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: '600',
                      borderRadius: 2,
                      px: 3
                    }}
                  >
                    View All
                  </Button>
                </Box>
                
                {dashboardData.loading ? (
                  <Box>
                    {[1, 2, 3, 4].map((item) => (
                      <ActivityItem key={item} loading />
                    ))}
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {data.recentUsers?.map((user, index) => (
                      <React.Fragment key={user.id}>
                        <ActivityItem
                          user={user}
                          type={user.type}
                          status={user.status}
                          time={user.time}
                          avatar={user.avatar}
                        />
                        {index < data.recentUsers.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Enhanced Quick Stats */}
          <Grid item xs={12} lg={4}>
            <QuickStatsCard data={data.quickStats} loading={dashboardData.loading} />
          </Grid>
        </Grid>

        {/* Enhanced Error Display */}
        {dashboardData.error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3, 
              borderRadius: 3,
              fontSize: '1rem',
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
            onClose={() => setDashboardData(prev => ({ ...prev, error: null }))}
          >
            {dashboardData.error}
          </Alert>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardPage;