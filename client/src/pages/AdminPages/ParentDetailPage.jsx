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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import { BASE_URL } from "../../config";
import {
  User,
} from 'lucide-react';
import {
  ContactMail,
  Person,
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  CheckCircle,
  Cancel,
  MoreVert,
} from "@mui/icons-material";
import { useSubject } from '../../hooks/useSubject';

const ParentDetailPage = () => {
  const { tabValue } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const { subjects, academicLevels } = useSubject();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userStatus, setUserStatus] = useState("active"); // example toggle state

  useEffect(() => {
    if (!user) setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading user details...</Typography>
      </Box>
    );
  }

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject: '';
  }
  
  const getAcademicLevel = (level) => {
    if(level){
    const matchedLevel = academicLevels.find(l => l._id === level.toString());
    if(matchedLevel){
      return matchedLevel;
    }
    return null;
  }
}
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>User not found</Typography>
      </Box>
    );
  }

  const userName = user?.name || "Unknown User";
  const userEmail = user?.email || "No email provided";
  const userPhone = user?.phone || "No phone provided";
  const userJoinDate = user?.joinDate || "Unknown";
  const userLastActive = user?.lastActive || "Unknown";
  const userChildren = user?.children || [];
  const userSessionsBooked = user?.sessionsBooked || 0;

  const handleToggleActive = () => {
    setUserStatus((prev) => (prev === "active" ? "inactive" : "active"));
  };

  return (
    <AdminLayout tabValue={tabValue}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header with Back Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => navigate("/admin/users?tab=parents", { state: { preserveData: true, tabValue } })} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4">{userName}</Typography>
          </Box>
        </Box>

        {/* Profile Card */}
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          }}
        >
          <CardContent>
            {/* Top Row: Avatar + Name + Actions */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                mb: 2,
              }}
            >
              {/* Avatar + Name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
               
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
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: "primary.main" }}
                >
                    {/* <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {user?.photo_url ? (
                        <img
                          src={`${BASE_URL}${user.photo_url}`}
                          alt="Profile"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div> */}
                  {userName}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant={userStatus === "active" ? "outlined" : "contained"}
                  color={userStatus === "active" ? "error" : "success"}
                  onClick={handleToggleActive}
                  startIcon={
                    userStatus === "active" ? <Cancel /> : <CheckCircle />
                  }
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
              
              </Stack>
            </Box>

            {/* Info Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Email</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Phone</strong>
                    </TableCell>
                    {/* <TableCell>
                      <strong>Location</strong>
                    </TableCell> */}
                    <TableCell>
                      <strong>Joined</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Last Active</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{userEmail}</TableCell>
                    <TableCell>{userPhone}</TableCell>
                    {/* <TableCell>{userLocation}</TableCell> */}
                    <TableCell>{formatDate(userJoinDate)}</TableCell>
                    <TableCell>{formatDate(userLastActive)}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          userStatus === "active" ? "Active" : "Inactive"
                        }
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
        </Card>
        {/* Children + Sessions */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
              <Typography
  variant="subtitle1"
  fontWeight="medium"
  gutterBottom
>
  Children
</Typography>

{userChildren.length > 0 ? (
  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><strong>#</strong></TableCell>
          <TableCell><strong>Full Name</strong></TableCell>
          <TableCell><strong>Email</strong></TableCell>
          <TableCell><strong>Academic Level</strong></TableCell>
          <TableCell><strong>Subjects</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {userChildren.map((child, idx) => (
          <TableRow key={child.id || idx}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{child.user_id.full_name || "N/A"}</TableCell>
            <TableCell>{child.user_id.email || "N/A"}</TableCell>
            <TableCell>{getAcademicLevel(child.academic_level).level || "N/A"}</TableCell>
            <TableCell>
        {child.preferred_subjects && child.preferred_subjects.length > 0 ? (
          child.preferred_subjects.map((subId, i) => (
            <Chip
              key={i}
              label={getSubjectName(subId).name}
              size="small"
              sx={{ mr: 0.5 }}
            />
          ))
        ) : (
          "N/A"
        )}
      </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
) : (
  <Typography variant="body2" color="text.secondary">
    No children linked
  </Typography>
)}


              </CardContent>
            </Card>
          </Grid>
      
        </Grid>

        {/* Back Button */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 3,
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => navigate("/admin/users?tab=parents", { state: { preserveData: true, tabValue } })}
            variant="outlined"
            sx={{
              minHeight: 48,
              minWidth: 120,
              px: 3,
              py: 1.5,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Back
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          message={snackbar.message}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Box>
    </AdminLayout>
  );
};

export default ParentDetailPage;
