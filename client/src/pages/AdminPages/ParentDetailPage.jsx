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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Zoom,
  Avatar,
  IconButton,
  Chip,
  Snackbar,
  Button,
} from "@mui/material";
import {
  ContactMail,
  Person,
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
} from "@mui/icons-material";

const ParentDetailPage = () => {
  const { tabValue } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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

  const getTabIcon = (currentTab) => {
    switch (currentTab) {
      case "tutors":
        return <Person />;
      case "students":
        return <Person />;
      case "parents":
        return <ContactMail />;
      default:
        return <Person />;
    }
  };

  return (
    <AdminLayout tabValue={tabValue}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getTabIcon(tabValue)}
              <Typography variant="h4" sx={{ ml: 1 }}>
                {userName}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Zoom in timeout={400}>
          <Box>
            <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Avatar sx={{ width: 80, height: 80, mb: 2, background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)", fontSize: "2rem", fontWeight: "bold" }}>
                        {userName.charAt(0)}
                      </Avatar>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {userName}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Email color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Email" secondary={userEmail} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Phone" secondary={userPhone} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Location" secondary={userLocation} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Joined" secondary={userJoinDate} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Work color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Last Active" secondary={userLastActive} />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Children
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {userChildren.map((child, idx) => (
                          <Chip key={`${child}-${idx}`} label={child} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Sessions Booked
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {userSessionsBooked}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}>
              <Button onClick={() => navigate("/admin/users")} variant="outlined" sx={{ minHeight: 48, minWidth: 120, px: 3, py: 1.5, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", userSelect: "none" }}>
                Back
              </Button>
            </Box>
          </Box>
        </Zoom>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      </Box>
    </AdminLayout>
  );
};

export default ParentDetailPage;


