import React, { useState, useEffect, useCallback } from 'react';
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

// Add CSS animation for spinning refresh icon
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const statKey = (k) => `admin_last_seen_${k}`;

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  loading, 
  color = 'primary',
  link,
  secondaryValue,
  showDot = false,
  onSeen = () => {}
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
        onClick={onSeen}
        sx={{ 
          height: '100%',
          borderRadius: '12px',
          background: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: alpha(theme.palette[color].main, 0.5),
            background: alpha(theme.palette[color].main, 0.02)
          }
        }}
      >
        {showDot && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, bgcolor: 'error.main', borderRadius: '50%' }} />
        )}
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
  const [newFlags, setNewFlags] = useState({ tutors: false, students: false, parents: false });
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  const computeFlags = useCallback((stats) => {
    const tutorsTotal = stats.tutors?.total || 0;
    const studentsActive = stats.students?.active || 0;
    const parentsActive = stats.parents?.active || 0;

    const lastTutors = Number(localStorage.getItem(statKey('tutors_total')) || 0);
    const lastStudents = Number(localStorage.getItem(statKey('students_active')) || 0);
    const lastParents = Number(localStorage.getItem(statKey('parents_active')) || 0);

    setNewFlags({
      tutors: tutorsTotal > lastTutors,
      students: studentsActive > lastStudents,
      parents: parentsActive > lastParents
    });
  }, []);

  const loadDashboardData = useCallback(async () => {
    setDashboardState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const statsData = await getDashboardStats();
      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        loading: false
      }));
      computeFlags(statsData);
      setLastRefreshTime(new Date());
    } catch (error) {
      setDashboardState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  }, [computeFlags]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // No auto-refresh - only manual refresh via button
  // Removed all automatic refresh mechanisms

  // const markSeen = (key, currentValue) => {
  //   localStorage.setItem(statKey(key), String(currentValue));
  //   setNewFlags(prev => ({ ...prev, [key.split('_')[0]]: false }));
  // };

  const tutorsTotal = dashboardState.stats.tutors?.total || 0;
  const studentsActive = dashboardState.stats.students?.total || 0;
  const parentsActive = dashboardState.stats.parents?.total || 0;
  const inactiveTutors = dashboardState.stats.inactive?.tutors || 0;
  const inactiveStudents = dashboardState.stats.inactive?.students || 0;
  const inactiveParents = dashboardState.stats.inactive?.parents || 0;
console.log("dashboardState.stats",dashboardState)
  const statCards = [
    {
      title: 'Total Tutors',
      value: tutorsTotal,
      icon: School,
      color: 'primary',
      trend: dashboardState.stats.tutors?.verified > 60 ? 'up' : 'down',
      trendValue: `${Math.round(((dashboardState.stats.tutors?.verified || 0) / (dashboardState.stats.tutors?.total || 1)) * 100)}%`,
      secondaryValue: `${dashboardState.stats.tutors?.verified || 0} verified`,
      link: '/admin/users?tab=tutors',
      showDot: newFlags.tutors,
    },
    {
      title: 'Active Students',
      value: studentsActive,
      icon: Person,
      color: 'success',
      trend: 'up',
      trendValue: '+12%',
      secondaryValue: `${dashboardState.stats.students?.newThisMonth || 0} new`,
      link: '/admin/users?tab=students',
      showDot: newFlags.students,
    },
    {
      title: 'Engaged Parents',
      value: parentsActive,
      icon: Groups,
      color: 'info',
      trend: 'up',
      trendValue: '+8%',
      secondaryValue: `${dashboardState.stats.parents?.linkedAccounts || 0} linked`,
      link: '/admin/users?tab=parents',
      showDot: newFlags.parents,
    },
      {
        title: 'Monthly Revenue',
        value: `$${(dashboardState.stats.revenue?.total || 0).toLocaleString()}`,
        icon: MonetizationOn,
        color: 'warning',
        trend: dashboardState.stats.revenue?.change > 0 ? 'up' : 'down',
        trendValue: `${dashboardState.stats.revenue?.lastMonthChange || 0}%`,
        secondaryValue: `$${(dashboardState.stats.revenue?.total || 0).toLocaleString()} total`,
        secondaryValue: `$${(dashboardState.stats.revenue?.lastMonthRevenue || 0).toLocaleString()} last month`,
        link: '/admin',
        showDot: false,
        // onSeen: () => markSeen('revenue_total', dashboardState.stats.revenue?.total || 0)
      },  {
      title: 'Inactive Students',
      value: inactiveStudents,
      icon: Person,
      color: 'primary',
      trend: 'up',
      trendValue: `${Math.round(((inactiveStudents / (dashboardState.stats.students?.total || 1)) * 100))}%`,
      secondaryValue: `${inactiveStudents} inactive`,
      link: '/admin/users',
      showDot: newFlags.tutors,
      // onSeen: () => markSeen('students_total', inactiveStudents)
    },
    {
      title: 'Inactive Tutors',
      value: inactiveTutors,
      icon: School,
      color: 'primary',
      trend: 'up',
      trendValue: `${Math.round(((inactiveTutors / (dashboardState.stats.tutors?.total || 1)) * 100))}%`,
      secondaryValue: `${inactiveTutors} inactive`,
      link: '/admin/users',
      showDot: newFlags.tutors,
      // onSeen: () => markSeen('tutors_total', inactiveTutors)
    },
    {
      title: 'Inactive Parents',
      value: inactiveParents,
      icon: Groups,
      color: 'primary',
      trend: 'up',
      trendValue: `${Math.round(((inactiveParents / (dashboardState.stats.parents?.total || 1)) * 100))}%`,
      secondaryValue: `${inactiveParents} inactive`,
      link: '/admin/users',
      showDot: newFlags.parents,
      // onSeen: () => markSeen('parents_total', inactiveParents)
    },
    {
      title: 'Tutor Sessions',
      value: dashboardState.stats.sessions?.total || 0,
      icon: BookOnline,
      color: 'success',
      trend: 'up',
      trendValue: `${dashboardState.stats.sessions?.completed || 0} completed`,
      secondaryValue: `${dashboardState.stats.sessions?.pending || 0} pending`,
      link: '/admin/tutor-sessions',
      showDot: false,
      // onSeen: () => markSeen('sessions_total', dashboardState.stats.sessions?.total || 0)
    },
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
            {lastRefreshTime && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {dashboardState.loading && (
              <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Refresh sx={{ fontSize: 14, animation: 'spin 1s linear infinite' }} />
                Refreshing...
              </Typography>
            )}
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

    
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardPage;