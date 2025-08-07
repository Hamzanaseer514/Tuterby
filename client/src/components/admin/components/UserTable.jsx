import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Fade,
  Slide,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Zoom,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import {
  Visibility,
  MoreVert,
  CheckCircle,
  Pending,
  Star,
  School,
  Person,
  ContactMail,
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  Description,
  CloudDownload,
  Assignment,
  ExpandMore,
  Edit,
  Delete,
  Schedule,
  Send,
  Refresh,
  Cancel
} from '@mui/icons-material';
import {
  verifyDocument,
  getAvailableInterviewSlots,
  setAvailableInterviewSlots
} from '../../../services/adminService';

// UserDetailDialog component

const UserDetailDialog = ({
  open,
  user,
  tabValue,
  onClose
}) => {
  // Early return if no user or dialog is not open
  if (!user || !open) return null;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimes, setSelectedTimes] = useState([]); // Changed to array for multiple selection
  const [selectedTime, setSelectedTime] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [schedulingStatus, setSchedulingStatus] = useState('');

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true);
    setSlotError('');
    try {
      const slots = await getAvailableInterviewSlots(date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlotError('Failed to load available slots. Using default times.');
      // Set default slots
      setAvailableSlots([
        { date: date, time: '09:00', available: true },
        { date: date, time: '10:00', available: true },
        { date: date, time: '11:00', available: false },
        { date: date, time: '14:00', available: true },
        { date: date, time: '15:00', available: true },
        { date: date, time: '16:00', available: true }
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelection = (time) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time); // Remove if already selected
      } else {
        return [...prev, time]; // Add if not selected
      }
    });
  };

  const handleScheduleInterview = async () => {
    if (selectedTimes.length === 0) {
      setSlotError('Please select at least one time slot');
      return;
    }

    setSchedulingStatus('scheduling');
    try {
      // Create array of date-time strings for all selected times
      const scheduledDateTimes = selectedTimes.map(time => `${selectedDate}T${time}`);

      await setAvailableInterviewSlots(user.id, scheduledDateTimes, interviewNotes);
      setSchedulingStatus('success');
      setTimeout(() => {
        setSchedulingStatus('');
        setSelectedTimes([]); // Reset selection after successful scheduling
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setSchedulingStatus('error');
    }
  };


  const handleRefreshSlots = () => {
    fetchAvailableSlots(selectedDate);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTabIcon = (tabValue) => {
    switch (tabValue) {
      case 'tutors':
        return <School />;
      case 'students':
        return <Person />;
      case 'parents':
        return <ContactMail />;
      default:
        return <Person />;
    }
  };

  // Safe access to user properties
  const userName = user?.name || 'Unknown User';
  const userEmail = user?.email || 'No email provided';
  const userPhone = user?.phone || 'No phone provided';
  const userLocation = user?.location || 'No location provided';
  const userJoinDate = user?.joinDate || 'Unknown';
  const userLastActive = user?.lastActive || 'Unknown';
  const userRating = user?.rating;
  const userStatus = user?.status;
  const userDocuments = user?.documents || [];
  const userSubjects = user?.subjects || [];
  const userChildren = user?.children || [];
  const userSessionsCompleted = user?.sessionsCompleted || 0;
  const userSessionsBooked = user?.sessionsBooked || 0;
  const userApplicationNotes = user?.applicationNotes;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={onClose} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getTabIcon(tabValue)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {userName}
              </Typography>
            </Box>
          </Box>
          {userStatus && (
            <Chip
              label={userStatus}
              color={getStatusColor(userStatus)}
              variant={userStatus === 'unverified' ? 'outlined' : 'filled'}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Zoom in timeout={400}>
          <Box>
            {/* Basic Info Section */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mb: 2,
                          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {userName.charAt(0)}
                      </Avatar>
                      {userRating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Star color="warning" fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                            {userRating}/5
                          </Typography>
                        </Box>
                      )}
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
                        <ListItemText
                          primary="Email"
                          secondary={userEmail}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Phone"
                          secondary={userPhone}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Location"
                          secondary={userLocation}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Joined"
                          secondary={userJoinDate}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <Work color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Last Active"
                          secondary={userLastActive}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />
            {/* Tab-specific content */}
            {tabValue === 'tutors' && (
              <Box>
                {/* Documents Section */}
                <Accordion defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Description sx={{ mr: 1 }} />
                      <Typography variant="h6">Uploaded Documents</Typography>
                      <Badge
                        badgeContent={userDocuments.filter(d => !d.verified).length}
                        color="error"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {userDocuments.length > 0 ? (
                      <List>
                        {userDocuments.map((doc, index) => (
                          <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                            <ListItemIcon>
                              <Description color={doc.verified ? "success" : "action"} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1" fontWeight="medium">
                                    {doc.type}
                                  </Typography>
                                  {doc.verified ? (
                                    <CheckCircle color="success" fontSize="small" />
                                  ) : (
                                    <Pending color="warning" fontSize="small" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">Uploaded: {doc.uploadDate}</Typography>
                                  {doc.notes && (
                                    <Typography variant="body2" color="text.secondary">
                                      {doc.notes}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                href={doc.url}
                                target="_blank"
                                disabled={doc.url === '#'}
                                title={doc.url === '#' ? 'Document not available' : 'View document'}
                              >
                                <CloudDownload />
                              </IconButton>
                              {!doc.verified && (
                                <>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    onClick={async () => {
                                      try {
                                        await verifyDocument(user.id, doc.type);
                                        alert(`${doc.type} verified`);
                                      } catch (err) {
                                        console.error("Verification failed:", err);
                                        alert(`Failed to verify ${doc.type}`);
                                      }
                                    }}
                                  >
                                    Verify
                                  </Button>
                                </>
                              )}
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded yet.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Interview Section */}
             {/* Interview Section */}
<Accordion defaultExpanded sx={{ mb: 2 }}>
  <AccordionSummary expandIcon={<ExpandMore />}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <CalendarToday sx={{ mr: 1 }} />
      <Typography variant="h6">Interview Management</Typography>
      {user.preferredSlots.length > 0 && (
        <Chip
          label="Scheduled"
          color="info"
          size="small"
          sx={{ ml: 2 }}
        />
      )}
    </Box>
  </AccordionSummary>
  <AccordionDetails>
    <Box>
        {/* Interview Status */}
        <Card sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Interview Slot Scheduled by Admin
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {Array.isArray(user.preferredSlots) && user.preferredSlots.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
                              {user.preferredSlots.map((slot, index) => (
                                <Chip
                                  key={index}
                                  label={slot}
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                />
                              ))}
                            </Box>
                          )}

                        </Box>
                      </Card>

      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Interview Slot Booked by Tutor
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {Array.isArray(user.interviewSlots) && user.interviewSlots.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
              {user.interviewSlots.map((slot, index) => {
                const date = new Date(slot.date);
                const formattedDate = date.toLocaleDateString();
                let chipColor = 'primary';
                if (slot.completed) {
                  chipColor = slot.result ? 'success' : 'warning';
                } else if (slot.scheduled) {
                  chipColor = 'primary';
                }

                return (
                  <Chip
                    key={index}
                    label={`${formattedDate}, ${slot.time}`}
                    variant="outlined"
                    color={chipColor}
                    size="small"
                    sx={{
                      borderStyle: slot.completed ? 'solid' : 'dashed',
                      fontWeight: slot.completed ? 'bold' : 'normal'
                    }}
                    title={
                      slot.completed
                        ? `Completed: ${slot.result || 'No result yet'}`
                        : 'Scheduled interview'
                    }
                  />
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No interview slots booked yet.
            </Typography>
          )}
        </Box>
      </Card>

      {/* Show interview results when scheduled but not completed */}
      {user.interviewSlots?.some(slot => slot.scheduled) && (
        <Card sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Interview Results
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Interview Outcome</InputLabel>
                <Select
                  defaultValue=""
                  label="Interview Outcome"
                >
                  <MenuItem value="passed">Passed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="conditional">Conditional Pass</MenuItem>
                  <MenuItem value="reschedule">Needs Reschedule</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interview Score"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                defaultValue=""
                helperText="Score out of 100"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interview Feedback"
                multiline
                rows={4}
                placeholder="Add detailed feedback about the interview..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  alert('Interview results saved successfully!');
                }}
              >
                Save Interview Results
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}
{console.log("user", user)}
      {/* Schedule Interview Form - only show if no scheduled interviews */}
      {!user.interviewSlots?.some(slot => slot.scheduled) && user.interviewSlots === "Passed" && (
        <Card sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Schedule Interview
          </Typography>

          {/* Status Messages */}
          {schedulingStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Interview scheduled successfully!
            </Alert>
          )}
          {schedulingStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to schedule interview. Please try again.
            </Alert>
          )}
          {slotError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {slotError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interview Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Available Slots for {selectedDate}
                {selectedTimes.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({selectedTimes.length} selected)
                  </Typography>
                )}
              </Typography>
              {loadingSlots ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} variant="rectangular" width={80} height={32} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {availableSlots.map((slot, index) => (
                    <Chip
                      key={index}
                      label={slot.time}
                      color={
                        selectedTimes.includes(slot.time)
                          ? 'primary'
                          : slot.available ? 'default' : 'default'
                      }
                      variant={
                        selectedTimes.includes(slot.time)
                          ? 'filled'
                          : slot.available ? 'outlined' : 'outlined'
                      }
                      onClick={() => slot.available && handleTimeSelection(slot.time)}
                      sx={{
                        cursor: slot.available ? 'pointer' : 'default',
                        opacity: slot.available ? 1 : 0.5
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {selectedTimes.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Selected Times:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedTimes.map((time, index) => (
                    <Chip
                      key={index}
                      label={time}
                      color="primary"
                      onDelete={() => handleTimeSelection(time)}
                      deleteIcon={<Cancel />}
                      sx={{
                        '& .MuiChip-deleteIcon': {
                          color: 'primary.main',
                          fontSize: '1.2rem'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Schedule />}
                  onClick={handleScheduleInterview}
                  disabled={schedulingStatus === 'scheduling'}
                >
                  {schedulingStatus === 'scheduling' ? 'Scheduling...' : 'Schedule Interview'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  </AccordionDetails>
</Accordion>


                {/* Application Notes */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Assignment sx={{ mr: 1 }} />
                      <Typography variant="h6">Application Notes</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {userApplicationNotes || 'No application notes available.'}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {tabValue === 'students' && (
              <Box>
                <Typography variant="h6" gutterBottom>Student Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Subjects
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {userSubjects.map(subject => (
                            <Chip key={subject} label={subject} size="small" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Sessions Completed
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {userSessionsCompleted}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 'parents' && (
              <Box>
                <Typography variant="h6" gutterBottom>Parent Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Children
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {userChildren.map(child => (
                            <Chip key={child} label={child} size="small" />
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
            )}
          </Box>
        </Zoom>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {tabValue === 'tutors' && userStatus !== 'verified' && (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              // Handle approve tutor
              onClose();
            }}
            disabled={
              !userDocuments.every(d => d.verified) ||
              !user.is_background_checked ||
              !user.is_reference_verified ||
              !user.is_qualification_verified
            }
          >
            Approve Tutor
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const UserTableRow = ({ user, tabValue, statusColors, onViewUser, onMenuClick, index }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle color="success" fontSize="small" />;
      case 'pending':
        return <Pending color="warning" fontSize="small" />;
      default:
        return <Pending color="action" fontSize="small" />;
    }
  };

  const getTabIcon = (tabValue) => {
    switch (tabValue) {
      case 'tutors':
        return <School fontSize="small" />;
      case 'students':
        return <Person fontSize="small" />;
      case 'parents':
        return <ContactMail fontSize="small" />;
      default:
        return <Person fontSize="small" />;
    }
  };

  return (
    <Slide direction="up" in timeout={300 + index * 50}>
      <TableRow
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            cursor: 'pointer'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                mr: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontWeight="medium" variant="body1">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {user.location}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        {tabValue === 'tutors' && (
          <>
            <TableCell>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Array.isArray(user.subjects) ? (
                  user.subjects.map(subject => (
                    <Chip
                      key={subject}
                      label={subject}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.7rem',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {user.subjects || 'No subjects'}
                  </Typography>
                )}
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(user.status)}
                <Chip
                  label={user.status}
                  color={statusColors[user.status]}
                  size="small"
                  variant={user.status === 'unverified' ? 'outlined' : 'filled'}
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {user.documents?.filter(d => d.verified).length || 0}/{user.documents?.length || 0}
                </Typography>
                {user.documents?.every(d => d.verified) ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <Pending color="warning" fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell>
              <Tooltip title={user.interviewCompleted ? "Interview completed" : "Interview pending"}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTabIcon(tabValue)}
                  {user.interviewCompleted ? (
                    <CheckCircle color="success" sx={{ ml: 1 }} />
                  ) : (
                    <Pending color="warning" sx={{ ml: 1 }} />
                  )}
                </Box>
              </Tooltip>
            </TableCell>
          </>
        )}

        {tabValue === 'students' && (
          <>
            <TableCell>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.subjects?.map(subject => (
                  <Chip
                    key={subject}
                    label={subject}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      borderColor: 'success.main',
                      color: 'success.main'
                    }}
                  />
                ))}
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight="medium">
                {user.sessionsCompleted || 0}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Star color="warning" fontSize="small" />
                <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                  {user.rating || 'N/A'}
                </Typography>
              </Box>
            </TableCell>
          </>
        )}

        {tabValue === 'parents' && (
          <>
            <TableCell>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.children?.map(child => (
                  <Chip
                    key={child}
                    label={child}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      borderColor: 'info.main',
                      color: 'info.main'
                    }}
                  />
                ))}
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight="medium">
                {user.sessionsBooked || 0}
              </Typography>
            </TableCell>
          </>
        )}

        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                onClick={() => onViewUser(user)}

                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            {tabValue === 'tutors' && (
              <Tooltip title="More Actions">
                <IconButton
                  onClick={(e) => onMenuClick(e, user)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </Slide>
  );
};

const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <TableRow key={index}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton variant="text" width="100%" height={20} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const UserTable = ({
  users,
  tabValue,
  page,
  rowsPerPage,
  statusColors,
  onViewUser,
  onMenuClick,
  onChangePage,
  onChangeRowsPerPage,
  loading = false
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = useState(null);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleMenuClick = (event, user) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuUser(null);
  };

  const handleMenuAction = (action) => {

    switch (action) {
      case 'view':
        handleViewUser(selectedMenuUser);
        break;
      case 'approve':
        // Handle approve action
        break;
      case 'reject':
        // Handle reject action
        break;
      case 'edit':
        // Handle edit action
        break;
      case 'delete':
        break;
      default:
        break;
    }

    handleMenuClose();
  };

  const getTableHeaders = () => {
    const baseHeaders = ['User'];

    if (tabValue === 'tutors') {
      return [...baseHeaders, 'Subjects', 'Status', 'Documents', 'Interview', 'Actions'];
    } else if (tabValue === 'students') {
      return [...baseHeaders, 'Subjects', 'Sessions', 'Rating', 'Actions'];
    } else if (tabValue === 'parents') {
      return [...baseHeaders, 'Children', 'Sessions Booked', 'Actions'];
    }

    return [...baseHeaders, 'Actions'];
  };

  return (
    <Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              {getTableHeaders().map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    borderBottom: '2px solid #e0e0e0'
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={getTableHeaders().length} />
            ) : (
              users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    tabValue={tabValue}
                    statusColors={statusColors}
                    onViewUser={handleViewUser}
                    onMenuClick={handleMenuClick}
                    index={index}
                  />
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontWeight: 'medium'
          }
        }}
      />

      {/* User Detail Dialog */}
      <UserDetailDialog
        open={dialogOpen}
        user={selectedUser}
        tabValue={tabValue}
        onClose={handleCloseDialog}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        {tabValue === 'tutors' && (
          <>
            <MenuItem
              onClick={() => handleMenuAction('approve')}
              disabled={selectedMenuUser?.status === 'verified'}
            >
              <CheckCircle sx={{ mr: 1 }} /> Approve
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuAction('reject')}
              disabled={selectedMenuUser?.status === 'rejected'}
            >
              <Pending sx={{ mr: 1 }} /> Reject
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('edit')}>
              <Edit sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => handleMenuAction('delete')}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </>
        )}
        {tabValue !== 'tutors' && (
          <>
            <MenuItem onClick={() => handleMenuAction('edit')}>
              <Edit sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => handleMenuAction('delete')}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default UserTable; 