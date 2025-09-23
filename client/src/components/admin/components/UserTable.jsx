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
  const { subjects } = useSubject();

  const getSubjectName = (id) => {
 
    const subject = subjects.find(s => s._id === id);
    return subject ? subject: '';
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
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={getStatusIcon(user.status)}
            >
              

              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {user?.photo_url ? (
                        <img
                          src={`${BASE_URL}${user.photo_url}`}
                          alt="Profile"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-10 w-10 text-white" />
                      )}
                    </div>
            </Badge>
            <Box style={{marginLeft:"10px"}}>
              <Typography fontWeight="medium" variant="body1">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              {tabValue === 'tutors' && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {user.location || 'Location not specified'}
              </Typography>
              )}
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
                      label={getSubjectName(subject._id).name}
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

                  {user.documents?.filter(d => d.verified ==="Approved").length || 0}/{user.documents?.length || 0}
                </Typography>
                {user.documents?.every(d => d.verified === "Approved") ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : user.documents?.some(d => d.verified === "Rejected") ? (
                  <Cancel color="error" fontSize="small" />
                ) : (
                  <Pending color="warning" fontSize="small" />
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
                      label={getSubjectName(subject).name}
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
                    key={child._id}
                    label={`${child.user_id?.full_name || "Unknown"}`}
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
                  sx={{ fontSize: '0.7rem' }}
                />
              </Tooltip>
              
                )}
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
  searchTerm = '',  onImport,
  onRefresh
}) => {
  const navigate = useNavigate();
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
      return [...baseHeaders, 'Children', 'Actions'];
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
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Table>
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
                    py: 1.5,
                    letterSpacing: 0.2
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