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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Edit,
} from "@mui/icons-material";
import { useSubject } from '../../hooks/useSubject';
import { useAdminDashboard } from "../../contexts/AdminDashboardContext";

const ParentDetailPage = () => {
  const { tabValue } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleTabChange = (newTabValue) => {
    if (newTabValue === 'dashboard') {
      navigate('/admin');
    } else if (['tutors', 'students', 'parents'].includes(newTabValue)) {
      navigate(`/admin/users?tab=${newTabValue}`);
    } else if (newTabValue === 'chat') {
      navigate('/admin/chats');
    } else if (newTabValue === 'tutor-sessions') {
      navigate('/admin/tutor-sessions');
    } else if (newTabValue === 'tutor-payments') {
      navigate('/admin/tutor-payments');
    } else if (newTabValue === 'tutor-reviews') {
      navigate('/admin/tutor-reviews');
    } else if (newTabValue === 'settings') {
      navigate('/admin/settings');
    }
  };
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const { subjects, academicLevels } = useSubject();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userStatus, setUserStatus] = useState(user?.status || "inactive");
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateUserInList, refreshUserData } = useAdminDashboard();
  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  
  // Removed unnecessary refresh on mount - data is already available from navigation state
  useEffect(() => {
    if (!user) setLoading(false);
    else {
      setUserStatus(user.status || "inactive");
    }
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
  const userLocation = user?.location || "No location provided";
  const userJoinDate = user?.joinDate || "Unknown";
  const userLastActive = user?.lastActive || "Unknown";
  const userChildren = user?.children || [];
  const userSessionsBooked = user?.sessionsBooked || 0;
  const openEditDialog = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
    });
    setEditOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      setSavingEdit(true);
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.location,
      };
      const res = await fetch(`${BASE_URL}/api/admin/parents/${user.id || user.user_id || user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSnackbar({ open: true, message: data.message || 'Failed to update parent', severity: 'error' });
        return;
      }
      // Optimistic local update
      const updated = {
        ...user,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
      };
      setUser(updated);
      updateUserInList('parents', updated);
      setSnackbar({ open: true, message: 'Parent details updated successfully', severity: 'success' });
      setEditOpen(false);
    } catch (_) {
      setSnackbar({ open: true, message: 'Failed to update parent', severity: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };


  const handleToggleActive = async () => {
    try {
      setIsUpdating(true);
      const next = userStatus === "active" ? "inactive" : "active";
      const updatedUser = { ...user, status: next };
      setUser(updatedUser);
      
      // Update the user in the admin dashboard context
      updateUserInList('parents', updatedUser);
      
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

  return (
    <AdminLayout tabValue={tabValue} onTabChange={handleTabChange}>
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
            <IconButton onClick={() => {
              // Smart refresh - only refresh if data might be stale
              refreshUserData('parents');
              navigate("/admin/users?tab=parents", { state: { preserveData: true, tabValue } });
            }} sx={{ mr: 1 }}>
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
                          src={user.photo_url}
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
              {/* Actions */}
             <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={openEditDialog}
                  sx={{
                    borderRadius: '9999px',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: 'primary.dark', backgroundColor: 'transparent' }
                  }}
                  startIcon={<Edit sx={{ color: 'primary.main' }} />}
                >
                  Edit Details
                </Button>
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
                    <TableCell>
                      <strong>Location</strong>
                    </TableCell>
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
                    <TableCell>{userLocation}</TableCell>
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
            <TableCell>{getAcademicLevel(child.academic_level)?.level || "N/A"}</TableCell>
            <TableCell>
        {child.preferred_subjects && child.preferred_subjects.length > 0 ? (
          child.preferred_subjects.map((subId, i) => (
            <Chip
              key={i}
              label={getSubjectName(subId)?.name || "N/A"}
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
            onClick={() => {
              refreshUserData('parents');
              navigate("/admin/users?tab=parents", { state: { preserveData: true, tabValue } });
            }}
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

      {/* Edit Parent Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Parent Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Full Name" value={editForm.name} onChange={(e) => handleEditChange('name', e.target.value)} fullWidth />
            <TextField label="Email" value={editForm.email} onChange={(e) => handleEditChange('email', e.target.value)} type="email" fullWidth />
            <TextField label="Phone" value={editForm.phone} onChange={(e) => handleEditChange('phone', e.target.value)} fullWidth />
            <TextField label="Location" value={editForm.location} onChange={(e) => handleEditChange('location', e.target.value)} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={savingEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={savingEdit}>
            {savingEdit ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default ParentDetailPage;
