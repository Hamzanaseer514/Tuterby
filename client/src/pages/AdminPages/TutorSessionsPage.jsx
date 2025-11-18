import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  alpha,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  Menu,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import PhoneIcon from '@mui/icons-material/Phone';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SchoolIcon from '@mui/icons-material/School';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Search,
  Visibility,
  Star,
  Schedule,
  Payment,
  Cancel,
  CheckCircle,
  Pending,
  Refresh,
  Person,
  School,
  MonetizationOn,
  BookOnline,
  TrendingUp,
  Download,
  MoreVert,
  CalendarToday,
  AccessTime,
  Info,
  Group,
  Subject,
  People
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/components/AdminLayout';
import { getAllTutorSessions } from '../../services/adminService';
import { BASE_URL } from '../../config';

const TutorSessionsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true); // Start with true to show loading
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50, // Increased default limit for better performance
    search: '',
    status: '',
    tutor_id: '',
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 50 // Increased default for better performance
  });
  const [stats, setStats] = useState({
    total_sessions: 0,
    total_revenue: 0,
    average_rating: 0,
    completed_sessions: 0,
    pending_sessions: 0,
    cancelled_sessions: 0,
    confirmed_sessions: 0
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllTutorSessions(filters);

      if (response.success) {
        setSessions(response.data);
        setPagination(response.pagination);
        setStats(response.stats);
      } else {
        setError(response.message || 'Failed to load sessions');
      }
    } catch (error) {
      //console.error('Error loading sessions:', error);
      setError(error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const statusMap = { 0: '', 1: 'pending', 2: 'confirmed', 3: 'completed', 4: 'cancelled', 5: 'in_progress' };
    handleFilterChange('status', statusMap[newValue]);
  };

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setTablePage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'confirmed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <Pending fontSize="small" />;
      case 'cancelled':
        return <Cancel fontSize="small" />;
      case 'confirmed':
        return <Schedule fontSize="small" />;
      default:
        return <Pending fontSize="small" />;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const renderStars = (rating) => {
    if (!rating) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            sx={{
              fontSize: '14px',
              color: i < rating ? theme.palette.warning.main : theme.palette.grey[300]
            }}
          />
        ))}
        <Typography variant="caption" sx={{ ml: 0.5 }}>
          {rating}
        </Typography>
      </Box>
    );
  };

  const SessionDetailsModal = ({ open, onClose, session }) => {
    if (!session) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            [theme.breakpoints.up('md')]: {
              width: "80%",
              maxHeight: "90vh"
            },
            [theme.breakpoints.down('md')]: {
              margin: 1,
              width: "calc(100% - 16px)"
            },
            borderRadius: 2,
            overflow: "hidden"
          }
        }}
      >
        {/* Header with gradient background */}
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            color: 'white',
            fontWeight: "600",
            fontSize: { xs: "1rem", sm: "1.25rem" },
            py: { xs: 1.5, sm: 2.5 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" noWrap sx={{ maxWidth: { xs: '200px', sm: '100%' } }}>
            {session.session_title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 0,                        // no padding, full-bleed
            bgcolor: '#F9FAFB',
            overflow: 'auto'
          }}
        >        <Grid container justifyContent="center" className='mt-4'>
            <Grid item xs={12} md={10} lg={8}>
              <Card sx={{ width: '100%' }}>

                <CardContent sx={{ p: 0 }}>
                  {/* Header */}
                  <Box display="flex" alignItems="center" p={2}>
                    <InfoIcon color="primary" sx={{ mr: 1.5, fontSize: { xs: '18px', sm: '24px' } }} />
                    <Typography variant="h6" fontWeight="600" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Session Information
                    </Typography>
                  </Box>

                  {/* Responsive Grid Layout */}
                  <Box sx={{
                    p: { xs: 1, sm: 2 },
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(5, 1fr)'
                    },
                    gap: 1
                  }}>
                    {/* Info items */}
                    <Box sx={{ p: 1.5, bgcolor: "#f9fafb", borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Subject
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {session.subject}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Academic Level
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {session.academic_level}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: "#f9fafb", borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Date
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(session.session_date)}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Time
                      </Typography>
                      <Typography variant="body2">
                        {session.session_time}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: "#f9fafb", borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {session.duration} hours
                      </Typography>
                    </Box>

                    {/* Second Row */}
                    <Box sx={{ p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Rating
                      </Typography>
                      <Box display="flex" alignItems="center">
                        {renderStars(session.rating)}
                        <Typography variant="body2">
                          ({session.rating})
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: "#f9fafb", borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Status
                      </Typography>
                      <Chip
                        label={session.status}
                        size="small"
                        color={
                          session.status === "completed"
                            ? "success"
                            : session.status === "upcoming"
                              ? "primary"
                              : session.status === "cancelled"
                                ? "error"
                                : "default"
                        }
                      />
                    </Box>

                    <Box sx={{ p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        No. of Students
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2">
                          ({session.students.length})
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "#f9fafb",
                      gridColumn: {
                        xs: '1 / -1',
                        sm: 'span 2',
                        md: 'span 2',
                        lg: 'span 2'
                      }
                    }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {session.notes || "No notes provided"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Tutor Info + Additional Info side by side */}
            {session.tutor && (
              <Grid
                container
                justifyContent="center"
                spacing={4}          // <— space between the two cards
                sx={{ mt: 2, mb: 2 }}
              >
                {/* Additional Info */}
                <Grid item xs={12} md={5} lg={4}>
                  <Card sx={{ width: '100%', height: '100%' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <MoreHorizIcon color="primary" sx={{ mr: 1, fontSize: { xs: 18, sm: 24 } }} />
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color="primary"
                          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
                          Additional Information
                        </Typography>
                      </Box>

                      {session.meeting_link && (
                        <Box mb={3}>
                          <Button
                            variant="contained"
                            size="medium"
                            fullWidth
                            startIcon={<VideoCallIcon />}
                            onClick={() => window.open(session.meeting_link, "_blank")}
                            sx={{ borderRadius: 2, py: 1 }}
                          >
                            Join Meeting
                          </Button>
                        </Box>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <InfoRow label="Created" value={formatDate(session.created_at)} />
                        <Divider sx={{ my: 1.5 }} />
                        <InfoRow label="Last Updated" value={formatDate(session.updated_at)} />

                        {session.session_type && (
                          <>
                            <Divider sx={{ my: 1.5 }} />
                            <InfoRow label="Session Type" value={session.session_type} />
                          </>
                        )}

                        {session.tags?.length > 0 && (
                          <>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                              Tags:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {session.tags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ))}
                            </Box>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tutor Info */}
                <Grid item xs={12} md={7} lg={6}>
                  <Card
                    sx={{
                      height: '100%',
                      boxShadow:
                        '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <PersonIcon color="primary" sx={{ mr: 1, fontSize: { xs: 18, sm: 24 } }} />
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color="primary"
                          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
                          Tutor Information
                        </Typography>
                      </Box>

                      <Box
                        display="flex"
                        alignItems="flex-start"
                        p={2}
                        sx={{
                          bgcolor: '#F1F5F9',
                          borderRadius: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                        }}
                      >
                        <Box
                          component="img"
                          src={session.tutor.photo_url || ''}
                          alt={session.tutor.full_name}
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            mr: { xs: 0, sm: 2 },
                            mb: { xs: 2, sm: 0 },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600} variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {session.tutor.full_name}
                          </Typography>

                          {session.tutor.experience_years && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              Experience: {session.tutor.experience_years} years
                            </Typography>
                          )}

                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {session.tutor.email}
                          </Typography>

                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {session.tutor.location}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}


            {/* Students with details */}
            {/* --- Students with details --- */}
            {session.students?.length > 0 && (
              <Grid item xs={12} md={10} lg={8}>
                <Card sx={{ width: '100%' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PeopleIcon
                        color="primary"
                        sx={{ mr: 1, fontSize: { xs: '18px', sm: '24px' } }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        color="primary"
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                      >
                        Students ({session.students.length})
                      </Typography>
                    </Box>

                    <Grid className='flex justify-center gap-4'>
                      {session.students.map((student, idx) => {
                        const studentRating = session.student_ratings?.find(
                          (sr) => sr.student_id?.toString() === student._id?.toString()
                        );
                        const studentPayment = session.student_payments?.find(
                          (sp) => sp.student_id?.toString() === student._id?.toString()
                        );
                        const studentResponse = session.student_responses?.find(
                          (resp) => resp.student_id?.toString() === student._id?.toString()
                        );

                        return (
                          <Grid item xs={12} key={idx}>
                            <Card
                              sx={{
                                p: 2,
                                border: '1px solid #E2E8F0',
                                borderRadius: 2,
                                background: 'white',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                '&:hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.04)' },
                              }}
                            >
                              {/* Student Header */}
                              <Box
                                display="flex"
                                alignItems="flex-start"
                                mb={2}
                                sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                              >
                                <Box
                                  component="img"
                                  src={student.photo_url || ''}
                                  alt={student.full_name}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    mr: { xs: 0, sm: 2 },
                                    mb: { xs: 2, sm: 0 },
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography fontWeight="600" variant="subtitle1">
                                    {student.full_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                                  >
                                    <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    {student.email}
                                  </Typography>
                                  <Box display="flex" alignItems="center" mt={0.5}>
                                    <PhoneIcon
                                      sx={{ fontSize: 14, mr: 0.5, color: 'action.active' }}
                                    />
                                    <Typography variant="caption">
                                      {student.phone_number || 'No phone'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              <Divider sx={{ my: 1.5 }} />

                              {/* Rating | Payment | Response */}
                              <Box
                                display="flex"
                                gap={2}
                                flexWrap="wrap"
                                sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                              >
                                {/* Rating */}
                                <Box flex={1} minWidth={200}>
                                  <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Rating & Feedback
                                  </Typography>
                                  {studentRating ? (
                                    <>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        {renderStars(studentRating.rating)}
                                        <Typography variant="body2" fontWeight="500">
                                          ({studentRating.rating})
                                        </Typography>
                                      </Box>
                                      {studentRating.feedback && (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontStyle: 'italic',
                                            mt: 1,
                                            color: '#64748B',
                                            fontSize: '0.875rem',
                                            wordBreak: 'break-word',
                                          }}
                                        >
                                          "{studentRating.feedback}"
                                        </Typography>
                                      )}
                                    </>
                                  ) : (
                                    <Typography variant="body2" color="textSecondary">
                                      No rating provided
                                    </Typography>
                                  )}
                                </Box>

                                {/* Payment */}
                                <Box flex={1} minWidth={200}>
                                  <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Payment Status
                                  </Typography>
                                  {studentPayment ? (
                                    <>
                                      <Chip
                                        label={studentPayment.payment_status}
                                        size="small"
                                        color={
                                          studentPayment.payment_status === 'paid'
                                            ? 'success'
                                            : studentPayment.payment_status === 'pending'
                                              ? 'warning'
                                              : 'error'
                                        }
                                      />
                                      <Typography variant="body2" sx={{ mt: 1 }}>
                                        {formatCurrency(studentPayment.base_amount)}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        display="block"
                                      >
                                        {studentPayment.payment_method} •{' '}
                                        {studentPayment.payment_date
                                          ? formatDate(studentPayment.payment_date)
                                          : 'Not Paid'}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="body2" color="textSecondary">
                                      No payment record
                                    </Typography>
                                  )}
                                </Box>

                                {/* Response */}
                                <Box flex={1} minWidth={200}>
                                  <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Session Response
                                  </Typography>
                                  {studentResponse ? (
                                    <Chip
                                      label={studentResponse.status.toUpperCase()}
                                      size="small"
                                      color={
                                        studentResponse.status === 'confirmed'
                                          ? 'success'
                                          : studentResponse.status === 'declined'
                                            ? 'error'
                                            : 'warning'
                                      }
                                    />
                                  ) : (
                                    <Typography variant="body2" color="textSecondary">
                                      No response
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}


          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  // Improved InfoRow component for consistent alignment
  const InfoRow = ({ label, value, multiline = false }) => (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { sm: 'center' },
      minHeight: 32,
      mb: 1
    }}>
      <Typography
        variant="body2"
        fontWeight="500"
        sx={{
          minWidth: { xs: 'auto', sm: 120 },
          mb: { xs: 0.5, sm: 0 }
        }}
      >
        {label}:
      </Typography>
      <Typography
        variant="body2"
        color={value ? 'text.primary' : 'text.secondary'}
        sx={{
          wordBreak: 'break-word',
          flex: 1,
          ...(multiline && { whiteSpace: 'pre-line' })
        }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  );


  // Responsive table component
  const ResponsiveSessionTable = () => {
    if (isMobile) {
      return (
        <Box>
          {sessions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <BookOnline sx={{ fontSize: 60, color: 'grey.300', mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No sessions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your filters or search terms
              </Typography>
          
            </Box>
          ) : (
            sessions.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage).map((session) => (
              <Card key={session._id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {session.session_title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        src={`${BASE_URL}${session.tutor.photo_url}`}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        <Person />
                      </Avatar>
                      <Typography variant="body2">
                        {session.tutor?.full_name || 'Unknown'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Chip
                        label={session.status}
                        color={getStatusColor(session.status)}
                        icon={getStatusIcon(session.status)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(session.session_date)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" gutterBottom>
                      {session.subject} • {session.academic_level}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="500">
                        {formatCurrency(session.total_amount)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {session.rating ? renderStars(session.rating) : (
                          <Typography variant="caption" color="text.secondary">
                            No rating
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedSession(session);
                      setShowDetailsModal(true);
                    }}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      ml: 1,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            ))
          )}

          {sessions.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sessions.length}
              rowsPerPage={rowsPerPage}
              page={tablePage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Box>
      );
    }

    // Desktop table view
    return (
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Session Title</TableCell>

              {/* Cells visible only on md and up */}
              <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Tutor</TableCell>
              <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Students</TableCell>
              <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Subject/Level</TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>

              {/* Cells visible only on sm and up */}
              <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Amount</TableCell>
              {/* <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Rating</TableCell> */}

              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body1" color="text.secondary">
                      Loading sessions...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <BookOnline sx={{ fontSize: 60, color: 'grey.300', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      No sessions found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Try adjusting your filters or search terms
                    </Typography>
                  
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                        {session.session_title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.session_time}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Tutor cell - visible only on md and up */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {session.tutor ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="img"
                          src={session.tutor.photo_url || ''}
                          alt={session.tutor.full_name}
                          sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <Box>
                          <Typography variant="body2">{session.tutor.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.tutor.experience_years} yrs exp
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Unknown</Typography>
                    )}
                  </TableCell>

                  {/* Date cell - visible only on md and up */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Box>
                      <Typography variant="body2">{formatDate(session.session_date)}</Typography>
                    </Box>
                  </TableCell>

                  {/* Students cell - visible only on md and up */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {session.students?.length || 0}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Subject/Level cell - visible only on md and up */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Box>
                      <Typography variant="body2">{session.subject}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.academic_level}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Status cell - always visible */}
                  <TableCell>
                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status)}
                      icon={getStatusIcon(session.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Amount cell - visible only on sm and up */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" fontWeight="500">
                      {formatCurrency(session.total_amount)}
                    </Typography>
                  </TableCell>

                  {/* Rating cell - visible only on sm and up
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {session.rating ? renderStars(session.rating) : (
                      <Typography variant="caption" color="text.secondary">
                        No rating
                      </Typography>
                    )}
                  </TableCell> */}

                  {/* Actions cell - always visible */}
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedSession(session);
                          setShowDetailsModal(true);
                        }}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    // <AdminLayout tabValue="tutor-sessions">
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        {/* Header */}
        <Box sx={{
          background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)", // purple → blue
          // background: "gradient-text", // purple → blue
          color: "white", // make all text/icons readable
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          borderRadius: 2,
          mb: 4,
          //             }}sx={{
          //   mb: 4,
          //   display: 'flex',
          //   flexDirection: isMobile ? 'column' : 'row',
          //   alignItems: isMobile ? 'flex-start' : 'center',
          //   justifyContent: 'space-between',
          //   gap: 2
          // }}>
        }}>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}>
              Session Management
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Monitor and manage all tutoring sessions
            </Typography>
          </Box>

          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadSessions}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
            </Button>
          )}
        </Box>

       {/* Stats Overview */}
{/* Stats Overview */}
<Box
  sx={{
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch', // Ensures all cards have same height
    gap: 2,
    mb: 4,
  }}
>
  {[
    {
      title: 'Total Sessions',
      value: stats.total_sessions,
      icon: <BookOnline sx={{ opacity: 0.2, fontSize: { xs: 22, sm: 26 } }} />,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      color: 'white',
      trend: '+12% this month',
      trendIcon: <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: <MonetizationOn color="primary" sx={{ opacity: 0.3, fontSize: { xs: 22, sm: 26 } }} />,
      bg: 'white',
    },
    {
      title: 'Completed',
      value: stats.completed_sessions,
      icon: <CheckCircle color="success" sx={{ opacity: 0.3, fontSize: { xs: 22, sm: 26 } }} />,
      progress: (stats.completed_sessions / stats.total_sessions) * 100,
    },
    {
      title: 'Avg Rating',
      value: `${stats.average_rating.toFixed(1)}/5`,
      icon: <Star color="warning" sx={{ opacity: 0.3, fontSize: { xs: 22, sm: 26 } }} />,
      rating: true,
    },
  ].map((card, i) => (
    <Card
      key={i}
      sx={{
        flex: '1 1 calc(25% - 16px)', // 4 per row on large screens
        minWidth: { xs: '100%', sm: '48%', md: '23%' },
        borderRadius: '12px',
        background: card.gradient || card.bg || 'white',
        color: card.color || 'inherit',
        display: 'flex',
        flexDirection: 'column', // Ensures content aligns vertically
        justifyContent: 'space-between',
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1, // Makes all cards equal height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Top Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                lineHeight: 1.2,
              }}
            >
              {card.value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                mt: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
              }}
            >
              {card.title}
            </Typography>
          </Box>
          {card.icon}
        </Box>

        {/* Middle Section (optional) */}
        {card.trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 1, sm: 2 } }}>
            {card.trendIcon}
            <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              {card.trend}
            </Typography>
          </Box>
        )}

        {card.progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={card.progress}
            color="success"
            sx={{
              mt: { xs: 1, sm: 2 },
              height: { xs: 4, sm: 6 },
              borderRadius: 3,
            }}
          />
        )}

        {/* Bottom Section (optional rating) */}
        {card.rating && (
          <Box sx={{ mt: { xs: 1, sm: 1.5 } }}>{renderStars(stats.average_rating)}</Box>
        )}
      </CardContent>
    </Card>
  ))}
</Box>

        {/* Tabs and Filters */}
        <Card sx={{ mb: 3, borderRadius: '12px' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="session tabs"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="All Sessions" />
                <Tab label="Pending" />
                <Tab label="Confirmed" />
                <Tab label="Completed" />
                <Tab label="Cancelled" />
                <Tab label="In Progress" />
              </Tabs>
            </Box>

            <Box sx={{
              p: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <TextField
                size="small"
                placeholder="Search sessions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ width: isMobile ? '100%' : 600 }}
              />

              <TextField
                size="small"
                type="date"
                label="Date"
                value={filters.start_date}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters(prev => ({
                    ...prev,
                    start_date: v,
                    end_date: v,
                    page: 1
                  }));
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: isMobile ? '100%' : 250 }}
              />

              <Box sx={{
                display: 'flex',
                gap: 1,
                ml: isMobile ? 0 : 'auto',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'space-between' : 'flex-end'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  {pagination.total_items} results
                </Typography>
                <Button
                  variant="text"
                  onClick={() => setFilters({ page: 1, limit: 20, search: '', status: '', tutor_id: '', start_date: '', end_date: '' })}
                  sx={{ textTransform: 'none' }}
                >
                  Clear All
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <ResponsiveSessionTable />
        </Card>

        {/* Pagination */}
        {!isMobile && pagination.total_pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total_items)} of {pagination.total_items} entries
            </Typography>
            <Pagination
              count={pagination.total_pages}
              page={pagination.current_page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}


        {/* Session Details Modal */}
        <SessionDetailsModal
          session={selectedSession}
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSession(null);
          }}
        />
      </Box>
    // </AdminLayout>
  );
};

export default TutorSessionsPage;