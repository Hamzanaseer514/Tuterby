import React, { useState, useEffect } from 'react';
import {
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Alert,
  Avatar,
  Typography,
  Box,
  IconButton,
  Skeleton
} from '@mui/material';
import { Fade, Chip, MenuItem } from '@mui/material';
import {
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
  Schedule,
  Cancel
} from '@mui/icons-material';
import {
  verifyDocument,
  getAvailableInterviewSlots,
  setAvailableInterviewSlots,
  approveTutorProfile,
  rejectTutorProfile,
  partialApproveTutor
} from '../../../services/adminService';

const UserDetailDialog = ({ open, user, tabValue, onClose, onMutateSuccess, showNotification }) => {
  if (!user || !open) return null;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [schedulingStatus, setSchedulingStatus] = useState('');
  const [isInterview, setIsInterview] = useState(
    Boolean(user?.is_interview || (user?.interviewSlots || []).some((s) => s.is_interview))
  );
  const [profileStatusReason, setProfileStatusReason] = useState(user?.profileStatusReason || '');
  const [localUser, setLocalUser] = useState(user);
  const handleInterviewToggle = async (event) => {
    const newValue = event.target.checked;
    setIsInterview(newValue);
    try {
      await fetch(`/api/admin/tutors/${user.id}/interview-toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_interview: newValue }),
      });
      // reflect immediately in local state
      setLocalUser(prev => ({
        ...prev,
        interviewSlots: Array.isArray(prev?.interviewSlots)
          ? prev.interviewSlots.map(s => ({ ...s, is_interview: newValue }))
          : [{ date: new Date().toISOString(), time: '', is_interview: newValue }]
      }));
      if (showNotification) showNotification('Interview toggle updated');
      if (typeof onMutateSuccess === 'function') onMutateSuccess();
    } catch (error) {
      console.error('Failed to update interview toggle:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    setProfileStatusReason(user?.profileStatusReason || '');
    setLocalUser(user);
    setIsInterview(Boolean(user?.is_interview || (user?.interviewSlots || []).some((s) => s.is_interview)));
  }, [user]);

  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true);
    setSlotError('');
    try {
      const slots = await getAvailableInterviewSlots(date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlotError('Failed to load available slots. Using default times.');
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
    setSelectedTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]));
  };

  const handleScheduleInterview = async () => {
    if (selectedTimes.length === 0) {
      setSlotError('Please select at least one time slot');
      return;
    }
    setSchedulingStatus('scheduling');
    try {
      const scheduledDateTimes = selectedTimes.map((time) => `${selectedDate}T${time}`);
      await setAvailableInterviewSlots(user.id, scheduledDateTimes, interviewNotes);
      setSchedulingStatus('success');
      // reflect locally: mark a scheduled slot
      setLocalUser(prev => ({
        ...prev,
        interviewSlots: scheduledDateTimes.map(dt => {
          const [dateStr, time] = dt.split('T');
          return { date: dateStr, time, scheduled: true, is_interview: true };
        })
      }));
      if (showNotification) showNotification('Interview scheduled', 'success');
      if (typeof onMutateSuccess === 'function') onMutateSuccess();
      setTimeout(() => {
        setSchedulingStatus('');
        setSelectedTimes([]);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setSchedulingStatus('error');
    }
  };

  const handleApproveTutor = async () => {
    const res = await approveTutorProfile(user.id, profileStatusReason);
    if (res.status === 400) {
      alert(res.data.message);
    } else if (res.status === 200) {
      alert('Tutor profile approved successfully And Email Sent to Tutor');
      setLocalUser(prev => ({ ...prev, status: 'verified' }));
      if (showNotification) showNotification('Tutor approved', 'success');
      if (typeof onMutateSuccess === 'function') onMutateSuccess();
    }
  };

  const handlePartialApproveTutor = async () => {
    const res = await partialApproveTutor(user.id, profileStatusReason);
    if (res.status === 400) {
      alert(res.data.message);
    } else if (res.status === 200) {
      alert('Tutor profile partially approved successfully And Email Sent to Tutor');
      setLocalUser(prev => ({ ...prev, status: 'pending' }));
      if (showNotification) showNotification('Tutor partially approved', 'info');
      if (typeof onMutateSuccess === 'function') onMutateSuccess();
    } else {
      alert(res.data.message);
    }
  };

  const handleRejectTutor = async () => {
    const res = await rejectTutorProfile(user.id, profileStatusReason);
    if (res.status === 400) {
      alert(res.data.message);
    } else if (res.status === 200) {
      alert('Tutor profile rejected successfully And Email Sent to Tutor');
      setLocalUser(prev => ({ ...prev, status: 'rejected' }));
      if (showNotification) showNotification('Tutor rejected', 'warning');
      if (typeof onMutateSuccess === 'function') onMutateSuccess();
    } else {
      alert(res.data.message);
    }
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

  const getTabIcon = (currentTab) => {
    switch (currentTab) {
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

  const userName = localUser?.name || 'Unknown User';
  const userEmail = localUser?.email || 'No email provided';
  const userPhone = localUser?.phone || 'No phone provided';
  const userLocation = localUser?.location || 'No location provided';
  const userJoinDate = localUser?.joinDate || 'Unknown';
  const userLastActive = localUser?.lastActive || 'Unknown';
  const userRating = localUser?.rating;
  const userStatus = localUser?.status;
  const userDocuments = localUser?.documents || [];
  const userSubjects = localUser?.subjects || [];
  const userChildren = localUser?.children || [];
  const userSessionsCompleted = localUser?.sessionsCompleted || 0;
  const userSessionsBooked = localUser?.sessionsBooked || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth TransitionComponent={Fade} transitionDuration={300}>
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
            <Chip label={userStatus} color={getStatusColor(userStatus)} variant={userStatus === 'unverified' ? 'outlined' : 'filled'} />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Zoom in timeout={400}>
          <Box>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar sx={{ width: 80, height: 80, mb: 2, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', fontSize: '2rem', fontWeight: 'bold' }}>
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
                        <ListItemText primary="Email" secondary={userEmail} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Phone" secondary={userPhone} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Location" secondary={userLocation} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Joined" secondary={userJoinDate} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Work color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Last Active" secondary={userLastActive} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }} />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />

            {tabValue === 'tutors' && (
              <Box>
                <Accordion defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Description sx={{ mr: 1 }} />
                      <Typography variant="h6">Uploaded Documents</Typography>
                      <Badge badgeContent={userDocuments.filter((d) => !d.verified).length} color="error" sx={{ ml: 2 }} />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {userDocuments.length > 0 ? (
                      <List>
                        {userDocuments.map((doc, index) => (
                          <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                            <ListItemIcon>
                              <Description color={doc.verified ? 'success' : 'action'} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1" fontWeight="medium">
                                    {doc.type}
                                  </Typography>
                                  {doc.verified ? <CheckCircle color="success" fontSize="small" /> : <Pending color="warning" fontSize="small" />}
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
                              <IconButton size="small" href={doc.url} target="_blank" disabled={doc.url === '#'} title={doc.url === '#' ? 'Document not available' : 'View document'}>
                                <CloudDownload />
                              </IconButton>

                              {!doc.verified && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={async () => {
                                    try {
                                      await verifyDocument(user.id, doc.type);
                                      // update local document verified flag
                                      setLocalUser(prev => ({
                                        ...prev,
                                        documents: (prev?.documents || []).map(d =>
                                          d.type === doc.type ? { ...d, verified: true } : d
                                        )
                                      }));
                                      if (showNotification) showNotification(`${doc.type} verified`, 'success');
                                      if (typeof onMutateSuccess === 'function') onMutateSuccess();
                                    } catch (err) {
                                      console.error('Verification failed:', err);
                                      alert(`Failed to verify ${doc.type}`);
                                    }
                                  }}
                                >
                                  Verify
                                </Button>
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

                <Accordion defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1 }} />
                        <Typography variant="h6">Interview Management</Typography>
                      </Box>
                      <FormControlLabel
                        control={<Switch checked={isInterview} onChange={handleInterviewToggle} color="primary" />}
                        label="Enable Interview"
                      />
                    </Box>
                  </AccordionSummary>
                  {isInterview && (
                    <AccordionDetails>
                      <Box>
                        <Card sx={{ mb: 2, p: 2 }}>
                          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                            Interview Slot Scheduled by Admin
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {Array.isArray(localUser.preferredSlots) && localUser.preferredSlots.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
                                {localUser.preferredSlots.map((slot, index) => (
                                  <Chip key={index} label={slot} variant="outlined" color="primary" size="small" />
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
                            {Array.isArray(localUser.interviewSlots) && localUser.interviewSlots.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
                                {localUser.interviewSlots.map((slot, index) => {
                                  const date = new Date(slot.date || slot.dateTime || slot);
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
                                      label={`${formattedDate}${slot.time ? `, ${slot.time}` : ''}`}
                                      variant="outlined"
                                      color={chipColor}
                                      size="small"
                                      sx={{ borderStyle: slot.completed ? 'solid' : 'dashed', fontWeight: slot.completed ? 'bold' : 'normal' }}
                                      title={slot.completed ? `Completed: ${slot.result || 'No result yet'}` : 'Scheduled interview'}
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

                        {localUser.interviewSlots?.some((slot) => slot.scheduled) && (
                          <Card sx={{ p: 2, mt: 2 }}>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              Interview Results
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                  <InputLabel>Interview Outcome</InputLabel>
                                  <Select defaultValue="" label="Interview Outcome">
                                    <MenuItem value="passed">Passed</MenuItem>
                                    <MenuItem value="failed">Failed</MenuItem>
                                    <MenuItem value="conditional">Conditional Pass</MenuItem>
                                    <MenuItem value="reschedule">Needs Reschedule</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Interview Score" type="number" inputProps={{ min: 0, max: 100 }} defaultValue="" helperText="Score out of 100" />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField fullWidth label="Interview Feedback" multiline rows={4} placeholder="Add detailed feedback about the interview..." />
                              </Grid>
                              <Grid item xs={12}>
                                <Button variant="contained" color="success" onClick={() => alert('Interview results saved successfully!')}>
                                  Save Interview Results
                                </Button>
                              </Grid>
                            </Grid>
                          </Card>
                        )}

                        {!localUser.interviewSlots?.some((slot) => slot.scheduled) && (
                          <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              Schedule Interview
                            </Typography>

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
                                  InputLabelProps={{ shrink: true }}
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
                                        color={selectedTimes.includes(slot.time) ? 'primary' : 'default'}
                                        variant={selectedTimes.includes(slot.time) ? 'filled' : 'outlined'}
                                        onClick={() => slot.available && handleTimeSelection(slot.time)}
                                        sx={{ cursor: slot.available ? 'pointer' : 'default', opacity: slot.available ? 1 : 0.5 }}
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
                                        sx={{ '& .MuiChip-deleteIcon': { color: 'primary.main', fontSize: '1.2rem' } }}
                                      />
                                    ))}
                                  </Box>
                                </Grid>
                              )}
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <TextField
                                    fullWidth
                                    label="Notes for Tutor (optional)"
                                    multiline
                                    minRows={2}
                                    value={interviewNotes}
                                    onChange={(e) => setInterviewNotes(e.target.value)}
                                  />
                                  <Button variant="contained" startIcon={<Schedule />} onClick={handleScheduleInterview} disabled={schedulingStatus === 'scheduling'}>
                                    {schedulingStatus === 'scheduling' ? 'Scheduling...' : 'Schedule Interview'}
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                          </Card>
                        )}
                      </Box>
                    </AccordionDetails>
                  )}
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Assignment sx={{ mr: 1 }} />
                      <Typography variant="h6">Application Notes</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      label="Application Notes"
                      value={profileStatusReason}
                      required
                      multiline
                      rows={4}
                      onChange={(e) => setProfileStatusReason(e.target.value)}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {tabValue === 'students' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Student Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Subjects
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {userSubjects.map((subject) => (
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
                <Typography variant="h6" gutterBottom>
                  Parent Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Children
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {userChildren.map((child) => (
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
        {tabValue === 'tutors' && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handlePartialApproveTutor}
            sx={{ '&:hover': { backgroundColor: 'primary.main', color: 'white' } }}
          >
            Partial Approve Tutor
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={handleRejectTutor} variant="contained" color="error">
          Reject Tutor
        </Button>
        {tabValue === 'tutors' && localUser.status !== 'active' ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleApproveTutor}
            disabled={
              !userDocuments.every((d) => d.verified) || !localUser.backgroundCheck || !localUser.referenceCheck || !localUser.qualificationCheck
            }
          >
            Approve Tutor
          </Button>
        ) : (
          <Button variant="contained" color="success">
            Tutor is verified
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailDialog;


