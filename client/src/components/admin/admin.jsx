import React, { useState } from 'react';
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
  Badge
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
  CloudDownload
} from '@mui/icons-material';

// Mock data with documents and interview slots
const mockTutors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    subjects: ['Mathematics', 'Physics'],
    status: 'verified',
    documents: [
      { type: 'DBS Check', url: '#', verified: true, uploadDate: '2023-05-10' },
      { type: 'Degree Certificate', url: '#', verified: true, uploadDate: '2023-05-12' },
      { type: 'Reference Letter 1', url: '#', verified: true, uploadDate: '2023-05-08' },
      { type: 'Reference Letter 2', url: '#', verified: true, uploadDate: '2023-05-09' }
    ],
    interviewSlots: [
      { date: '2023-06-15', time: '14:00', scheduled: true, completed: true },
      { date: '2023-06-16', time: '11:00', scheduled: false, completed: false }
    ],
    preferredSlots: ['Weekdays 2-5 PM', 'Saturday mornings'],
    backgroundCheck: true,
    references: 2,
    qualifications: ['PhD in Physics', 'MSc in Mathematics'],
    interviewCompleted: true,
    rating: 4.9,
    profileComplete: true,
    joinDate: '2023-01-15',
    lastActive: '2023-06-10'
  },
  {
    id: 2,
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    subjects: ['English Literature'],
    status: 'pending',
    documents: [
      { type: 'Degree Certificate', url: '#', verified: false, uploadDate: '2023-06-01' },
      { type: 'Reference Letter 1', url: '#', verified: true, uploadDate: '2023-06-02' }
    ],
    interviewSlots: [],
    preferredSlots: ['Weekdays after 6 PM', 'Sunday afternoons'],
    backgroundCheck: false,
    references: 1,
    qualifications: ['MA in English'],
    interviewCompleted: false,
    rating: null,
    profileComplete: true,
    joinDate: '2023-05-20',
    lastActive: '2023-06-01'
  }
];

const statusColors = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
  unverified: 'default'
};

const DocumentItem = ({ doc }) => (
  <ListItem secondaryAction={
    <IconButton edge="end" href={doc.url} target="_blank">
      <CloudDownload />
    </IconButton>
  }>
    <ListItemIcon>
      <Description color={doc.verified ? "success" : "action"} />
    </ListItemIcon>
    <ListItemText
      primary={doc.type}
      secondary={`Uploaded: ${doc.uploadDate} • ${doc.verified ? 'Verified' : 'Pending verification'}`}
    />
    {doc.verified && <CheckCircle color="success" sx={{ ml: 2 }} />}
  </ListItem>
);

const InterviewSlotItem = ({ slot, tutorId }) => (
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
      secondary={slot.scheduled ? (slot.completed ? 'Completed' : 'Scheduled') : 'Available'}
    />
    {!slot.scheduled && (
      <Button 
        variant="outlined" 
        size="small"
        onClick={() => console.log(`Schedule interview for tutor ${tutorId} at ${slot.date} ${slot.time}`)}
      >
        Schedule
      </Button>
    )}
  </ListItem>
);

