import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  alpha,
  Chip
} from '@mui/material';
import {
  School,
  Person,
  Groups,
  BookOnline,
  MonetizationOn,
  ArrowUpward,
  ArrowDownward,
  Refresh
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import AdminLayout from '../../components/admin/components/AdminLayout';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  loading, 
  color = 'primary',
  link,
  secondaryValue
}) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Grid item xs={12} sm={6} lg={3}>
        <Card elevation={0} sx={{ 
          height: '100%',
          borderRadius: '12px',
          background: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: `1px solid ${theme.palette.divider}`
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
    <Grid item xs={12} sm={6} lg={3}>
      <Card 
        component={link ? Link : 'div'}
        to={link}
        elevation={0}
        sx={{ 
          height: '100%',
          borderRadius: '12px',
          background: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: alpha(theme.palette[color].main, 0.5),
            background: alpha(theme.palette[color].main, 0.02)
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2,
            gap: 2
          }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              flexShrink: 0
            }}>
              <Icon fontSize="medium" />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                fontWeight="500"
                sx={{ mb: 0.5 }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="text.primary"
                sx={{ lineHeight: 1.2 }}
              >
                {value}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {secondaryValue && (
              <Typography variant="caption" color="text.secondary">
                {secondaryValue}
              </Typography>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              ml: 'auto'
            }}>
              <TrendIcon sx={{ 
                fontSize: 16, 
                color: trendColor,
                mr: 0.5 
              }} />
              <Typography 
                variant="body2" 
                fontWeight="500"
                color={trendColor}
              >
                {trendValue}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card elevation={3} sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ 
            color: entry.color,
            mt: 0.5
          }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

const AdminDashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dashboardState, setDashboardState] = useState({
    stats: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDashboardState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const statsData = await getDashboardStats();
      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        loading: false
      }));
    } catch (error) {
      setDashboardState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  const statCards = [
    {
      title: 'Total Tutors',
      value: dashboardState.stats.tutors?.total || 0,
      icon: School,
      color: 'primary',
      trend: dashboardState.stats.tutors?.verified > 60 ? 'up' : 'down',
      trendValue: `${Math.round(((dashboardState.stats.tutors?.verified || 0) / (dashboardState.stats.tutors?.total || 1)) * 100)}%`,
      secondaryValue: `${dashboardState.stats.tutors?.verified || 0} verified`,
      link: '/admin/tutors'
    },
    {
      title: 'Active Students',
      value: dashboardState.stats.students?.active || 0,
      icon: Person,
      color: 'success',
      trend: 'up',
      trendValue: '+12%',
      secondaryValue: `${dashboardState.stats.students?.newThisMonth || 0} new`,
      link: '/admin/students'
    },
    {
      title: 'Engaged Parents',
      value: dashboardState.stats.parents?.active || 0,
      icon: Groups,
      color: 'info',
      trend: 'up',
      trendValue: '+8%',
      secondaryValue: `${dashboardState.stats.parents?.linkedAccounts || 0} linked`,
      link: '/admin/parents'
    },
    {
      title: 'Monthly Revenue',
      value: `$${(dashboardState.stats.revenue?.thisMonth || 0).toLocaleString()}`,
      icon: MonetizationOn,
      color: 'warning',
      trend: dashboardState.stats.revenue?.change > 0 ? 'up' : 'down',
      trendValue: `${dashboardState.stats.revenue?.change || 0}%`,
      secondaryValue: `$${(dashboardState.stats.revenue?.total || 0).toLocaleString()} total`,
      link: '/admin/finance'
    }
  ];

  // Prepare data for charts
  const userGrowthData = [
    { name: 'Students', active: dashboardState.stats.students?.active || 0, new: dashboardState.stats.students?.newThisMonth || 0 },
    { name: 'Tutors', active: dashboardState.stats.tutors?.verified || 0, new: (dashboardState.stats.tutors?.total || 0) - (dashboardState.stats.tutors?.verified || 0) },
    { name: 'Parents', active: dashboardState.stats.parents?.active || 0, new: dashboardState.stats.parents?.linkedAccounts || 0 },
  ];

  const revenueData = [
    { name: 'This Month', value: dashboardState.stats.revenue?.thisMonth || 0 },
    { name: 'Last Month', value: (dashboardState.stats.revenue?.thisMonth || 0) - ((dashboardState.stats.revenue?.change || 0) / 100 * (dashboardState.stats.revenue?.thisMonth || 0)) },
    { name: 'Target', value: (dashboardState.stats.revenue?.thisMonth || 0) * 1.2 },
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ];

  return (
    <AdminLayout tabValue="dashboard">
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
              Dashboard Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            onClick={loadDashboardData}
            disabled={dashboardState.loading}
            startIcon={<Refresh />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: '500',
              px: 3,
              mt: isMobile ? 2 : 0
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Stats Cards Section */}
        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              {...card}
              loading={dashboardState.loading}
            />
          ))}
        </Grid>

        {/* Charts Section */}
        {!dashboardState.loading && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* User Growth Bar Chart */}
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ 
                borderRadius: '12px',
                height: '100%',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    User Growth Overview
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userGrowthData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="active" name="Active Users" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="new" name="New This Month" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Pie Chart */}
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ 
                borderRadius: '12px',
                height: '100%',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Revenue Breakdown
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                          contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: theme.shadows[3]
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Error Display */}
        {dashboardState.error && (
          <Card 
            elevation={0}
            sx={{ 
              mt: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.error.light}`,
              backgroundColor: alpha(theme.palette.error.main, 0.05)
            }}
          >
            <CardContent>
              <Typography color="error">
                {dashboardState.error}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardPage;