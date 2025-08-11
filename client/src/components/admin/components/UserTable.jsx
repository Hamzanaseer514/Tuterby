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
  Skeleton,
  Slide,
  Paper,
  Menu,
  MenuItem,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Badge
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
  Add
} from '@mui/icons-material';


const UserTableRow = ({ user, tabValue, statusColors, onViewUser, onMenuClick, index }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle color="success" fontSize="small" />;
      case 'pending':
        return <Pending color="warning" fontSize="small" />;
      case 'rejected':
        return <Pending color="error" fontSize="small" />;
      default:
        return <Pending color="action" fontSize="small" />;
    }
  };

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
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={getStatusIcon(user.status)}
            >
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
            </Badge>
            <Box>
              <Typography fontWeight="medium" variant="body1">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {user.location || 'Location not specified'}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        {tabValue === 'tutors' && (
          <>
            <TableCell>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Array.isArray(user.subjects) && user.subjects.length > 0 ? (
                  user.subjects.slice(0, 3).map(subject => (
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
                    No subjects
                  </Typography>
                )}
                {user.subjects?.length > 3 && (
                  <Tooltip title={user.subjects.slice(3).join(', ')}>
                    <Chip
                      label={`+${user.subjects.length - 3}`}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                )}
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={user.status}
                  color={statusColors[user.status]}
                  size="small"
                  variant={user.status === 'inactive' ? 'outlined' : 'filled'}
                  sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}
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
                ) : user.documents?.some(d => d.verified) ? (
                  <Pending color="warning" fontSize="small" />
                ) : (
                  <Pending color="error" fontSize="small" />
                )}
              </Box>
            </TableCell>
          </>
        )}

        {tabValue === 'students' && (
          <>
            <TableCell>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.subjects?.length > 0 ? (
                  user.subjects.slice(0, 3).map(subject => (
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
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No subjects
                  </Typography>
                )}
                {user.subjects?.length > 3 && (
                  <Tooltip title={user.subjects.slice(3).join(', ')}>
                    <Chip
                      label={`+${user.subjects.length - 3}`}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                )}
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {user.sessionsCompleted || 0}
                </Typography>
                <School color="primary" fontSize="small" />
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star color="warning" fontSize="small" />
                <Typography variant="body2" fontWeight="medium">
                  {user.rating ? `${user.rating}/5` : 'N/A'}
                </Typography>
              </Box>
            </TableCell>
          </>
        )}

        {tabValue === 'parents' && (
          <>
            <TableCell>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.children?.length > 0 ? (
                  user.children.slice(0, 3).map(child => (
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
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No children
                  </Typography>
                )}
                {user.children?.length > 3 && (
                  <Tooltip title={user.children.slice(3).join(', ')}>
                    <Chip
                      label={`+${user.children.length - 3}`}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                )}
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {user.sessionsBooked || 0}
                </Typography>
                <School color="primary" fontSize="small" />
              </Box>
            </TableCell>
          </>
        )}

        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                onClick={() => onViewUser(user)}
                size="small"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Visibility fontSize="small" />
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

const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <TableRow key={index}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton variant="text" width="100%" height={40} />
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
  loading = false,
  onRequestReload,
  showNotification,
  onSearch,
  onFilterChange,
  onViewModeChange,
  viewMode = 'table',
  searchTerm = '',
  onExport,
  onImport,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

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

  const handleSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
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
      return [...baseHeaders, 'Subjects', 'Sessions', 'Rating', 'Actions'];
    } else if (tabValue === 'parents') {
      return [...baseHeaders, 'Children', 'Sessions Booked', 'Actions'];
    }

    return [...baseHeaders, 'Actions'];
  };

  return (
    <Box sx={{ width: '100%' }}>
      

      {/* Main Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          backgroundColor: 'background.paper'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.default' }}>
              {getTableHeaders().map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={rowsPerPage} columns={getTableHeaders().length} />
            ) : users.length > 0 ? (
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
            ) : (
              <TableRow>
                <TableCell colSpan={getTableHeaders().length} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No {tabValue} found matching your criteria
                  </Typography>
                  <Button 
                    variant="text" 
                    onClick={handleClearSearch}
                    sx={{ mt: 1 }}
                  >
                    Clear search
                  </Button>
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
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontWeight: 'medium'
          },
          mt: 1
        }}
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