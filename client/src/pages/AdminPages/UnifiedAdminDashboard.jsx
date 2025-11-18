import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Chip,
  CircularProgress
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
import { getDashboardStats } from '../../services/adminService';
import { AdminDashboardProvider } from '../../contexts/AdminDashboardContext';

// Lazy load components for better performance
const AdminDashboard = React.lazy(() => import('../../components/admin/components/AdminDashboard'));
const TutorSessionsPage = React.lazy(() => import('./TutorSessionsPage'));
const TutorPayments = React.lazy(() => import('./TutorPyaments'));
const TutorReviewsPage = React.lazy(() => import('./TutorReviewsPage'));
const HireRequestsPage = React.lazy(() => import('./HireRequestsPage'));
const Chats = React.lazy(() => import('../../components/admin/components/Chats'));
const AdminSettings = React.lazy(() => import('./AdminSettings'));
const AdminAssignments = React.lazy(() => import('../../components/admin/components/AdminAssignments'));

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

const StatCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  loading, 
  color = 'primary',
  onClick,
  secondaryValue,
  showDot = false,
  onSeen = () => {},
  hasData = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Show skeleton if loading OR if we don't have data yet
  if (loading || !hasData) {
    return (
      <Grid item xs={12} sm={6} lg={3}>
        <Card elevation={0} sx={{ 
          height: '100%',
          borderRadius: '12px',
          background: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: alpha(theme.palette[color].main, 0.5),
            background: alpha(theme.palette[color].main, 0.02)
          }
        }}>
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
                <Skeleton variant="text" width="60%" height={32} />
              </Box>
            </Box>
            
            <Divider sx={{ my: 1.5 }} />
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Skeleton variant="text" width="40%" height={20} />
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                ml: 'auto'
              }}>
                <Skeleton variant="circular" width={16} height={16} sx={{ mr: 0.5 }} />
                <Skeleton variant="text" width={50} height={20} />
              </Box>
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
        component="div"
        elevation={0}
        onClick={onClick}
        sx={{ 
          height: '100%',
          borderRadius: '12px',
          background: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          cursor: onClick ? 'pointer' : 'default',
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
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: { xs: 1.5, sm: 2 },
            gap: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{
              width: { xs: 40, sm: 44, md: 48 },
              height: { xs: 40, sm: 44, md: 48 },
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              flexShrink: 0
            }}>
              <Icon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                fontWeight="500"
                sx={{ 
                  mb: 0.5,
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="text.primary"
                sx={{ 
                  lineHeight: 1.2,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
                }}
              >
                {value}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: { xs: 0.5, sm: 1 }
          }}>
            {secondaryValue && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  wordBreak: 'break-word'
                }}
              >
                {secondaryValue}
              </Typography>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              ml: secondaryValue ? 'auto' : 0
            }}>
              <TrendIcon sx={{ 
                fontSize: { xs: 14, sm: 16 }, 
                color: trendColor,
                mr: 0.5 
              }} />
              <Typography 
                variant="body2" 
                fontWeight="500"
                color={trendColor}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                {trendValue}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
});

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

const UnifiedAdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL
  const getTabFromPath = (pathname, search) => {
    if (pathname === '/admin' || pathname === '/admin/') return 'dashboard';
    if (pathname === '/admin/users') {
      const params = new URLSearchParams(search);
      const tab = params.get('tab');
      return tab && ['tutors', 'students', 'parents'].includes(tab) ? tab : 'tutors';
    }
    if (pathname === '/admin/chats') return 'chat';
    if (pathname === '/admin/tutor-sessions') return 'tutor-sessions';
    if (pathname === '/admin/tutor-payments') return 'tutor-payments';
    if (pathname === '/admin/tutor-reviews') return 'tutor-reviews';
    if (pathname === '/admin/hire-requests') return 'hire-requests';
    if (pathname === '/admin/assignments') return 'assignments';
    if (pathname === '/admin/settings') return 'settings';
    return 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname, location.search));
  const [dashboardState, setDashboardState] = useState(() => {
    // Load from sessionStorage for instant display
    const savedStats = sessionStorage.getItem('adminDashboardStats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        // Check if data is not too old (less than 5 minutes for dashboard stats)
        if (parsed.lastUpdated && (Date.now() - new Date(parsed.lastUpdated).getTime()) < 5 * 60 * 1000) {
          return {
            stats: parsed.stats || {},
            loading: false,
            error: null
          };
        }
      } catch (error) {
        //console.error('Error parsing saved dashboard stats:', error);
      }
    }
    return {
      stats: {},
      loading: false,
      error: null
    };
  });
  const [newFlags, setNewFlags] = useState({ tutors: false, students: false, parents: false });
  const [lastRefreshTime, setLastRefreshTime] = useState(() => {
    const savedStats = sessionStorage.getItem('adminDashboardStats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        return parsed.lastUpdated ? new Date(parsed.lastUpdated) : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync active tab with URL changes
  useEffect(() => {
    const newTab = getTabFromPath(location.pathname, location.search);
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, location.search, activeTab]);

  const computeFlags = useCallback((stats) => {
    const tutorsTotal = stats.tutors?.total || 0;
    const studentsActive = stats.students?.active || 0;
    const parentsActive = stats.parents?.active || 0;

    const lastTutors = Number(sessionStorage.getItem(statKey('tutors_total')) || 0);
    const lastStudents = Number(sessionStorage.getItem(statKey('students_active')) || 0);
    const lastParents = Number(sessionStorage.getItem(statKey('parents_active')) || 0);

    setNewFlags({
      tutors: tutorsTotal > lastTutors,
      students: studentsActive > lastStudents,
      parents: parentsActive > lastParents
    });
  }, []);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    // Don't show loading if we have cached data and not forcing refresh
    if (!forceRefresh && Object.keys(dashboardState.stats).length > 0) {
      return;
    }

    setDashboardState(prev => ({ ...prev, error: null }));
    setIsRefreshing(true);
    try {
      const statsData = await getDashboardStats();
      
      setDashboardState(prev => ({
        ...prev,
        stats: statsData,
        loading: false
      }));
      computeFlags(statsData);
      setLastRefreshTime(new Date());
      
      // Save to sessionStorage for instant loading next time
      sessionStorage.setItem('adminDashboardStats', JSON.stringify({
        stats: statsData,
        lastUpdated: new Date()
      }));
    } catch (error) {
      //console.error('Dashboard data loading error:', error);
      setDashboardState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [computeFlags, dashboardState.stats]);

  // Initial load - only if no cached data
  useEffect(() => {
    if (Object.keys(dashboardState.stats).length === 0) {
      loadDashboardData();
    } else {
      // Load cached data silently in background to keep it fresh
      loadDashboardData(true);
    }
  }, []);

  const tutorsTotal = dashboardState.stats.tutors?.total || 0;
  const studentsActive = dashboardState.stats.students?.total || 0;
  const parentsActive = dashboardState.stats.parents?.total || 0;
  const inactiveTutors = dashboardState.stats.tutors?.inactive || 0;
  const inactiveStudents = dashboardState.stats.students?.inactive || 0;
  const inactiveParents = dashboardState.stats.parents?.inactive || 0;
  
  const statCards = useMemo(() => {
    const tutorsVerified = dashboardState.stats.tutors?.verified || 0;
    const tutorsTotal = dashboardState.stats.tutors?.total || 0;
    const studentsTotal = dashboardState.stats.students?.total || 0;
    const parentsTotal = dashboardState.stats.parents?.total || 0;
    const sessionsTotal = dashboardState.stats.sessions?.total || 0;
    const sessionsCompleted = dashboardState.stats.sessions?.completed || 0;
    const sessionsPending = dashboardState.stats.sessions?.pending || 0;
    const revenueTotal = dashboardState.stats.revenue?.total || 0;
    const revenueLastMonth = dashboardState.stats.revenue?.lastMonth || 0;
    return [
      {
        title: 'Total Tutors',
        value: tutorsTotal,
        icon: School,
        color: 'primary',
        trend: tutorsVerified > 60 ? 'up' : 'down',
        trendValue: `${Math.round((tutorsVerified / Math.max(tutorsTotal, 1)) * 100)}%`,
        secondaryValue: `${tutorsVerified} verified`,
        onClick: () => handleTabChange('tutors'),
      },
      {
        title: 'Active Students',
        value: studentsTotal,
        icon: Person,
        color: 'success',
        trend: 'up',
        trendValue: '+12%',
        secondaryValue: `${dashboardState.stats.students?.newThisMonth || 0} new`,
        onClick: () => handleTabChange('students'),
      },
      {
        title: 'Active Parents',
        value: parentsTotal,
        icon: Groups,
        color: 'info',
        trend: 'up',
        trendValue: '+8%',
        secondaryValue: `${dashboardState.stats.parents?.linkedAccounts || 0} linked`,
        onClick: () => handleTabChange('parents'),
      },
      {
        title: 'Inactive Students',
        value: inactiveStudents,
        icon: Person,
        color: 'primary',
        trend: 'up',
        trendValue: `${Math.round(((inactiveStudents / (dashboardState.stats.students?.total || 1)) * 100))}%`,
        secondaryValue: `${inactiveStudents} inactive`,
        onClick: () => handleTabChange('students'),
      },
      {
        title: 'Inactive Tutors',
        value: inactiveTutors,
        icon: School,
        color: 'primary',
        trend: 'up',
        trendValue: `${Math.round(((inactiveTutors / (dashboardState.stats.tutors?.total || 1)) * 100))}%`,
        secondaryValue: `${inactiveTutors} inactive`,
        onClick: () => handleTabChange('tutors'),
      },
      {
        title: 'Inactive Parents',
        value: inactiveParents,
        icon: Groups,
        color: 'primary',
        trend: 'up',
        trendValue: `${Math.round(((inactiveParents / (dashboardState.stats.parents?.total || 1)) * 100))}%`,
        secondaryValue: `${inactiveParents} inactive`,
        onClick: () => handleTabChange('parents'),
      },
      {
        title: 'Tutor Sessions',
        value: dashboardState.stats.sessions?.total || 0,
        icon: BookOnline,
        color: 'success',
        trend: 'up',
        trendValue: `${dashboardState.stats.sessions?.completed || 0} completed`,
        secondaryValue: `${dashboardState.stats.sessions?.pending || 0} pending`,
        onClick: () => handleTabChange('tutor-sessions'),
      },
      {
        title: 'Monthly Revenue',
        value: `$${revenueTotal.toLocaleString()}`,
        icon: MonetizationOn,
        color: 'warning',
        trend: revenueLastMonth > 0 ? 'up' : 'down',
        trendValue: `${Math.round(((revenueLastMonth / Math.max(revenueTotal, 1)) * 100))}%`,
        secondaryValue: `$${revenueLastMonth.toLocaleString()} last month`,
        onClick: () => handleTabChange('tutor-payments'),
      },
    ];
  }, [
    dashboardState.stats.tutors?.verified,
    dashboardState.stats.tutors?.total,
    dashboardState.stats.students?.total,
    dashboardState.stats.parents?.total,
    dashboardState.stats.sessions?.total,
    dashboardState.stats.sessions?.completed,
    dashboardState.stats.sessions?.pending,
    dashboardState.stats.revenue?.total,
    dashboardState.stats.revenue?.lastMonth,
    newFlags.tutors,
    newFlags.students,
    newFlags.parents
  ]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    // Update URL without page reload
    const pathMap = {
      'dashboard': '/admin',
      'tutors': '/admin/users?tab=tutors',
      'students': '/admin/users?tab=students',
      'parents': '/admin/users?tab=parents',
      'chat': '/admin/chats',
      'tutor-sessions': '/admin/tutor-sessions',
      'tutor-payments': '/admin/tutor-payments',
      'tutor-reviews': '/admin/tutor-reviews',
      'hire-requests': '/admin/hire-requests',
      'assignments': '/admin/assignments',
      'settings': '/admin/settings'
    };
    
    const newPath = pathMap[newTab] || '/admin';
    const [newPathname, newSearch] = newPath.split('?');
    const currentSearch = location.search || '';
    const expectedSearch = newSearch ? `?${newSearch}` : '';
    
    if (location.pathname !== newPathname || currentSearch !== expectedSearch) {
      navigate(newPath, { replace: true });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Box sx={{ 
              mb: { xs: 2, sm: 3, md: 4 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="700" 
                  sx={{ 
                    mb: 0.5,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  Dashboard Overview
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
                {lastRefreshTime && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 0.5, 
                      display: 'block',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    Last updated: {lastRefreshTime.toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'flex-start', sm: 'flex-end' }
              }}>
                {isRefreshing && (
                  <Typography 
                    variant="caption" 
                    color="primary" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    <Refresh sx={{ fontSize: { xs: 12, sm: 14 }, animation: 'spin 1s linear infinite' }} />
                    <span className="hidden sm:inline">Refreshing...</span>
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  onClick={() => loadDashboardData(true)}
                  disabled={isRefreshing}
                  startIcon={<Refresh />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: '500',
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    width: { xs: '100%', sm: 'auto' },
                    mt: { xs: 0, sm: 0 }
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Stats Cards Section */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {statCards.map((card, index) => (
                <StatCard
                  key={index}
                  {...card}
                  loading={dashboardState.loading}
                  hasData={Object.keys(dashboardState.stats).length > 0}
                />
              ))}
            </Grid>
          </Box>
        );
      case 'tutors':
      case 'students':
      case 'parents':
        return (
          <AdminDashboardProvider>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
              </Box>
            }>
              <AdminDashboard tabValue={activeTab} />
            </Suspense>
          </AdminDashboardProvider>
        );
      case 'tutor-sessions':
        return (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          }>
            <TutorSessionsPage />
          </Suspense>
        );
      case 'tutor-payments':
        return (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          }>
            <TutorPayments />
          </Suspense>
        );
      case 'tutor-reviews':
        return (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          }>
            <TutorReviewsPage />
          </Suspense>
        );
      case 'hire-requests':
        return (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          }>
            <HireRequestsPage />
          </Suspense>
        );
      case 'assignments':
        return (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          }>
            <AdminAssignments />
          </Suspense>
        );
      case 'chat':
        return (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          }>
            <Chats />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          }>
            <AdminSettings />
          </Suspense>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6">Page not found</Typography>
          </Box>
        );
    }
  };

  return (
    <AdminLayout tabValue={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </AdminLayout>
  );
};

export default UnifiedAdminDashboard;
