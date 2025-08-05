import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  TextareaAutosize,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  FilterList,
  Search,
  CheckCircle,
  Cancel,
  Pending,
  Verified,
  Gavel,
  School,
  ContactMail,
  CalendarToday,
  MoreVert,
  Edit,
  Visibility,
  Delete,
  ArrowBack,
  ExpandMore,
  Description,
  Person,
  Work,
  Assignment,
  Schedule,
  Today,
  WatchLater,
  CloudDownload,
  Add,
  Event,
  Assessment,
  Notifications,
  Email,
  Phone,
  LocationOn,
  Star,
  StarBorder,
  AccessTime,
  CheckBox,
  CheckBoxOutlineBlank
} from '@mui/icons-material';

// Import admin service
import {
  getDashboardStats,
  getAllUsers,
  getTutorDetails,
  scheduleInterview,
  completeInterview,
  updateApplicationNotes,
  approveTutor,
  rejectTutor,
  verifyBackgroundCheck,
  verifyReferenceChecks,
  verifyQualifications,
  getAvailableInterviewSlots,
  setAvailableInterviewSlots,
} from '../../services/adminService';

// Mock data functions for fallback
// const getMockDashboardStats = () => {
//   return Promise.resolve({
//     tutors: {
//       total: 25,
//       pending: 8,
//       verified: 17
//     },
//     students: {
//       total: 150
//     },
//     parents: {
//       total: 120
//     },
//     interviews: {
//       pending: 5
//     }
//   });
// };

// const getMockUsers = (userType = 'tutors') => {
//   const mockData = {
//     tutors: [
//       {
//         id: 1,
//         name: 'Dr. Sarah Johnson',
//         email: 'sarah.johnson@example.com',
//         phone: '+44 7911 123456',
//         location: 'London, UK',
//         subjects: ['Mathematics', 'Physics'],
//         status: 'pending',
//         documents: [
//           { type: 'ID Proof', url: '#', verified: true, uploadDate: '2023-05-10', notes: 'Valid passport' },
//           { type: 'Address Proof', url: '#', verified: true, uploadDate: '2023-05-12', notes: 'Utility bill verified' },
//           { type: 'Degree Certificate', url: '#', verified: true, uploadDate: '2023-05-08', notes: 'PhD Physics from Oxford' },
//           { type: 'Reference Letter 1', url: '#', verified: true, uploadDate: '2023-05-09', notes: 'Academic reference' },
//           { type: 'Reference Letter 2', url: '#', verified: false, uploadDate: '2023-05-11', notes: 'Pending verification' },
//           { type: 'Background Check', url: '#', verified: false, uploadDate: '2023-05-13', notes: 'DBS check in progress' }
//         ],
//         interviewSlots: [
//           { date: '2023-06-15', time: '14:00', scheduled: true, completed: true, result: 'Passed', notes: 'Excellent communication skills' },
//           { date: '2023-06-16', time: '11:00', scheduled: false, completed: false }
//         ],
//         preferredSlots: ['Weekdays 2-5 PM', 'Saturday mornings'],
//         backgroundCheck: false,
//         references: 1,
//         qualifications: ['PhD in Physics', 'MSc in Mathematics'],
//         interviewCompleted: true,
//         rating: 4.9,
//         profileComplete: true,
//         joinDate: '2023-01-15',
//         lastActive: '2023-06-10',
//         applicationNotes: 'Strong academic background, needs reference verification'
//       }
//     ],
//     students: [
//       {
//         id: 1,
//         name: 'Emma Thompson',
//         email: 'emma.thompson@example.com',
//         phone: '+44 7933 345678',
//         location: 'Birmingham, UK',
//         subjects: ['Mathematics', 'Chemistry'],
//         status: 'active',
//         joinDate: '2023-02-10',
//         lastActive: '2023-06-12',
//         sessionsCompleted: 15,
//         rating: 4.8
//       }
//     ],
//     parents: [
//       {
//         id: 1,
//         name: 'Michael Thompson',
//         email: 'michael.thompson@example.com',
//         phone: '+44 7944 456789',
//         location: 'Birmingham, UK',
//         children: ['Emma Thompson'],
//         status: 'active',
//         joinDate: '2023-02-10',
//         lastActive: '2023-06-12',
//         sessionsBooked: 15
//       }
//     ]
//   };

