import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  People,
  Assignment,
  PersonAdd,
  PersonRemove,
  HourglassEmpty
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/components/AdminLayout';
import { BASE_URL } from '../../config';
import { updateHireRequest, deleteHireRequest } from '../../services/adminService';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const HireRequestsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const [hireRequests, setHireRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Start with true to show loading
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    status: '',
    tutor_id: '',
    student_id: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_items: 0,
    items_per_page: 15,
    has_next: false,
    has_prev: false
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('info');

  const token = localStorage.getItem('authToken');

  const fetchHireRequests = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${BASE_URL}/api/admin/hire-requests?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setHireRequests(data.hireRequests || []);
        setPagination(data.pagination || {});
        setStats(data.stats || {});
      } else {
        throw new Error(data.message || 'Failed to fetch hire requests');
      }
    } catch (err) {
      //console.error('Error fetching hire requests:', err);
      setError(err.message);
      setHireRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters(prev => ({
          ...prev,
          search: searchInput,
          page: 1
        }));
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.search]);

  useEffect(() => {
    fetchHireRequests();
  }, [filters.page, filters.limit, filters.status, filters.search, filters.tutor_id, filters.student_id]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const statusMap = ['', 'pending', 'accepted', 'rejected'];
    setFilters(prev => ({
      ...prev,
      status: statusMap[newValue],
      page: 1
    }));
  };

  const handleSearchChange = useCallback((event) => {
    setSearchInput(event.target.value);
  }, []);

  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleRefresh = useCallback(() => {
    fetchHireRequests(filters);
  }, [fetchHireRequests, filters]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const openEditDialog = (request) => {
    setSelectedRequest(request);
    setEditStatus(request.status || (request.hire_for_this_tutor && request.hire_for_this_tutor.status) || 'pending');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest) return;
    const studentId = selectedRequest._id || selectedRequest.student?._id || selectedRequest.student_profile_id;
    const hireId = (selectedRequest.hire_for_this_tutor && selectedRequest.hire_for_this_tutor._id) || selectedRequest.hire_record_id || selectedRequest.hireId || (selectedRequest.hire && selectedRequest.hire._id);
    if (!studentId || !hireId) {
      setError('Missing identifiers to perform update');
      setSnackMsg('Missing identifiers to perform update');
      setSnackSeverity('error');
      setSnackOpen(true);
      return;
    }

    try {
      setLoading(true);
      await updateHireRequest(studentId, hireId, { status: editStatus });
      // Refresh list
      await fetchHireRequests();
      setEditDialogOpen(false);
      setDetailDialogOpen(false);
      setSnackMsg('Hire request updated');
      setSnackSeverity('success');
      setSnackOpen(true);
    } catch (err) {
      let msg = err?.message || 'Failed to update hire request';
      try {
        const parsed = JSON.parse(msg);
        msg = parsed.message || msg;
      } catch (_) {}
      setError(msg);
      setSnackMsg(msg);
      setSnackSeverity('error');
      setSnackOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (request) => {
    setSelectedRequest(request);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRequest) return;
    const studentId = selectedRequest._id || selectedRequest.student?._id || selectedRequest.student_profile_id;
    const hireId = (selectedRequest.hire_for_this_tutor && selectedRequest.hire_for_this_tutor._id) || selectedRequest.hire_record_id || selectedRequest.hireId || (selectedRequest.hire && selectedRequest.hire._id);
    if (!studentId || !hireId) {
      setError('Missing identifiers to perform delete');
      setSnackMsg('Missing identifiers to perform delete');
      setSnackSeverity('error');
      setSnackOpen(true);
      return;
    }

    try {
      setLoading(true);
      await deleteHireRequest(studentId, hireId);
      await fetchHireRequests();
      setDeleteConfirmOpen(false);
      setDetailDialogOpen(false);
      setSnackMsg('Hire request deleted');
      setSnackSeverity('success');
      setSnackOpen(true);
    } catch (err) {
      let msg = err?.message || 'Failed to delete hire request';
      try {
        const parsed = JSON.parse(msg);
        msg = parsed.message || msg;
      } catch (_) {}
      setError(msg);
      setSnackMsg(msg);
      setSnackSeverity('error');
      setSnackOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackClose = () => setSnackOpen(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', icon: <HourglassEmpty />, label: 'Pending' };
      case 'accepted':
        return { color: 'success', icon: <CheckCircle />, label: 'Accepted' };
      case 'rejected':
        return { color: 'error', icon: <Cancel />, label: 'Rejected' };
      default:
        return { color: 'default', icon: <Info />, label: 'Unknown' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTableHeaders = () => {
    if (isSmallMobile) {
      return ['Student', 'Tutor', 'Status', 'Actions'];
    } else if (isTablet) {
      return ['Student', 'Tutor', 'Subject', 'Status', 'Actions'];
    } else if (isMobile) {
      return ['Student', 'Tutor', 'Subject', 'Academic Level', 'Status', 'Actions'];
    } else {
      return ['Student', 'Tutor', 'Subject', 'Academic Level', 'Status', 'Actions'];
    }
  };

  const renderMobileCard = (request, index) => {
    const statusInfo = getStatusColor(request.status);
    
    return (
      <Card 
        key={`${request._id}-${index}-${filters.search}`} 
        sx={{ 
          mb: 2, 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          {/* Header with Student and Status */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Avatar
                src={request.student?.photo_url}
                alt={request.student?.name || 'Student'}
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  bgcolor: theme.palette.primary.main,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {request.student?.name ? request.student.name.charAt(0).toUpperCase() : 'S'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight="bold"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {request.student?.name || 'Unknown Student'}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block'
                  }}
                >
                  {request.student?.email}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 }
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Tutor Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar
              src={request.tutor?.photo_url}
              alt={request.tutor?.name || 'Tutor'}
              sx={{
                width: { xs: 20, sm: 24 },
                height: { xs: 20, sm: 24 },
                bgcolor: theme.palette.secondary.main,
                fontSize: { xs: '0.65rem', sm: '0.75rem' }
              }}
            >
              {request.tutor?.name ? request.tutor.name.charAt(0).toUpperCase() : 'T'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {request.tutor?.name || 'Unknown Tutor'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}
              >
                {request.tutor?.email}
              </Typography>
            </Box>
          </Box>

          {/* Subject and Level Info */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 1 },
              mb: 1
            }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Subject: {request.subject?.name || 'N/A'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Level: {request.academic_level?.level || 'N/A'}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              Date: {formatDate(request.hired_at)}
            </Typography>
          </Box>

          {/* Action Button */}
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => handleViewDetails(request)}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.5, sm: 1 },
              textTransform: 'none'
            }}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderDesktopTable = () => {
    const headers = getTableHeaders();
    
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
              {headers.map((header, index) => (
                <TableCell 
                  key={index}
                  sx={{ 
                    fontWeight: 'bold', 
                    color: theme.palette.primary.main,
                    borderBottom: `2px solid ${theme.palette.primary.main}`
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={headers.length} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body1" color="text.secondary">
                      Loading hire requests...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : hireRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Assignment sx={{ fontSize: 48, color: theme.palette.text.secondary }} />
                    <Typography variant="h6" color="text.secondary">
                      No Hire Requests Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchInput || filters.status 
                        ? 'Try adjusting your search criteria' 
                        : 'No hire requests have been made yet'
                      }
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
                
              hireRequests.map((request, index) => {
                const statusInfo = getStatusColor(request.status);
                return (
                  <TableRow 
                    key={`${request._id}-${index}-${filters.search}`}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewDetails(request)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={request.student?.photo_url}
                          alt={request.student?.name || 'Student'}
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '0.875rem'
                          }}
                        >
                          {request.student?.name ? request.student.name.charAt(0).toUpperCase() : 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {request.student?.name || 'Unknown Student'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.student?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={request.tutor?.photo_url}
                          alt={request.tutor?.name || 'Tutor'}
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.secondary.main,
                            fontSize: '0.875rem'
                          }}
                        >
                          {request.tutor?.name ? request.tutor.name.charAt(0).toUpperCase() : 'T'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {request.tutor?.name || 'Unknown Tutor'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.tutor?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {!isSmallMobile && (
                      <TableCell>
                        <Chip
                          label={request.subject?.name || 'N/A'}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ 
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            height: { xs: 20, sm: 24 }
                          }}
                        />
                      </TableCell>
                    )}

                    {!isTablet && (
                      <TableCell>
                        <Chip
                          label={request.academic_level?.level || 'N/A'}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          sx={{ 
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            height: { xs: 20, sm: 24 }
                          }}
                        />
                      </TableCell>
                    )}

                    <TableCell>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(request);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(request);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(request);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    // <AdminLayout>
      <Box sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            sx={{ 
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            Hire Requests Management
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Monitor student-tutor hire requests and their status
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          mb: { xs: 2, sm: 3 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
          <Card sx={{ 
            flex: 1,
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' },
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent sx={{ 
              color: 'white', 
              textAlign: 'center', 
              py: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 2 }
            }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                {stats.total}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Total Requests
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1,
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' },
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent sx={{ 
              color: 'white', 
              textAlign: 'center', 
              py: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 2 }
            }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                {stats.pending}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Pending
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1,
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' },
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent sx={{ 
              color: 'white', 
              textAlign: 'center', 
              py: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 2 }
            }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                {stats.accepted}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Accepted
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1,
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' },
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent sx={{ 
              color: 'white', 
              textAlign: 'center', 
              py: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 2 }
            }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                {stats.rejected}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ 
          mb: { xs: 2, sm: 3 }, 
          borderRadius: 2 
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Search bar - full width */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search students, tutors, subjects, Academic Level..."
                value={searchInput}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    padding: '2px 8px',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
              
              {/* Refresh button - full width */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Refresh
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Card sx={{ 
          mb: { xs: 2, sm: 3 }, 
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              minHeight: { xs: 40, sm: 48 }
            }}
            variant={isSmallMobile ? "scrollable" : "standard"}
            scrollButtons={isSmallMobile ? "auto" : false}
            allowScrollButtonsMobile={isSmallMobile}
          >
            <Tab 
              label={`All (${stats.total})`} 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 }
              }} 
            />
            <Tab 
              label={`Pending (${stats.pending})`} 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 }
              }} 
            />
            <Tab 
              label={`Accepted (${stats.accepted})`} 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 }
              }} 
            />
            <Tab 
              label={`Rejected (${stats.rejected})`} 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 }
              }} 
            />
          </Tabs>
        </Card>

        {/* Content */}
        {isMobile ? (
          <Box>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                <CircularProgress size={{ xs: 32, sm: 40 }} />
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Loading hire requests...
                </Typography>
              </Box>
            ) : hireRequests.length === 0 ? (
              <Card sx={{ 
                borderRadius: 2, 
                textAlign: 'center', 
                py: { xs: 4, sm: 6 },
                px: { xs: 2, sm: 3 }
              }}>
                <Assignment sx={{ 
                  fontSize: { xs: 36, sm: 48 }, 
                  color: theme.palette.text.secondary, 
                  mb: 2 
                }} />
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    mb: 1
                  }}
                >
                  No Hire Requests Found
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {searchInput || filters.status 
                    ? 'Try adjusting your search criteria' 
                    : 'No hire requests have been made yet'
                  }
                </Typography>
              </Card>
            ) : (
              hireRequests.map((request, index) => renderMobileCard(request, index))
            )}
          </Box>
        ) : (
          <Box sx={{ overflow: 'auto' }}>
            {renderDesktopTable()}
          </Box>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 0 }
          }}>
            <Pagination
              count={pagination.total_pages}
              page={pagination.current_page}
              onChange={handlePageChange}
              color="primary"
              size={isSmallMobile ? "small" : isMobile ? "medium" : "large"}
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
          </Box>
        )}

        {/* Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={() => setDetailDialogOpen(false)}
        maxWidth={isSmallMobile ? "sm" : isMobile ? "sm" : "sm"}
          fullWidth
          fullScreen={isSmallMobile}
          PaperProps={{
            sx: { 
              borderRadius: { xs: 0, sm: 3 },
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              m: { xs: 0, sm: 2 },
              maxHeight: { xs: '100vh', sm: '90vh' }
            }
          }}
        >
  <DialogTitle 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      py: 2
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Hire Request Details
    </Typography>
    <IconButton 
      onClick={() => setDetailDialogOpen(false)}
      sx={{ color: 'white' }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  
  <DialogContent sx={{ 
    py: { xs: 2, sm: 3 }, 
    mt: { xs: 1, sm: 3 },
    px: { xs: 1, sm: 2 }
  }}>
    {selectedRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Student and Tutor Information - Side by Side */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'column' }, 
                gap: 2,
                alignItems: 'stretch'
              }}>
        {/* Student Information */}
          <Card 
            sx={{ 
                    flex: 1,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
          >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#4f46e5',
                  fontWeight: 600
                }}
              >
                <PersonIcon sx={{ color: '#4f46e5' }} />
                Student Information
              </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      flex: 1,
                      justifyContent: 'center'
                    }}>
                      <Avatar
                        src={selectedRequest.student?.photo_url}
                  alt={selectedRequest.student?.name || 'Student'}
                  sx={{ 
                          width: 80,
                          height: 80,
                    border: '3px solid #e0e7ff',
                          bgcolor: '#4f46e5',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedRequest.student?.name ? selectedRequest.student.name.charAt(0).toUpperCase() : 'S'}
                      </Avatar>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 1 }}>
                    {selectedRequest.student?.name || 'Unknown Student'}
                  </Typography>
                        <Typography variant="body1" color="#64748b">
                    {selectedRequest.student?.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

        {/* Tutor Information */}
          <Card 
            sx={{ 
                    flex: 1,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
          >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#059669',
                  fontWeight: 600
                }}
              >
                <SchoolIcon sx={{ color: '#059669' }} />
                Tutor Information
              </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      flex: 1,
                      justifyContent: 'center'
                    }}>
                      <Avatar
                        src={selectedRequest.tutor?.photo_url}
                  alt={selectedRequest.tutor?.name || 'Tutor'}
                  sx={{ 
                          width: 80,
                          height: 80,
                    border: '3px solid #d1fae5',
                          bgcolor: '#059669',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedRequest.tutor?.name ? selectedRequest.tutor.name.charAt(0).toUpperCase() : 'T'}
                      </Avatar>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 1 }}>
                    {selectedRequest.tutor?.name || 'Unknown Tutor'}
                  </Typography>
                        <Typography variant="body1" color="#64748b">
                    {selectedRequest.tutor?.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
              </Box>

              {/* Request Details - 2x2 Grid */}
          <Card 
            sx={{ 
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#7c3aed',
                  fontWeight: 600
                }}
              >
                <Assignment sx={{ color: '#7c3aed' }} />
                Request Details
              </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                    gap: 2 
                  }}>
                    <Box sx={{ textAlign: 'center', p: 3, background: '#f0f9ff', borderRadius: 2 }}>
                      <Typography variant="body2" color="#0369a1" fontWeight="medium" sx={{ mb: 1 }}>
                      Subject
                    </Typography>
                      <Typography variant="h6" fontWeight="bold" color="#0c4a6e">
                      {selectedRequest.subject?.name || 'N/A'}
                    </Typography>
                  </Box>
                    <Box sx={{ textAlign: 'center', p: 3, background: '#f0fdf4', borderRadius: 2 }}>
                      <Typography variant="body2" color="#059669" fontWeight="medium" sx={{ mb: 1 }}>
                      Academic Level
                    </Typography>
                      <Typography variant="h6" fontWeight="bold" color="#064e3b">
                      {selectedRequest.academic_level?.level || 'N/A'}
                    </Typography>
                  </Box>
                    <Box sx={{ textAlign: 'center', p: 3, background: '#fffbeb', borderRadius: 2 }}>
                      <Typography variant="body2" color="#d97706" fontWeight="medium" sx={{ mb: 1 }}>
                      Status
                    </Typography>
                      <Chip
                        icon={getStatusColor(selectedRequest.status).icon}
                        label={getStatusColor(selectedRequest.status).label}
                        color={getStatusColor(selectedRequest.status).color}
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 3, background: '#faf5ff', borderRadius: 2 }}>
                      <Typography variant="body2" color="#7c3aed" fontWeight="medium" sx={{ mb: 1 }}>
                      Request Date
                    </Typography>
                      <Typography variant="h6" fontWeight="bold" color="#5b21b6">
                      {formatDate(selectedRequest.hired_at)}
                    </Typography>
                  </Box>
                  </Box>
            </CardContent>
          </Card>
            </Box>
    )}
  </DialogContent>
  
  <DialogActions sx={{ 
    px: { xs: 2, sm: 3 }, 
    py: { xs: 1.5, sm: 2 }, 
    background: '#f8fafc' 
  }}>
    <Button 
      onClick={() => setDetailDialogOpen(false)}
      variant="outlined"
      fullWidth={isSmallMobile}
      sx={{
        borderRadius: 2,
        px: { xs: 2, sm: 3 },
        py: { xs: 0.75, sm: 1 },
        borderColor: '#cbd5e1',
        color: '#475569',
        fontWeight: 600,
        fontSize: { xs: '0.875rem', sm: '1rem' },
        '&:hover': {
          borderColor: '#94a3b8',
          background: 'rgba(100, 116, 139, 0.04)'
        }
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

      {/* Edit Hire Request Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Hire Request</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="edit-status-label">Status</InputLabel>
            <Select
              labelId="edit-status-label"
              value={editStatus}
              label="Status"
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Hire Request</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this hire request? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={handleSnackClose}>
        <MuiAlert elevation={6} variant="filled" onClose={handleSnackClose} severity={snackSeverity}>
          {snackMsg}
        </MuiAlert>
      </Snackbar>
      </Box>
    // </AdminLayout>
  );
};

export default HireRequestsPage;
