import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  Fade,
  Zoom
} from '@mui/material';
import {
  School,
  Person,
  ContactMail,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  People,
  Business
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, chips, loading, index }) => {
  const getIconColor = (title) => {
    switch (title.toLowerCase()) {
      case 'total tutors':
        return 'primary.main';
      case 'total students':
        return 'success.main';
      case 'total parents':
        return 'info.main';
      case 'pending interviews':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

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
              borderColor: getIconColor(title)
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="textSecondary" variant="body2" fontWeight="medium">
                {title}
              </Typography>
              <Icon sx={{ color: getIconColor(title), fontSize: 28 }} />
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

const DashboardStats = ({ stats, statusCounts, users, loading = false }) => {
  const statCards = [
    {
      title: 'Total Tutors',
      value: stats.tutors?.total || users.tutors.length,
      icon: School,
      chips: [
        { label: `${stats.tutors?.pending || statusCounts.tutors.pending || 0} Pending`, color: 'warning' },
        { label: `${stats.tutors?.verified || statusCounts.tutors.verified || 0} Verified`, color: 'success' }
      ]
    },
    {
      title: 'Total Students',
      value: stats.students?.total || users.students.length,
      icon: Person,
      chips: [
        { label: `${statusCounts.students.active || 0} Active`, color: 'success' }
      ]
    },
    {
      title: 'Total Parents',
      value: stats.parents?.total || users.parents.length,
      icon: ContactMail,
      chips: [
        { label: `${statusCounts.parents.active || 0} Active`, color: 'success' }
      ]
    },
    {
      title: 'Pending Interviews',
      value: stats.interviews?.pending || users.tutors.filter(t => t.interviewSlots?.some(s => s.scheduled && !s.completed)).length,
      icon: CalendarToday,
      chips: []
    }
  ];

  return (
    
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="medium" color="primary">
          Dashboard Statistics
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            loading={loading}
            index={index}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats; 