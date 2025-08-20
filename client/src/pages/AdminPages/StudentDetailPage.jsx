import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/components/AdminLayout";
import { 
  Box, 
  Typography, 
  Divider, 
  Grid, 
  Card, 
  CardContent, 
  Zoom, 
  Avatar, 
  IconButton, 
  Chip, 
  Snackbar, 
  Button, 
  Tooltip, 
  Stack, 
  Badge,
  LinearProgress,
  Paper
} from "@mui/material";
import {
  Star,
  Person,
  ContactMail,
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  School,
  CheckCircle,
  Cancel,
  MoreVert
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import { useSubject } from "../../hooks/useSubject";

const StatusBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 6,
    top: 6,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px 0 rgba(0,0,0,0.1)'
  }
}));

const StudentDetailPage = () => {
  const { tabValue } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isUpdating, setIsUpdating] = useState(false);
  const { subjects } = useSubject();

  const getSubjectName = (id) => {
    const subject = subjects.find(s => s._id === id);
    return subject ? subject: '';
  }
  
  useEffect(() => {
    if (!user) setLoading(false);
  }, [user]);


  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        textAlign: 'center'
      }}>
        <Cancel color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="textSecondary" gutterBottom>
          User not found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const userName = user?.name || "Unknown User";
  const userEmail = user?.email || "No email provided";
  const userPhone = user?.phone || "No phone provided";
  const userLocation = user?.location || "No location provided";
  const userJoinDate = user?.joinDate || "Unknown";
  const userLastActive = user?.lastActive || "Unknown";
  const userRating = user?.rating;
  const userSubjects = user?.subjects || [];
  const userSessionsCompleted = user?.sessionsCompleted || 0;
  const userStatus = user?.status || "inactive";

  const getTabIcon = (currentTab) => {
    switch (currentTab) {
      case "tutors":
        return <Person />;
      case "students":
        return <School />;
      case "parents":
        return <ContactMail />;
      default:
        return <Person />;
    }
  };
  const handleToggleActive = async () => {
    try {
      setIsUpdating(true);
      const next = userStatus === 'active' ? 'inactive' : 'active';
      setUser((prev) => ({ ...prev, status: next }));
      const { updateUserStatus } = await import('../../services/adminService');
      await updateUserStatus(user.id || user.user_id || user._id, next);
      setSnackbar({ open: true, message: `User ${next === 'active' ? 'activated' : 'deactivated'}.`, severity: 'success' });
    } catch (e) {
      setUser((prev) => ({ ...prev, status: userStatus }));
      setSnackbar({ open: true, message: 'Failed to update status.', severity: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout tabValue={tabValue}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Go back">
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ 
                  mr: 2,
                  backgroundColor: 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {React.cloneElement(getTabIcon(tabValue), {
                sx: { 
                  color: 'primary.main',
                  fontSize: 32
                }
              })}
              <Typography variant="h4" sx={{ ml: 2, fontWeight: 700 }}>
                {userName}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/users")}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1
              }}
            >
              Back to Users
            </Button>
          </Box>
        </Box>

        <Zoom in timeout={400}>
          <Box>
            <DetailCard sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md="auto">
                    <StatusBadge 
                      overlap="circular" 
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                      badgeContent={
                        <Tooltip title={userStatus === 'active' ? 'Active' : 'Inactive'}>
                          <Box sx={{ 
                            width: 14, 
                            height: 14, 
                            borderRadius: '50%', 
                            bgcolor: userStatus === 'active' ? 'success.main' : 'error.main', 
                            border: '2px solid white',
                            boxShadow: 1
                          }} />
                        </Tooltip>
                      }
                    >
                      <Avatar 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
                          fontSize: '2.5rem', 
                          fontWeight: 'bold',
                          boxShadow: 3
                        }}
                      >
                        {userName.charAt(0).toUpperCase()}
                      </Avatar>
                    </StatusBadge>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h5" fontWeight={700}>{userName}</Typography>
                        {userRating && (
                          <Chip 
                            icon={<Star sx={{ fontSize: 16 }} />}
                            label={userRating.toFixed(1)} 
                            size="small" 
                            color="warning"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Stack>
                      
                      <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1.5}>
                        <Tooltip title="Email">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">{userEmail}</Typography>
                          </Stack>
                        </Tooltip>
                        
                        <Tooltip title="Phone">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">{userPhone}</Typography>
                          </Stack>
                        </Tooltip>
                        
                        <Tooltip title="Location">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">{userLocation}</Typography>
                          </Stack>
                        </Tooltip>
                      </Stack>
                      
                      <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1.5}>
                        <Tooltip title="Join Date">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">Joined {userJoinDate}</Typography>
                          </Stack>
                        </Tooltip>
                        
                        <Tooltip title="Last Active">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Work fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">Last active {userLastActive}</Typography>
                          </Stack>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md="auto" sx={{ ml: 'auto' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button 
                        variant={userStatus === 'active' ? 'outlined' : 'contained'} 
                        color={userStatus === 'active' ? 'error' : 'success'} 
                        onClick={handleToggleActive} 
                        disabled={isUpdating} 
                        sx={{ 
                          textTransform: 'none', 
                          fontWeight: 600, 
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          minWidth: 120
                        }}
                        startIcon={userStatus === 'active' ? <Cancel /> : <CheckCircle />}
                      >
                        {userStatus === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </DetailCard>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DetailCard>
                  <CardContent className="flex">
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                      Subjects
                    </Typography>
                    {userSubjects.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {userSubjects.map((subject, idx) => (
                          <Chip 
                            key={`${subject}-${idx}`} 
                            label={getSubjectName(subject).name} 
                            size="medium" 
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No subjects assigned
                      </Typography>
                    )}
                  </CardContent>
                </DetailCard>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DetailCard>
                
                        <Paper elevation={0} sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          backgroundColor: 'primary.light',
                          textAlign: 'center'
                        }}>
                          <Typography variant="subtitle2" color="white" gutterBottom>
                            Sessions Completed
                          </Typography>
                          <Typography variant="h4" color="white" fontWeight={700}>
                            {userSessionsCompleted}
                          </Typography>
                        </Paper>
                 </DetailCard>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate(-1)}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Back to Previous Page
              </Button>
            </Box>
          </Box>
        </Zoom>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))} 
          message={snackbar.message} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              borderRadius: 2,
              fontWeight: 500
            }
          }}
        />
      </Box>
    </AdminLayout>
  );
};

export default StudentDetailPage;