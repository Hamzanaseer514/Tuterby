import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
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
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
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
  FilterList,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
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
    items_per_page: 20
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
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllTutorSessions(filters);
      console.log("API Response:", response);

      if (response.success) {
        setSessions(response.data);
        setPagination(response.pagination);
        setStats(response.stats);
      } else {
        setError(response.message || 'Failed to load sessions');
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
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
    const statusMap = { 0: '', 1: 'pending', 2: 'confirmed', 3: 'completed', 4: 'cancelled' };
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

        <DialogContent dividers sx={{ p: { xs: 1, sm: 3 }, bgcolor: '#F9FAFB', overflow: 'auto' }}>
          <Grid container spacing={2}>
            {/* Session Info */}
            <Grid item xs={12}>
              <Card
                sx={{
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                  borderRadius: 2,
                }}
              >
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
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Additional Info */}
                  <Grid item xs={12} md={3}>
                    <Card sx={{
                      height: "100%",
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: 'none',
                      borderRadius: 2,
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box display="flex" alignItems="center" mb={3}>
                          <MoreHorizIcon color="primary" sx={{ mr: 1, fontSize: { xs: '18px', sm: '24px' } }} />
                          <Typography variant="h6" fontWeight="600" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
                          <Box sx={{ my: 1.5 }}>
                            <Divider />
                          </Box>
                          <InfoRow label="Last Updated" value={formatDate(session.updated_at)} />

                          {session.session_type && (
                            <>
                              <Box sx={{ my: 1.5 }}>
                                <Divider />
                              </Box>
                              <InfoRow label="Session Type" value={session.session_type} />
                            </>
                          )}

                          {session.tags && session.tags.length > 0 && (
                            <>
                              <Box sx={{ my: 1.5 }}>
                                <Divider />
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
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
                              </Box>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Tutor Info */}
                  <Grid item xs={12} md={9}>
                    <Card sx={{
                      height: "100%",
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: 'none',
                      borderRadius: 2,
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box display="flex" alignItems="center" mb={3}>
                          <PersonIcon color="primary" sx={{ mr: 1, fontSize: { xs: '18px', sm: '24px' } }} />
                          <Typography variant="h6" fontWeight="600" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            Tutor Information
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="flex-start" p={2} sx={{ bgcolor: '#F1F5F9', borderRadius: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                          <Avatar
                            src={`${BASE_URL}${session.tutor.photo_url}`}
                            alt={session.tutor.full_name}
                            sx={{ width: 60, height: 60, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight="600" variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
              </Grid>
            )}

            {/* Students with details */}
            {session.students?.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "none",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PeopleIcon color="primary" sx={{ mr: 1, fontSize: { xs: '18px', sm: '24px' } }} />
                      <Typography variant="h6" fontWeight="600" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Students ({session.students.length})
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
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
                                border: "1px solid #E2E8F0",
                                borderRadius: 2,
                                background: "white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                "&:hover": { boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
                              }}
                            >
                              {/* Student Header */}
                              <Box display="flex" alignItems="flex-start" mb={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Avatar
                                  src={`${BASE_URL}${student.photo_url}`}
                                  alt={student.full_name}
                                  sx={{ width: 50, height: 50, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography fontWeight="600" variant="subtitle1">
                                    {student.full_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                                  >
                                    <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    {student.email}
                                  </Typography>
                                  <Box display="flex" alignItems="center" mt={0.5}>
                                    <PhoneIcon sx={{ fontSize: 14, mr: 0.5, color: "action.active" }} />
                                    <Typography variant="caption">
                                      {student.phone_number || "No phone"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              <Divider sx={{ my: 1.5 }} />

                              {/* Rating | Payment | Response */}
                              <Box display="flex" gap={2} flexWrap="wrap" sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
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
                                            fontStyle: "italic",
                                            mt: 1,
                                            color: "#64748B",
                                            fontSize: "0.875rem",
                                            wordBreak: 'break-word'
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
                                          studentPayment.payment_status === "paid"
                                            ? "success"
                                            : studentPayment.payment_status === "pending"
                                              ? "warning"
                                              : "error"
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
                                        {studentPayment.payment_method} •{" "}
                                        {studentPayment.payment_date
                                          ? formatDate(studentPayment.payment_date)
                                          : "Not Paid"}
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
                                        studentResponse.status === "confirmed"
                                          ? "success"
                                          : studentResponse.status === "declined"
                                            ? "error"
                                            : "warning"
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

  // Mobile Filter Drawer
  const MobileFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileFilterOpen}
      onClose={() => setMobileFilterOpen(false)}
      PaperProps={{
        sx: { width: '85%', maxWidth: 400 }
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Filters
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setMobileFilterOpen(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Date Range</Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Tutor</InputLabel>
          <Select
            value={filters.tutor_id}
            onChange={(e) => handleFilterChange('tutor_id', e.target.value)}
            label="Tutor"
          >
            <MenuItem value="">All Tutors</MenuItem>
            <MenuItem value="1">John Doe</MenuItem>
            <MenuItem value="2">Jane Smith</MenuItem>
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          onClick={() => setMobileFilterOpen(false)}
          sx={{ mt: 2 }}
        >
          Apply Filters
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            setFilters({ page: 1, limit: 20, search: '', status: '', tutor_id: '', start_date: '', end_date: '' });
            setMobileFilterOpen(false);
          }}
          sx={{ mt: 1 }}
        >
          Clear All
        </Button>
      </Box>
    </Drawer>
  );

  // Responsive table component
  const ResponsiveSessionTable = () => {
    if (isMobile) {
      return (
        <Box>
          {loading ? (
            // Mobile loading skeleton
            [...Array(5)].map((_, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="50%" />
                  </Box>
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </Card>
            ))
          ) : sessions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <BookOnline sx={{ fontSize: 60, color: 'grey.300', mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No sessions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your filters or search terms
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setFilters({ page: 1, limit: 20, search: '', status: '', tutor_id: '', start_date: '', end_date: '' })}
              >
                Clear all filters
              </Button>
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
              <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Rating</TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Desktop loading skeleton
              [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" /></TableCell>

                  {/* Cells visible only on md and up */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton variant="text" /></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton variant="text" /></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton variant="text" /></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton variant="text" /></TableCell>

                  <TableCell><Skeleton variant="text" /></TableCell>

                  {/* Cells visible only on sm and up */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Skeleton variant="text" /></TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Skeleton variant="text" /></TableCell>

                  <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
                </TableRow>
              ))
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
                    <Button
                      variant="outlined"
                      onClick={() => setFilters({ page: 1, limit: 20, search: '', status: '', tutor_id: '', start_date: '', end_date: '' })}
                    >
                      Clear all filters
                    </Button>
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
                        <Avatar                                  src={`${BASE_URL}${session.tutor.photo_url}`}
 sx={{ width: 32, height: 32 }}>
                          <Person />
                        </Avatar>
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

                  {/* Rating cell - visible only on sm and up */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {session.rating ? renderStars(session.rating) : (
                      <Typography variant="caption" color="text.secondary">
                        No rating
                      </Typography>
                    )}
                  </TableCell>

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
    <AdminLayout tabValue="tutor-sessions">
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        {/* Header */}
        <Box sx={{
          mb: 4,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}>
              Session Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
              Refresh Data
            </Button>
          )}
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              height: '100%'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {stats.total_sessions}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Sessions
                    </Typography>
                  </Box>
                  <BookOnline sx={{
                    fontSize: { xs: 20, sm: 25 },
                    opacity: 0.2,
                    position: 'absolute',
                    right: 12,
                    top: 12
                  }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />
                  <Typography variant="caption">+12% this month</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ borderRadius: '12px', height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {formatCurrency(stats.total_revenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Revenue
                    </Typography>
                  </Box>
                  <MonetizationOn color="primary" sx={{ fontSize: { xs: 20, sm: 25 }, opacity: 0.3 }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="caption" color="success.main">+8% this month</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ borderRadius: '12px', height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {stats.completed_sessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Completed
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: { xs: 20, sm: 25 }, opacity: 0.3 }} />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.completed_sessions / stats.total_sessions) * 100}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ borderRadius: '12px', height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700" color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {stats.pending_sessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Pending
                    </Typography>
                  </Box>
                  <Pending color="warning" sx={{ fontSize: { xs: 20, sm: 25 }, opacity: 0.3 }} />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.pending_sessions / stats.total_sessions) * 100}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  color="warning"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ borderRadius: '12px', height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {stats.average_rating.toFixed(1)}/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Avg Rating
                    </Typography>
                  </Box>
                  <Star color="warning" sx={{ fontSize: { xs: 20, sm: 25 }, opacity: 0.3 }} />
                </Box>
                {renderStars(stats.average_rating)}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                sx={{ width: isMobile ? '100%' : 300 }}
              />

              {isMobile ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => setMobileFilterOpen(true)}
                    sx={{ borderRadius: '8px', textTransform: 'none', width: '100%' }}
                  >
                    Filters
                  </Button>
                  <MobileFilterDrawer />
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Filters
                  </Button>

                  <Menu
                    anchorEl={filterMenuAnchor}
                    open={Boolean(filterMenuAnchor)}
                    onClose={() => setFilterMenuAnchor(null)}
                  >
                    <Box sx={{ p: 2, width: 300 }}>
                      <Typography variant="subtitle2" gutterBottom>Date Range</Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Start Date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="End Date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>

                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Tutor</InputLabel>
                        <Select
                          value={filters.tutor_id}
                          onChange={(e) => handleFilterChange('tutor_id', e.target.value)}
                          label="Tutor"
                        >
                          <MenuItem value="">All Tutors</MenuItem>
                          <MenuItem value="1">John Doe</MenuItem>
                          <MenuItem value="2">Jane Smith</MenuItem>
                        </Select>
                      </FormControl>

                      <Button
                        fullWidth
                        onClick={() => setFilterMenuAnchor(null)}
                        variant="contained"
                      >
                        Apply Filters
                      </Button>
                    </Box>
                  </Menu>
                </>
              )}

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

        {/* Error Display */}
        {error && (
          <Card
            sx={{
              mt: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.error.light}`,
              backgroundColor: alpha(theme.palette.error.main, 0.05)
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
              <Cancel color="error" />
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </CardContent>
          </Card>
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
    </AdminLayout>
  );
};

export default TutorSessionsPage;