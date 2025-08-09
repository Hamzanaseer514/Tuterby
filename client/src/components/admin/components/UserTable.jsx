import React, { useState, useEffect, Suspense } from 'react';
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
  Divider
} from '@mui/material';
import { Visibility, MoreVert, CheckCircle, Pending, Star, School, Person, ContactMail, Edit, Delete } from '@mui/icons-material';
import UserDetailDialog from './UserDetailDialog';
  

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
                  variant={user.status === 'inactive' ? 'outlined' : 'filled'}
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
            {/* <TableCell> */}
            {/* <Tooltip title={user.interviewCompleted ? "Interview completed" : "Interview pending"}> */}
            {/* <Box sx={{ display: 'flex', alignItems: 'center' }}> */}
            {/* {getTabIcon(tabValue)} */}
            {/* {user.interviewCompleted ? (
                    <CheckCircle color="success" sx={{ ml: 1 }} />
                  ) : (
                    <Pending color="warning" sx={{ ml: 1 }} />
                  )} */}
            {/* </Box> */}
            {/* </Tooltip> */}
            {/* </TableCell> */}
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
      return [...baseHeaders, 'Subjects', 'Status', 'Documents', 'Actions'];
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
      <Suspense fallback={null}>
      <UserDetailDialog
        open={dialogOpen}
        user={selectedUser}
        tabValue={tabValue}
        onClose={handleCloseDialog}
      />
      </Suspense>

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