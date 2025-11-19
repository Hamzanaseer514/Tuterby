import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Slide,
  Paper,
  Menu,
  MenuItem,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Badge,
  CircularProgress,
  useTheme,
  useMediaQuery
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
  Edit,
  Delete,
  Search,
  FilterList,
  Refresh,
  FileDownload,
  GridView,
  TableRows,
  Add,
  Cancel,
} from '@mui/icons-material';
import { useSubject } from '../../../hooks/useSubject';
import { BASE_URL } from '../../../config';
import {
  User,
  GraduationCap
} from 'lucide-react';



const UserTableRow = ({ user, tabValue, statusColors, onViewUser, onMenuClick, index }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle color="success" fontSize="small" />;
      case 'inactive':
        return <Cancel color="error" fontSize="small" />;
      case 'pending':
        return <Pending color="warning" fontSize="small" />;
      default:
        return <Pending color="action" fontSize="small" />;
    }
  };
  const { subjects, academicLevels } = useSubject();
  // subjects may be loaded asynchronously by `useSubject()` and IDs may be strings
  // or objects depending on the backend shape. Make lookup robust and return
  // a string name (or empty string) so rendering is stable.
  const getSubjectName = (idOrObj) => {
    try {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return '';

      const id = idOrObj && idOrObj._id ? String(idOrObj._id) : String(idOrObj || '');
      if (!id) return '';

      const subj = subjects.find(s => String(s._id) === id || String(s._id) === String(id));
      return subj && subj.name ? subj.name : '';
    } catch (err) {
      return '';
    }
  };
  const getAcademicLevel = (level) => {
    const matchedLevel = academicLevels.find(l => l._id === level.toString());
    return matchedLevel ? matchedLevel : '';
  }
  return (
    <Slide direction="up" in timeout={300 + index * 50}>
      <TableRow
        onClick={() => onViewUser(user)}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            cursor: 'pointer'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={getStatusIcon(user.status)}
            >


              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                {user?.photo_url ? (
                  
                  <img
                    src={`${user.photo_url}`}
                    alt="Profile"
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              
            </Badge>
            <Box sx={{ marginLeft: { xs: "8px", sm: "10px" }, minWidth: 0, flex: 1 }}>
              <Typography 
                fontWeight="medium" 
                variant="body1"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {user.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user.email}
              </Typography>
              {tabValue === 'tutors' && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  {user.location || 'Location not specified'}
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>

        {tabValue === 'tutors' && (
          <>
            <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Array.isArray(user.subjects) && user.subjects.length > 0 ? (
                  user.subjects.slice(0, 3).map((subject, index) => {
                    const name = getSubjectName(subject);
                    return (
                      <Chip
                        key={(subject && subject._id) ? String(subject._id) : `subject-${index}`}
                        label={name || 'Unknown Subject'}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          height: { xs: 20, sm: 24 }
                        }}
                      />
                    );
                  })
                ) : (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    No subjects
                  </Typography>
                )}
                {user.subjects?.length > 3 && (
                  <Tooltip title={user.subjects.slice(3).map(s => getSubjectName(s) || (s && (s.name || s)) || '').filter(Boolean).join(', ')}>
                    <Chip
                      label={`+${user.subjects.length - 3}`}
                      size="small"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                    />
                  </Tooltip>
                )}
              </Box>
            </TableCell>
            <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={user.status}
                  color={statusColors[user.status]}
                  size="small"
                  variant={user.status === 'inactive' ? 'outlined' : 'filled'}
                  sx={{ 
                    fontWeight: 'medium', 
                    textTransform: 'capitalize',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 22, sm: 24 }
                  }}
                />
              </Box>
            </TableCell>
            <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {user.documents?.filter(d => d.verified === "Approved").length || 0}/{user.documents?.length || 0}
                </Typography>
                {user.documents?.every(d => d.verified === "Approved") ? (
                  <CheckCircle color="success" fontSize="small" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                ) : user.documents?.some(d => d.verified === "Rejected") ? (
                  <Cancel color="error" fontSize="small" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                ) : (
                  <Pending color="warning" fontSize="small" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                )}
              </Box>
            </TableCell>
          </>
        )}

        {tabValue === 'students' && (
          <>
            <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.subjects?.length > 0 ? (
                  user.subjects.slice(0, 3).map((subject, index) => (
                    <Chip
                      key={(subject && subject._id) ? String(subject._id) : `subject-${index}`}
                      label={getSubjectName(subject) || 'Unknown Subject'}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        borderColor: 'success.main',
                        color: 'success.main',
                        height: { xs: 20, sm: 24 }
                      }}
                    />
                  ))
                ) : (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    No subjects
                  </Typography>
                )}
                {user.subjects?.length > 3 && (
                  <Tooltip title={user.subjects.slice(3).map(s => getSubjectName(s) || (s && (s.name || s)) || '').filter(Boolean).join(', ')}>
                    <Chip
                      label={`+${user.subjects.length - 3}`}
                      size="small"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                    />
                  </Tooltip>
                )}
              </Box>
            </TableCell>
            <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {user.sessionsCompleted || 0}
                </Typography>
                <School color="primary" fontSize="small" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
              </Box>
            </TableCell>
            <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* <AcademicCap color="warning" fontSize="small" /> */}
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {user.academic_level ? `${getAcademicLevel(user.academic_level).level}` : 'N/A'}
                </Typography>
              </Box>
            </TableCell>
          </>
        )}

        {tabValue === 'parents' && (
          <>
            <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.children?.length > 0 ? (
                  user.children.slice(0, 3).map(child => (
                    <Chip
                      key={child._id}
                      label={`${child.user_id?.full_name || "Unknown"}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        borderColor: 'info.main',
                        color: 'info.main',
                        height: { xs: 20, sm: 24 }
                      }}
                    />
                  ))

                ) : (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    No children
                  </Typography>
                )}
                {user.children?.length > 3 && (
                  <Tooltip
                    title={user.children
                      .slice(3)
                      .map(child => `${child.user_id?.full_name || "Unknown"} (${child.user_id?.email || "No email"})`)
                      .join(', ')
                    }
                  >
                    <Chip
                      label={`+${user.children.length - 3}`}
                      size="small"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                    />
                  </Tooltip>

                )}
              </Box>
            </TableCell>

          </>
        )}

        <TableCell sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                onClick={() => onViewUser(user)}
                size="small"
                sx={{
                  color: 'primary.main',
                  padding: { xs: '4px', sm: '8px' },
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Visibility fontSize="small" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
              </IconButton>
            </Tooltip>
            {/* <Tooltip title="More Actions">
              <IconButton
                onClick={(e) => onMenuClick(e, user)}
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip> */}
          </Box>
        </TableCell>
      </TableRow>
    </Slide>
  );
};


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
  loading = false,
  onRequestReload,
  showNotification,
  onSearch,
  onFilterChange,
  onViewModeChange,
  viewMode = 'table',
  searchTerm = '', onImport,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounced spinner: only show spinner if loading persists for >150ms
  useEffect(() => {
    let t;
    if (loading) {
      t = setTimeout(() => setShowSpinner(true), 150);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(t);
  }, [loading]);

  const handleViewUser = (user) => {
    navigate(`/admin/user-detail/${tabValue}`, {
      state: { user, tabValue }
    });
  };





  const handleMenuClick = (event, user) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuUser(null);
  };



  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case 'view':
        handleViewUser(selectedMenuUser);
        break;
      case 'approve':
        // Handle approve action
        showNotification(`${selectedMenuUser.name} approved successfully`);
        break;
      case 'reject':
        // Handle reject action
        showNotification(`${selectedMenuUser.name} rejected`, 'warning');
        break;
      case 'edit':
        // Handle edit action
        showNotification(`Editing ${selectedMenuUser.name}`);
        break;
      case 'delete':
        // Handle delete action
        showNotification(`${selectedMenuUser.name} deleted`, 'error');
        break;
      default:
        break;
    }
    handleMenuClose();
  };

  const getTableHeaders = () => {
    const baseHeaders = ['User'];

    if (tabValue === 'tutors') {
      return [...baseHeaders, 'Subjects', 'Status', 'Documents', 'Actions'];
    } else if (tabValue === 'students') {
      return [...baseHeaders, 'Subjects', 'Sessions', 'Academic Level', 'Actions'];
    } else if (tabValue === 'parents') {
      return [...baseHeaders, 'Children', 'Actions'];
    }

    return [...baseHeaders, 'Actions'];
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ width: '100%' }}>


      {/* Main Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          bgcolor: 'background.paper',
          boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          }
        }}
      >
        <Table sx={{ minWidth: isMobile ? 800 : 'auto' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              {getTableHeaders().map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 1, sm: 2 },
                    letterSpacing: 0.2,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(
              /* Show loading spinner when the debounced `showSpinner` flag is true.
                 Parent should set `loading` while fetching. Using the debounced
                 flag avoids flicker and ensures a loader appears for real network
                 loads even if `users` is temporarily an empty array. */
              showSpinner
            ) ? (
              <TableRow>
                <TableCell colSpan={getTableHeaders().length} sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body1" color="text.secondary">
                      Loading {tabValue}...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : users && users.length > 0 ? (
              users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => (
                  <UserTableRow
                    key={user.id || index}
                    user={user}
                    tabValue={tabValue}
                    statusColors={statusColors}
                    onViewUser={handleViewUser}
                    onMenuClick={handleMenuClick}
                    index={index}
                  />
                ))
            ) : localSearchTerm ? (
              <TableRow>
                <TableCell colSpan={getTableHeaders().length} sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      No results found for "{localSearchTerm}"
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ mt: 1 }}
                    >
                      Clear search
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={getTableHeaders().length} sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                      No {tabValue} found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are currently no {tabValue} registered in the system.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={users ? users.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontWeight: 'medium',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          },
          '.MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 0 }
          },
          '.MuiTablePagination-spacer': {
            display: { xs: 'none', sm: 'flex' }
          },
          mt: 1
        }}
        labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
        labelDisplayedRows={({ from, to, count }) => 
          isMobile ? `${from}-${to} of ${count}` : `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />





      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            mt: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuAction('view')} dense>
          <Visibility sx={{ mr: 1, fontSize: '1rem' }} /> View Details
        </MenuItem>
        {tabValue === 'tutors' && (
          <>
            <MenuItem
              onClick={() => handleMenuAction('approve')}
              disabled={selectedMenuUser?.status === 'verified'}
              dense
            >
              <CheckCircle sx={{ mr: 1, fontSize: '1rem' }} /> Approve
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuAction('reject')}
              disabled={selectedMenuUser?.status === 'rejected'}
              dense
            >
              <Pending sx={{ mr: 1, fontSize: '1rem' }} /> Reject
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('edit')} dense>
              <Edit sx={{ mr: 1, fontSize: '1rem' }} /> Edit
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem
          onClick={() => handleMenuAction('delete')}
          sx={{ color: 'error.main' }}
          dense
        >
          <Delete sx={{ mr: 1, fontSize: '1rem' }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserTable;