import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Fade,
  Zoom,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  School,
  Person,
  ContactMail,
  Sort,
  ViewList,
  ViewModule,
  Download,
  Upload,
  Refresh
} from '@mui/icons-material';

const SearchAndFilterBar = ({
  tabValue,
  searchTerm,
  onTabChange,
  onSearch,
  onClearSearch,
  filters = {},
  onFilterChange,
  viewMode = 'table',
  onViewModeChange,
  onExport,
  onImport,
  onRefresh
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = React.useState(null);
  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
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
    <Fade in timeout={500}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}>
        {/* Tabs Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tabs 
            value={tabValue} 
            onChange={onTabChange}
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontWeight: 'medium',
                textTransform: 'none',
                fontSize: '0.9rem'
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold'
              }
            }}
          >
            <Tab 
              label="Tutors" 
              value="tutors" 
              icon={<School fontSize="small" />}
              iconPosition="start"
            />
            <Tab 
              label="Students" 
              value="students" 
              icon={<Person fontSize="small" />}
              iconPosition="start"
            />
            <Tab 
              label="Parents" 
              value="parents" 
              icon={<ContactMail fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Search and Actions Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search Field */}
          <Zoom in timeout={600}>
            <TextField
              size="small"
              placeholder={`Search ${tabValue}...`}
              value={searchTerm}
              onChange={onSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={onClearSearch}
                      sx={{ color: 'action.active' }}
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white'
                  }
                }
              }}
            />
          </Zoom>

          {/* Active Filters Display */}
          {Object.keys(filters).length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(filters).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  size="small"
                  onDelete={() => onFilterChange({ ...filters, [key]: undefined })}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          )}

          {/* Filter Button */}
          <Tooltip title="Advanced Filters">
            <IconButton
              onClick={handleFilterClick}
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <FilterList />
            </IconButton>
          </Tooltip>

          {/* Sort Button */}
          <Tooltip title="Sort Options">
            <IconButton
              onClick={handleSortClick}
              sx={{
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.2)'
                }
              }}
            >
              <Sort />
            </IconButton>
          </Tooltip>

          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Tooltip title="Table View">
              <IconButton
                size="small"
                onClick={() => onViewModeChange('table')}
                sx={{
                  backgroundColor: viewMode === 'table' ? 'primary.main' : 'transparent',
                  color: viewMode === 'table' ? 'white' : 'text.secondary',
                  borderRadius: 0,
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                  '&:hover': {
                    backgroundColor: viewMode === 'table' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ViewList fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Card View">
              <IconButton
                size="small"
                onClick={() => onViewModeChange('card')}
                sx={{
                  backgroundColor: viewMode === 'card' ? 'primary.main' : 'transparent',
                  color: viewMode === 'card' ? 'white' : 'text.secondary',
                  borderRadius: 0,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                  '&:hover': {
                    backgroundColor: viewMode === 'card' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ViewModule fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          PaperProps={{
            sx: {
              minWidth: 200,
              mt: 1
            }
          }}
        >
          <MenuItem>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
          <MenuItem>
            <FormControl fullWidth size="small">
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location || ''}
                onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
                label="Location"
              >
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="London">London</MenuItem>
                <MenuItem value="Manchester">Manchester</MenuItem>
                <MenuItem value="Birmingham">Birmingham</MenuItem>
                <MenuItem value="Leeds">Leeds</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
        </Menu>

        {/* Sort Menu */}
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
          PaperProps={{
            sx: {
              minWidth: 150,
              mt: 1
            }
          }}
        >
          <MenuItem onClick={() => onFilterChange({ ...filters, sort: 'name' })}>
            Sort by Name
          </MenuItem>
          <MenuItem onClick={() => onFilterChange({ ...filters, sort: 'date' })}>
            Sort by Date
          </MenuItem>
          <MenuItem onClick={() => onFilterChange({ ...filters, sort: 'status' })}>
            Sort by Status
          </MenuItem>
          <MenuItem onClick={() => onFilterChange({ ...filters, sort: 'rating' })}>
            Sort by Rating
          </MenuItem>
        </Menu>
      </Box>
    </Fade>
  );
};

export default SearchAndFilterBar; 