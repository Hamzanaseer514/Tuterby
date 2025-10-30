import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/components/AdminLayout";
import { Alert } from "@mui/material";
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
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
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
  MoreVert,
  Edit,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useSubject } from "../../hooks/useSubject";
import { BASE_URL } from "../../config";
import {
  User,
} from 'lucide-react';
import { useAdminDashboard } from "../../contexts/AdminDashboardContext";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { subjects, academicLevels } = useSubject();
  const { updateUserInList, refreshUserData } = useAdminDashboard();
  // Edit details
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", location: "" });
  // Edit education
  const [eduOpen, setEduOpen] = useState(false);
  const [savingEdu, setSavingEdu] = useState(false);
  const [levelId, setLevelId] = useState("");
  const [selSubjects, setSelSubjects] = useState([]);

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
        <Button variant="contained" onClick={() => {
          refreshUserData('students');
          navigate("/admin/users?tab=students", { state: { preserveData: true, tabValue } });
        }} sx={{ mt: 2 }}>
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
  const openEditDialog = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
    });
    setEditOpen(true);
  };

  const handleEditChange = (field, value) => setEditForm((p) => ({ ...p, [field]: value }));

  const handleSaveEdit = async () => {
    try {
      setSavingEdit(true);
      const payload = { ...editForm };
      const res = await fetch(`${BASE_URL}/api/admin/students/${user.id || user.user_id || user._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSnackbar({ open: true, message: d.message || 'Failed to update student', severity: 'error' });
        return;
      }
      const updated = { ...user, ...payload };
      setUser(updated);
      updateUserInList('students', updated);
      setSnackbar({ open: true, message: 'Student details updated', severity: 'success' });
      setEditOpen(false);
    } catch (_) {
      setSnackbar({ open: true, message: 'Failed to update student', severity: 'error' });
    } finally { setSavingEdit(false); }
  };

  const openEduDialog = () => {
    setLevelId(user?.academic_level ? String(user.academic_level) : "");
    setSelSubjects(Array.isArray(user?.subjects) ? user.subjects.map(String) : []);
    setEduOpen(true);
  };

  const toggleSubject = (sid) => {
    const id = String(sid);
    setSelSubjects((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const filteredSubjects = () => {
    if (!Array.isArray(subjects) || !levelId) return [];
    return subjects.filter((s) => String(s?.level_id?._id || s?.level_id) === String(levelId));
  };

  const handleSaveEdu = async () => {
    try {
      if (!levelId) { setSnackbar({ open: true, message: 'Select academic level', severity: 'warning' }); return; }
      setSavingEdu(true);
      // Align subjects with the currently selected level on the client
      const allowed = new Set(filteredSubjects().map((s) => String(s._id)));
      const aligned = selSubjects.filter((sid) => allowed.has(String(sid)));
      const payload = { academic_level: levelId, subjects: aligned };
      const res = await fetch(`${BASE_URL}/api/admin/students/${user.id || user.user_id || user._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const deps = d?.dependencies;
        const depMsg = deps ? ` Update blocked. Links found — Sessions: ${(deps.sessionsWithPrevLevel||0)+(deps.sessionsWithRemovedSubjects||0)}, Payments: ${(deps.paymentsWithPrevLevel||0)+(deps.paymentsWithRemovedSubjects||0)}, Hires: ${(deps.hiresWithPrevLevel||0)+(deps.hiresWithRemovedSubjects||0)}.` : '';
        setSnackbar({ open: true, message: (d.message || 'Failed to update education') + depMsg, severity: 'error' });
        // Revert UI selections to persisted state since backend blocked the change
        setLevelId(user?.academic_level ? String(user.academic_level) : "");
        setSelSubjects(Array.isArray(user?.subjects) ? user.subjects.map(String) : []);
        return;
      }
      const updated = { ...user, academic_level: levelId, subjects: aligned };
      setUser(updated);
      updateUserInList('students', updated);
      setSnackbar({ open: true, message: 'Education updated', severity: 'success' });
      setEduOpen(false);
    } catch (_) {
      setSnackbar({ open: true, message: 'Failed to update education', severity: 'error' });
    } finally { setSavingEdu(false); }
  };


  const handleToggleActive = async () => {
    try {
      setIsUpdating(true);
      const next = userStatus === "active" ? "inactive" : "active";
      const updatedUser = { ...user, status: next };
      setUser(updatedUser);
      
      // Update the user in the admin dashboard context
      updateUserInList('students', updatedUser);
      
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
    <AdminLayout tabValue={tabValue} onTabChange={handleTabChange}>
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
                onClick={() => {
                  refreshUserData('students');
                  navigate("/admin/users?tab=students", { state: { preserveData: true, tabValue } });
                }}
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
            onClick={() => {
              refreshUserData('students');
              navigate("/admin/users?tab=students", { state: { preserveData: true, tabValue } });
            }}
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
                                   <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                      {user.photo_url ? (
                        <img
                          src={user.photo_url}
                          alt="Profile"
                          className="h-full w-full object-cover rounded-full transition-opacity duration-300 opacity-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
                      )}
                      {!user.photo_url && (
                        <div className="relative z-10 text-white flex items-center justify-center w-full h-full">
                          <User className="h-12 w-12" />
                        </div>
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
                  variant="outlined"
                  size="small"
                  onClick={openEduDialog}
                  sx={{
                    borderRadius: '9999px',
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    px: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: 'secondary.dark', backgroundColor: 'transparent' }
                  }}
                  startIcon={<School sx={{ color: 'secondary.main' }} />}
                >
                  Edit Education
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

            {/* Info Table (below avatar + name) */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Parent</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
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
                    <TableCell>{userLocation}</TableCell>
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
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 2 }}
        >
          <Alert elevation={3} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity || 'info'} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      {/* Edit Student Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Student Details</DialogTitle>
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

      {/* Edit Education Dialog */}
      <Dialog open={eduOpen} onClose={() => setEduOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Education</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select fullWidth size="small" label="Academic Level" value={levelId} onChange={(e) => { setLevelId(e.target.value); setSelSubjects([]); }}>
              {Array.isArray(academicLevels) && academicLevels.map((lvl) => (
                <MenuItem key={lvl._id} value={String(lvl._id)}>{lvl.level}</MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Subjects (filtered by level)</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 240, overflowY: 'auto', p: 0.5, border: '1px solid #eee', borderRadius: 1 }}>
                {filteredSubjects().map((s) => {
                  const chosen = selSubjects.includes(String(s._id));
                  return (
                    <Chip
                      key={s._id}
                      label={s.name}
                      variant={chosen ? 'filled' : 'outlined'}
                      color={chosen ? 'primary' : 'default'}
                      onClick={() => toggleSubject(s._id)}
                      clickable
                      size="small"
                    />
                  );
                })}
                {filteredSubjects().length === 0 && (
                  <Typography variant="body2" color="text.secondary">No subjects for selected level.</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEduOpen(false)} disabled={savingEdu}>Cancel</Button>
          <Button onClick={handleSaveEdu} variant="contained" disabled={savingEdu}>
            {savingEdu ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default StudentDetailPage;