//   return Promise.resolve(mockData[userType] || []);
// };

const statusColors = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
  unverified: 'default',
  active: 'success',
  inactive: 'default'
};

const DocumentItem = ({ doc, onVerify, onReject, onAddNotes }) => (
  <ListItem>
    <ListItemIcon>
      <Description color={doc.verified ? "success" : "action"} />
    </ListItemIcon>
    <ListItemText
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {doc.type}
          {doc.verified && <CheckCircle color="success" fontSize="small" />}
          {!doc.verified && <Pending color="warning" fontSize="small" />}
        </Box>
      }
      secondary={
        <Box>
          <Typography variant="body2">Uploaded: {doc.uploadDate}</Typography>
          {doc.notes && <Typography variant="body2" color="text.secondary">{doc.notes}</Typography>}
        </Box>
      }
    />
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton 
        edge="end" 
        href={doc.url} 
        target="_blank" 
        size="small"
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
            onClick={() => onVerify(doc.type)}
          >
            Verify
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color="error"
            onClick={() => onReject(doc.type)}
          >
            Reject
          </Button>
        </>
      )}
      <Button size="small" onClick={() => onAddNotes(doc.type)}>
        Notes
      </Button>
    </Box>
  </ListItem>
);

const InterviewSlotItem = ({ slot, tutorId, onSchedule, onComplete, onAddResult }) => (
  <ListItem>
    <ListItemIcon>
      {slot.scheduled ? (
        <Schedule color={slot.completed ? "success" : "primary"} />
      ) : (
        <Today color="action" />
      )}
    </ListItemIcon>
    <ListItemText
      primary={`${slot.date} at ${slot.time}`}
      secondary={
        slot.scheduled ? 
          (slot.completed ? 
            `Completed - ${slot.result}${slot.notes ? `: ${slot.notes}` : ''}` : 
            'Scheduled'
          ) : 
          'Available'
      }
    />
    <Box sx={{ display: 'flex', gap: 1 }}>
      {!slot.scheduled && (
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => onSchedule(tutorId, slot.date, slot.time)}
        >
          Schedule
        </Button>
      )}
      {slot.scheduled && !slot.completed && (
        <Button 
          variant="contained" 
          size="small"
          onClick={() => onComplete(tutorId, slot)}
        >
          Complete
        </Button>
      )}
    </Box>
  </ListItem>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState({ tutors: [], students: [], parents: [] });
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState('tutors');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActionUser, setSelectedActionUser] = useState(null);
  const [newInterviewDate, setNewInterviewDate] = useState('');
  const [newInterviewTime, setNewInterviewTime] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showInterviewResultDialog, setShowInterviewResultDialog] = useState(false);
  const [interviewResult, setInterviewResult] = useState({ result: 'Passed', notes: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [preferredTimes, setPreferredTimes] = useState([]);
  const [showPreferredTimesDialog, setShowPreferredTimesDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    console.log("loadDashboardData");
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated - use same method as useAuth hook
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      console.log("token", token);
      if (!token) {
        setSnackbar({ open: true, message: 'Please login to access admin dashboard', severity: 'error' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      // Try to load real data first
      console.log('Loading real data from API...');
      const [statsData, usersData] = await Promise.all([
        getDashboardStats().catch(() => getMockDashboardStats()),
        getAllUsers({ userType: tabValue }).catch(() => getMockUsers(tabValue))
      ]);
      
      console.log('Real stats data:', statsData);
      console.log('Real users data:', usersData);
      
      setStats(statsData);
      setUsers(prev => ({ ...prev, [tabValue]: usersData }));
      
      setSnackbar({ open: true, message: 'Data loaded successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        setSnackbar({ open: true, message: 'Access denied. Please login with admin credentials.', severity: 'error' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setSnackbar({ open: true, message: 'Failed to load real data. Using mock data.', severity: 'warning' });
        // Load mock data as fallback
        const [statsData, usersData] = await Promise.all([
          getMockDashboardStats(),
          getMockUsers(tabValue)
        ]);
        setStats(statsData);
        setUsers(prev => ({ ...prev, [tabValue]: usersData }));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (userType) => {
    setLoading(true);
    try {
      console.log('Loading users for type:', userType);
      const usersData = await getAllUsers({ userType });
      console.log('Loaded users data:', usersData);
      setUsers(prev => ({ ...prev, [userType]: usersData }));
      
      if (usersData.length === 0) {
        setSnackbar({ open: true, message: `No ${userType} found in the database.`, severity: 'info' });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        setSnackbar({ open: true, message: 'Access denied. Please login with admin credentials.', severity: 'error' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setSnackbar({ open: true, message: `Failed to load ${userType}: ${error.message}`, severity: 'error' });
        setUsers(prev => ({ ...prev, [userType]: [] }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleViewUser = async (user) => {
    if (user.role === 'tutor' || tabValue === 'tutors') {
      try {
        console.log('Fetching detailed tutor data for:', user.id);
        const tutorDetails = await getTutorDetails(user.id);
        console.log('Received tutor details:', tutorDetails);
        setSelectedUser(tutorDetails);
      } catch (error) {
        console.error('Error fetching tutor details:', error);
        setSnackbar({ open: true, message: `Failed to load tutor details: ${error.message}`, severity: 'error' });
        setSelectedUser(user); // Fallback to list data
      }
    } else {
      setSelectedUser(user);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    loadUsers(newValue);
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedActionUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActionUser(null);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Use userId (user ID) for approve function, not tutor profile ID
      const userId = selectedActionUser.userId || selectedActionUser.id;
      await approveTutor(userId);
      await loadUsers('tutors');
      setSnackbar({ open: true, message: 'Tutor approved successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to approve tutor', severity: 'error' });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleReject = () => {
    setShowRejectionDialog(true);
    handleMenuClose();
  };

  const handleConfirmReject = async () => {
    setLoading(true);
    try {
      // Use userId (user ID) for reject function, not tutor profile ID
      const userId = selectedActionUser.userId || selectedActionUser.id;
      await rejectTutor(userId, rejectionReason);
      await loadUsers('tutors');
      setSnackbar({ open: true, message: 'Tutor rejected successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to reject tutor', severity: 'error' });
    } finally {
      setLoading(false);
      setShowRejectionDialog(false);
      setRejectionReason('');
      setSelectedActionUser(null);
    }
  };

  const handleScheduleInterview = async (tutorProfileId, date, time) => {
    setLoading(true);
    try {
      const scheduledTime = new Date(`${date}T${time}`);
      await scheduleInterview(tutorProfileId, scheduledTime.toISOString());
      // Reload tutor details
      const updatedTutor = await getTutorDetails(tutorProfileId).catch(() => null);
      if (updatedTutor) {
        setSelectedUser(updatedTutor);
      }
      setSnackbar({ open: true, message: 'Interview scheduled successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to schedule interview', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = (tutorId, slot) => {
    setSelectedSlot(slot);
    setShowInterviewResultDialog(true);
  };

  const handleSetAvailableSlots = async (tutorProfileId, slots) => {
    setLoading(true);
    try {
      // Convert slots to ISO strings for the API
      const slotTimes = slots.map(slot => {
        if (typeof slot === 'string') {
          return new Date(slot).toISOString();
        }
        return slot;
      });
      
      // Use userId (user ID) for setAvailableInterviewSlots API call
      const userId = selectedUser.userId || selectedUser.id;
      await setAvailableInterviewSlots(userId, slotTimes);
      
      // Reload tutor details using the tutor profile ID
      const updatedTutor = await getTutorDetails(tutorProfileId).catch(() => null);
      if (updatedTutor) {
        setSelectedUser(updatedTutor);
      }
      
      setSnackbar({ open: true, message: 'Preferred interview slots set successfully', severity: 'success' });
    } catch (error) {
      console.error('Error setting preferred slots:', error);
      setSnackbar({ open: true, message: 'Failed to set preferred slots: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInterviewResult = async () => {
    setLoading(true);
    try {
      await completeInterview(selectedUser.id, interviewResult.result, interviewResult.notes);
      // Reload tutor details
      const updatedTutor = await getTutorDetails(selectedUser.id).catch(() => null);
      if (updatedTutor) {
        setSelectedUser(updatedTutor);
      }
      setSnackbar({ open: true, message: 'Interview result recorded successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to record interview result', severity: 'error' });
    } finally {
      setLoading(false);
      setShowInterviewResultDialog(false);
      setInterviewResult({ result: 'Passed', notes: '' });
      setSelectedSlot(null);
    }
  };

  // Document verification handlers
  const handleVerifyDocument = async (docType) => {
    setLoading(true);
    try {
      let verificationFunction;
      
      // Map document types to verification functions
      if (['ID Proof', 'Address Proof', 'Background Check'].includes(docType)) {
        verificationFunction = verifyBackgroundCheck;
      } else if (docType === 'Reference Letter') {
        verificationFunction = verifyReferenceChecks;
      } else if (['Degree', 'Certificate'].includes(docType)) {
        verificationFunction = verifyQualifications;
      } else {
        throw new Error(`Unknown document type: ${docType}`);
      }
      
      // Use userId (user ID) for verification functions, not tutor profile ID
      const userId = selectedUser.userId || selectedUser.id;
      await verificationFunction(userId);
      
      // Reload tutor details
      const updatedTutor = await getTutorDetails(selectedUser.id).catch(() => null);
      if (updatedTutor) {
        setSelectedUser(updatedTutor);
      }
      
      setSnackbar({ open: true, message: `${docType} verified successfully`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to verify ${docType}: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDocument = async (docType) => {
    setSnackbar({ open: true, message: `Document rejection functionality will be implemented soon`, severity: 'info' });
  };

  const handleAddDocumentNotes = (docType) => {
    setSnackbar({ open: true, message: `Notes functionality for ${docType} will be implemented soon`, severity: 'info' });
  };

  // Load available interview slots when viewing tutor details
  useEffect(() => {
    if (selectedUser && tabValue === 'tutors') {
      const loadAvailableSlots = async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const slots = await getAvailableInterviewSlots(today).catch(() => []);
          setAvailableSlots(slots);
        } catch (error) {
          console.error('Failed to load available slots:', error);
        }
      };
      loadAvailableSlots();
    }
  }, [selectedUser, tabValue]);

  const filteredUsers = users[tabValue]?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.subjects && user.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesSearch;
  }) || [];

  const getStatusCounts = () => {
    const counts = { tutors: {}, students: {}, parents: {} };
    
    users.tutors.forEach(tutor => {
      counts.tutors[tutor.status] = (counts.tutors[tutor.status] || 0) + 1;
    });
    
    users.students.forEach(student => {
      counts.students[student.status] = (counts.students[student.status] || 0) + 1;
    });
    
    users.parents.forEach(parent => {
      counts.parents[parent.status] = (counts.parents[parent.status] || 0) + 1;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tutors
              </Typography>
              <Typography variant="h4">
                {stats.tutors?.total || users.tutors.length}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={`${stats.tutors?.pending || statusCounts.tutors.pending || 0} Pending`} size="small" color="warning" sx={{ mr: 1 }} />
                <Chip label={`${stats.tutors?.verified || statusCounts.tutors.verified || 0} Verified`} size="small" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">
                {stats.students?.total || users.students.length}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={`${statusCounts.students.active || 0} Active`} size="small" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Parents
              </Typography>
              <Typography variant="h4">
                {stats.parents?.total || users.parents.length}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={`${statusCounts.parents.active || 0} Active`} size="small" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Interviews
              </Typography>
              <Typography variant="h4">
                {stats.interviews?.pending || users.tutors.filter(t => t.interviewSlots?.some(s => s.scheduled && !s.completed)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Tutors" value="tutors" icon={<School fontSize="small" />} />
            <Tab label="Students" value="students" icon={<Person fontSize="small" />} />
            <Tab label="Parents" value="parents" icon={<ContactMail fontSize="small" />} />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder={`Search ${tabValue}...`}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
              onChange={handleSearch}
              sx={{ mr: 2 }}
            />
            <Button variant="outlined" startIcon={<FilterList />}>
              Filters
            </Button>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                {tabValue === 'tutors' && (
                  <>
                    <TableCell>Subjects</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Documents</TableCell>
                    <TableCell>Interview</TableCell>
                  </>
                )}
                {tabValue === 'students' && (
                  <>
                    <TableCell>Subjects</TableCell>
                    <TableCell>Sessions</TableCell>
                    <TableCell>Rating</TableCell>
                  </>
                )}
                {tabValue === 'parents' && (
                  <>
                    <TableCell>Children</TableCell>
                    <TableCell>Sessions Booked</TableCell>
                  </>
                )}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>{user.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography fontWeight="medium">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.location}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  {tabValue === 'tutors' && (
                    <>
                      <TableCell>
                        {console.log('Tutor subjects:', user.subjects, 'Type:', typeof user.subjects)}
                        {Array.isArray(user.subjects) ? (
                          user.subjects.map(subject => (
                            <Chip key={subject} label={subject} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {user.subjects || 'No subjects'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={statusColors[user.status]} 
                          size="small" 
                          variant={user.status === 'unverified' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {user.documents.filter(d => d.verified).length}/{user.documents.length}
                          </Typography>
                          {user.documents.every(d => d.verified) ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Pending color="warning" fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.interviewCompleted ? (
                          <Tooltip title="Interview completed">
                            <CheckCircle color="success" />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Interview pending">
                            <Pending color="warning" />
                          </Tooltip>
                        )}
                      </TableCell>
                    </>
                  )}
                  {tabValue === 'students' && (
                    <>
                      <TableCell>
                        {user.subjects.map(subject => (
                          <Chip key={subject} label={subject} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </TableCell>
                      <TableCell>{user.sessionsCompleted}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star color="warning" fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>{user.rating}</Typography>
                        </Box>
                      </TableCell>
                    </>
                  )}
                  {tabValue === 'parents' && (
                    <>
                      <TableCell>
                        {user.children.map(child => (
                          <Chip key={child} label={child} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </TableCell>
                      <TableCell>{user.sessionsBooked}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <IconButton onClick={() => handleViewUser(user)}>
                      <Visibility color="primary" />
                    </IconButton>
                    {tabValue === 'tutors' && (
                      <IconButton onClick={(e) => handleMenuClick(e, user)}>
                        <MoreVert />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Enhanced User Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleCloseDialog} sx={{ mr: 1 }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h6">{selectedUser.name}</Typography>
                {selectedUser.status && (
                  <Chip 
                    label={selectedUser.status} 
                    color={statusColors[selectedUser.status]} 
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {/* Basic Info Section */}
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 3 }}>{selectedUser.name.charAt(0)}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography color="text.secondary">{selectedUser.email}</Typography>
                  <Typography color="text.secondary">{selectedUser.phone}</Typography>
                  <Typography color="text.secondary">{selectedUser.location}</Typography>
                  <Typography>Joined: {selectedUser.joinDate}</Typography>
                  <Typography>Last Active: {selectedUser.lastActive}</Typography>
                  {selectedUser.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Star color="warning" />
                      <Typography sx={{ ml: 0.5 }}>{selectedUser.rating}/5</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {tabValue === 'tutors' && (
                <>
                  {/* Documents Section */}
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Description sx={{ mr: 1 }} />
                        <Typography>Uploaded Documents</Typography>
                        <Badge 
                          badgeContent={selectedUser.documents.filter(d => !d.verified).length} 
                          color="error" 
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {selectedUser.documents.map((doc, index) => (
                          <Box key={index}>
                            <DocumentItem
                              doc={doc}
                              onVerify={handleVerifyDocument}
                              onReject={handleRejectDocument}
                              onAddNotes={handleAddDocumentNotes}
                            />
                            {index < selectedUser.documents.length - 1 && <Divider />}
                          </Box>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Interview Section */}
                  <Accordion defaultExpanded sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1 }} />
                        <Typography>Interview Management</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="subtitle2" gutterBottom>
                        Admin's Preferred Time Slots:
                      </Typography>
                      {console.log("selectedUser",selectedUser)}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {selectedUser.preferredSlots && selectedUser.preferredSlots.length > 0 ? (
                          selectedUser.preferredSlots.map((slot, index) => (
                            <Chip key={index} label={slot} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No preferred slots set
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom>
                       Tutor Scheduled Interview:
                      </Typography>
                      {selectedUser.interviewSlots && selectedUser.interviewSlots.length > 0 ? (
                        <List dense>
                          {selectedUser.interviewSlots.map((slot, index) => (
                            <InterviewSlotItem 
                              key={index} 
                              slot={slot} 
                              tutorId={selectedUser.id}
                              onSchedule={handleScheduleInterview}
                              onComplete={handleCompleteInterview}
                            />
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No interviews scheduled yet
                        </Typography>
                      )}
                      
                      {/* <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Available Interview Slots:
                        </Typography>
                        <Grid container spacing={1}>
                          {availableSlots.filter(slot => slot.available).map((slot, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                              <Chip 
                                label={`${slot.date} ${slot.time}`}
                                variant="outlined"
                                onClick={() => handleScheduleInterview(selectedUser.id, slot.date, slot.time)}
                                sx={{ cursor: 'pointer' }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box> */}
                      
                      {/* Admin can set available slots for tutor to choose from */}
                      <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Set Preferred Interview Slots:
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => setShowPreferredTimesDialog(true)}
                        >
                          Set Preferred Slots
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Application Notes */}
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assignment sx={{ mr: 1 }} />
                        <Typography>Application Notes</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={selectedUser.applicationNotes || ''}
                        placeholder="Add application notes..."
                        variant="outlined"
                      />
                    </AccordionDetails>
                  </Accordion>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {tabValue === 'tutors' && selectedUser.status !== 'verified' && (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      // Use userId (user ID) for approve function, not tutor profile ID
                      const userId = selectedUser.userId || selectedUser.id;
                      await approveTutor(userId);
                      await loadUsers('tutors');
                      setSnackbar({ open: true, message: 'Tutor approved successfully', severity: 'success' });
                      handleCloseDialog();
                    } catch (error) {
                      setSnackbar({ open: true, message: 'Failed to approve tutor', severity: 'error' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={
                    !selectedUser.documents.every(d => d.verified) ||
                    !selectedUser.is_background_checked ||
                    !selectedUser.is_reference_verified ||
                    !selectedUser.is_qualification_verified
                  }
                >
                  Approve Tutor
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleViewUser(selectedActionUser); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem 
          onClick={handleApprove} 
          disabled={
            selectedActionUser?.status === 'verified' ||
            !selectedActionUser?.documents?.every(d => d.verified) ||
            !selectedActionUser?.is_background_checked ||
            !selectedActionUser?.is_reference_verified ||
            !selectedActionUser?.is_qualification_verified
          }
        >
          <CheckCircle sx={{ mr: 1 }} /> Approve
        </MenuItem>
        <MenuItem onClick={handleReject} disabled={selectedActionUser?.status === 'rejected'}>
          <Cancel sx={{ mr: 1 }} /> Reject
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} /> Request Changes
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onClose={() => setShowRejectionDialog(false)}>
        <DialogTitle>Reject Tutor Application</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectionDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interview Result Dialog */}
      <Dialog open={showInterviewResultDialog} onClose={() => setShowInterviewResultDialog(false)}>
        <DialogTitle>Interview Result</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Result</InputLabel>
            <Select
              value={interviewResult.result}
              onChange={(e) => setInterviewResult({ ...interviewResult, result: e.target.value })}
            >
              <MenuItem value="Passed">Passed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Conditional">Conditional</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Interview Notes"
            value={interviewResult.notes}
            onChange={(e) => setInterviewResult({ ...interviewResult, notes: e.target.value })}
            placeholder="Add interview notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInterviewResultDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmInterviewResult} variant="contained">
            Save Result
          </Button>
        </DialogActions>
      </Dialog>

             {/* Preferred Times Dialog */}
       <Dialog open={showPreferredTimesDialog} onClose={() => setShowPreferredTimesDialog(false)} maxWidth="md" fullWidth>
         <DialogTitle>Set Preferred Interview Slots</DialogTitle>
         <DialogContent>
           <Typography variant="subtitle2" gutterBottom>
             Select available dates and times for the tutor to choose from:
           </Typography>
           
           {/* Date and Time Input */}
           <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, mt: 2 }}>
             <TextField
               type="date"
               label="Date"
               value={newInterviewDate}
               onChange={(e) => setNewInterviewDate(e.target.value)}
               InputLabelProps={{ shrink: true }}
             />
             <TextField
               type="time"
               label="Time"
               value={newInterviewTime}
               onChange={(e) => setNewInterviewTime(e.target.value)}
               InputLabelProps={{ shrink: true }}
             />
             <Button
               variant="outlined"
               onClick={() => {
                 if (newInterviewDate && newInterviewTime) {
                   const slotTime = `${newInterviewDate} ${newInterviewTime}`;
                   if (!preferredTimes.includes(slotTime)) {
                     setPreferredTimes([...preferredTimes, slotTime]);
                   }
                   setNewInterviewDate('');
                   setNewInterviewTime('');
                 }
               }}
             >
               Add Slot
             </Button>
           </Box>
           
           {/* Available Slots from API */}
           <Typography variant="subtitle2" gutterBottom>
             Available Slots (Click to add):
           </Typography>
           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
             {availableSlots.filter(slot => slot.available).map((slot, index) => {
               const slotTime = `${slot.date} ${slot.time}`;
               return (
                 <Chip
                   key={index}
                   label={slotTime}
                   variant="outlined"
                   onClick={() => {
                     if (!preferredTimes.includes(slotTime)) {
                       setPreferredTimes([...preferredTimes, slotTime]);
                     }
                   }}
                   sx={{ cursor: 'pointer' }}
                 />
               );
             })}
           </Box>
           
           {/* Selected Preferred Slots */}
           <Typography variant="subtitle2" gutterBottom>
             Selected Preferred Slots:
           </Typography>
           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
             {preferredTimes.map((slot, index) => (
               <Chip
                 key={index}
                 label={slot}
                 variant="filled"
                 color="primary"
                 onDelete={() => setPreferredTimes(preferredTimes.filter((_, i) => i !== index))}
               />
             ))}
           </Box>
           
           {preferredTimes.length === 0 && (
             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
               No slots selected. Add slots above for the tutor to choose from.
             </Typography>
           )}
         </DialogContent>
         <DialogActions>
           <Button onClick={() => {
             setShowPreferredTimesDialog(false);
             setPreferredTimes([]);
           }}>
             Cancel
           </Button>
                       <Button 
              variant="contained"
              onClick={() => {
                if (preferredTimes.length > 0) {
                  // Use the tutor profile ID (selectedUser.id should already be the tutor profile ID)
                  handleSetAvailableSlots(selectedUser.id, preferredTimes);
                  setShowPreferredTimesDialog(false);
                  setPreferredTimes([]); // Clear selected slots after saving
                }
              }}
              disabled={preferredTimes.length === 0}
            >
              Save Preferred Slots ({preferredTimes.length})
            </Button>
         </DialogActions>
       </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard; 