const AdminDashboard = () => {
  const [tutors, setTutors] = useState(mockTutors);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActionTutor, setSelectedActionTutor] = useState(null);
  const [newInterviewDate, setNewInterviewDate] = useState('');
  const [newInterviewTime, setNewInterviewTime] = useState('');


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

  const handleViewTutor = (tutor) => {
    setSelectedTutor(tutor);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTutor(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleMenuClick = (event, tutor) => {
    setAnchorEl(event.currentTarget);
    setSelectedActionTutor(tutor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActionTutor(null);
  };

  const handleApprove = () => {
    // In a real app, you would make an API call here
    const updatedTutors = tutors.map(tutor => 
      tutor.id === selectedActionTutor.id ? { ...tutor, status: 'verified' } : tutor
    );
    setTutors(updatedTutors);
    handleMenuClose();
  };

  const handleReject = () => {
    // In a real app, you would make an API call here
    const updatedTutors = tutors.map(tutor => 
      tutor.id === selectedActionTutor.id ? { ...tutor, status: 'rejected' } : tutor
    );
    setTutors(updatedTutors);
    handleMenuClose();
  };

  const handleRequestChanges = () => {
    // In a real app, you would make an API call here
    handleMenuClose();
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (tabValue === 'all') return matchesSearch;
    if (tabValue === 'verified') return tutor.status === 'verified' && matchesSearch;
    if (tabValue === 'pending') return tutor.status === 'pending' && matchesSearch;
    if (tabValue === 'unverified') return tutor.status === 'unverified' && matchesSearch;
    if (tabValue === 'rejected') return tutor.status === 'rejected' && matchesSearch;
    return matchesSearch;
  });

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredTutors.length - page * rowsPerPage);

 const handleScheduleInterview = () => {
    if (!newInterviewDate || !newInterviewTime) return;
    
    const updatedTutors = tutors.map(tutor => {
      if (tutor.id === selectedTutor.id) {
        return {
          ...tutor,
          interviewSlots: [
            ...tutor.interviewSlots,
            {
              date: newInterviewDate,
              time: newInterviewTime,
              scheduled: true,
              completed: false
            }
          ]
        };
      }
      return tutor;
    });
    
    setTutors(updatedTutors);
    setNewInterviewDate('');
    setNewInterviewTime('');
    setSelectedTutor(updatedTutors.find(t => t.id === selectedTutor.id));
  };

  const handleVerifyDocument = (docType) => {
    const updatedTutors = tutors.map(tutor => {
      if (tutor.id === selectedTutor.id) {
        return {
          ...tutor,
          documents: tutor.documents.map(doc => 
            doc.type === docType ? { ...doc, verified: true } : doc
          )
        };
      }
      return tutor;
    });
    
    setTutors(updatedTutors);
    setSelectedTutor(updatedTutors.find(t => t.id === selectedTutor.id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tutor Management Dashboard
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Tutors" value="all" />
            <Tab label="Verified" value="verified" icon={<Verified fontSize="small" />} />
            <Tab label="Pending" value="pending" icon={<Pending fontSize="small" />} />
            <Tab label="Unverified" value="unverified" />
            <Tab label="Rejected" value="rejected" icon={<Cancel fontSize="small" />} />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search tutors..."
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
                <TableCell>Tutor</TableCell>
                <TableCell>Subjects</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Background Check</TableCell>
                <TableCell>References</TableCell>
                <TableCell>Interview</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTutors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>{tutor.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography fontWeight="medium">{tutor.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{tutor.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {tutor.subjects.map(subject => (
                      <Chip key={subject} label={subject} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={tutor.status} 
                      color={statusColors[tutor.status]} 
                      size="small" 
                      variant={tutor.status === 'unverified' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell>
                    {tutor.backgroundCheck ? (
                      <Tooltip title="Background check verified">
                        <CheckCircle color="success" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Background check pending">
                        <Cancel color="error" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    {tutor.references}/2 {tutor.references >= 2 ? '✓' : '✗'}
                  </TableCell>
                  <TableCell>
                    {tutor.interviewCompleted ? (
                      <Tooltip title="Interview completed">
                        <CheckCircle color="success" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Interview pending">
                        <Pending color="warning" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewTutor(tutor)}>
                      <Visibility color="primary" />
                    </IconButton>
                    <IconButton onClick={(e) => handleMenuClick(e, tutor)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTutors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Enhanced Tutor Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedTutor && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleCloseDialog} sx={{ mr: 1 }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h6">{selectedTutor.name}</Typography>
                <Chip 
                  label={selectedTutor.status} 
                  color={statusColors[selectedTutor.status]} 
                  sx={{ ml: 2 }}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {/* Basic Info Section */}
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 3 }}>{selectedTutor.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{selectedTutor.name}</Typography>
                  <Typography color="text.secondary">{selectedTutor.email}</Typography>
                  <Typography>Joined: {selectedTutor.joinDate}</Typography>
                  {selectedTutor.rating && (
                    <Typography>Rating: {selectedTutor.rating}/5</Typography>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Documents Section */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Description sx={{ mr: 1 }} />
                    <Typography>Uploaded Documents</Typography>
                    <Badge 
                      badgeContent={selectedTutor.documents.filter(d => !d.verified).length} 
                      color="error" 
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedTutor.documents.map((doc, index) => (
                      <Box key={index}>
                        <DocumentItem doc={doc} />
                        {!doc.verified && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -3, mb: 1 }}>
                            <Button 
                              size="small" 
                              onClick={() => handleVerifyDocument(doc.type)}
                              startIcon={<CheckCircle />}
                            >
                              Verify
                            </Button>
                          </Box>
                        )}
                        {index < selectedTutor.documents.length - 1 && <Divider />}
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
                    <Typography>Interview Scheduling</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    Tutor's Preferred Time Slots:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedTutor.preferredSlots.map((slot, index) => (
                      <Chip key={index} label={slot} size="small" />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Scheduled Interviews:
                  </Typography>
                  {selectedTutor.interviewSlots.length > 0 ? (
                    <List dense>
                      {selectedTutor.interviewSlots.map((slot, index) => (
                        <InterviewSlotItem key={index} slot={slot} tutorId={selectedTutor.id} />
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No interviews scheduled yet
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Schedule New Interview:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={newInterviewDate}
                        onChange={(e) => setNewInterviewDate(e.target.value)}
                      />
                      <TextField
                        label="Time"
                        type="time"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={newInterviewTime}
                        onChange={(e) => setNewInterviewTime(e.target.value)}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleScheduleInterview}
                        disabled={!newInterviewDate || !newInterviewTime}
                      >
                        Schedule
                      </Button>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {selectedTutor.status !== 'verified' && (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => {}}
                  disabled={!selectedTutor.documents.every(d => d.verified)}
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
        <MenuItem onClick={() => { handleViewTutor(selectedActionTutor); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleApprove} disabled={selectedActionTutor?.status === 'verified'}>
          <CheckCircle sx={{ mr: 1 }} /> Approve
        </MenuItem>
        <MenuItem onClick={handleReject} disabled={selectedActionTutor?.status === 'rejected'}>
          <Cancel sx={{ mr: 1 }} /> Reject
        </MenuItem>
        <MenuItem onClick={handleRequestChanges}>
          <Edit sx={{ mr: 1 }} /> Request Changes
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      
    </Box>
  );
};

export default AdminDashboard;