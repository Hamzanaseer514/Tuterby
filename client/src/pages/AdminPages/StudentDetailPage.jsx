import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/components/AdminLayout";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  Snackbar,
  Button,
  Tooltip,
  Stack,
  Badge,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead
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
import { styled } from "@mui/material/styles";
import { useSubject } from "../../hooks/useSubject";
import { BASE_URL } from "../../config";
import {
  User,
} from 'lucide-react';

const StatusBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 6,
    top: 6,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px"
  }
}));

const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 24px 0 rgba(0,0,0,0.1)"
  }
}));

const StudentDetailPage = () => {
  const { tabValue } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { subjects, academicLevels } = useSubject();

  const getSubjectName = (id) => {
    const subject = subjects.find((s) => s._id === id);
    return subject ? subject : "";
  };
  const getAcademicLevel = (level) => {
    const matchedLevel = academicLevels.find(l => l._id === level);
    if(matchedLevel){
      return matchedLevel;
    }
    return null;
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          textAlign: "center"
        }}
      >
        <Cancel color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="textSecondary" gutterBottom>
          User not found
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
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
  const userParent = user?.parent || "No parent provided";
  const userSubjects = user?.subjects || [];
  const academicLevel = user?.academic_level;
  const userSessionsCompleted = user?.sessionsCompleted || 0;
  const userStatus = user?.status || "inactive";

  const handleToggleActive = async () => {
    try {
      setIsUpdating(true);
      const next = userStatus === "active" ? "inactive" : "active";
      setUser((prev) => ({ ...prev, status: next }));
      const { updateUserStatus } = await import("../../services/adminService");
      await updateUserStatus(user.id || user.user_id || user._id, next);
      setSnackbar({
        open: true,
        message: `User ${next === "active" ? "activated" : "deactivated"}.`,
        severity: "success"
      });
    } catch (e) {
      setUser((prev) => ({ ...prev, status: userStatus }));
      setSnackbar({
        open: true,
        message: "Failed to update status.",
        severity: "error"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <AdminLayout tabValue={tabValue}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Go back">
              <IconButton
                onClick={() => navigate("/admin/users", { state: { preserveData: true, tabValue } })}
                sx={{
                  mr: 2,
                  backgroundColor: "action.hover",
                  "&:hover": { backgroundColor: "action.selected" }
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" fontWeight={700}>
              {userName}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/users", { state: { preserveData: true, tabValue } })}
            sx={{ textTransform: "none", borderRadius: 2, px: 3, py: 1 }}
          >
            Back to Users
          </Button>
        </Box>

        {/* Profile Card */}
        <DetailCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Top Row: Avatar + Name on left, Action on right */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              {/* Avatar + Name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <StatusBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <Tooltip title={userStatus === "active" ? "Active" : "Inactive"}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          bgcolor: userStatus === "active" ? "success.main" : "error.main",
                          border: "2px solid white",
                          boxShadow: 1,
                        }}
                      />
                    </Tooltip>
                  }
                >
                                   <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {user.photo_url ? (
                        <img
                          src={`${BASE_URL}${user.photo_url}`}
                          alt="Profile"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                </StatusBadge>

                {/* Name */}
                <Typography variant="h5" fontWeight={700} sx={{ color: "primary.main" }}>
                  {userName}
                </Typography>
              </Box>

              {/* Action Button (Top Right Corner) */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant={userStatus === "active" ? "outlined" : "contained"}
                  color={userStatus === "active" ? "error" : "success"}
                  onClick={handleToggleActive}
                  disabled={isUpdating}
                  startIcon={userStatus === "active" ? <Cancel /> : <CheckCircle />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    minWidth: 120,
                  }}
                >
                  {userStatus === "active" ? "Deactivate" : "Activate"}
                </Button>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Stack>
            </Box>

            {/* Info Table (below avatar + name) */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Parent</strong></TableCell>
                    <TableCell><strong>Join Date</strong></TableCell>
                    <TableCell><strong>Last Active</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{userEmail}</TableCell>
                    <TableCell>{userPhone}</TableCell>
                    <TableCell>{userParent.name || "No Parent Linked"}</TableCell>
                    <TableCell>{formatDate(userJoinDate)}</TableCell>
                    <TableCell>{formatDate(userLastActive)}</TableCell>
                    <TableCell>
                      <Chip
                        label={userStatus === "active" ? "Active" : "Inactive"}
                        color={userStatus === "active" ? "success" : "error"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </DetailCard>


        {/* Academic & Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
          <DetailCard >
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Academic Info
                </Typography>

                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Academic Level</strong></TableCell>
                        <TableCell><strong>Subjects</strong></TableCell>
                        <TableCell><strong>Sessions Completed</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
  {getAcademicLevel(academicLevel)?.level || "N/A"}
</TableCell>
                        <TableCell>
                          {userSubjects.length > 0 ? (
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {userSubjects.map((subject, idx) => (
                                <Chip
                                  key={`${subject}-${idx}`}
                                  label={getSubjectName(subject).name}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                />
                              ))}
                            </Stack>
                          ) : (
                            "No subjects"
                          )}
                        </TableCell>
                        <TableCell>{userSessionsCompleted}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </DetailCard>

          </Grid>

        </Grid>

     

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          message={snackbar.message}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{
            "& .MuiSnackbarContent-root": {
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
