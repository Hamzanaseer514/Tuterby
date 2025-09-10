import React from "react";
import {
  Box,
  TextField,
  IconButton,
  Fade,
  Zoom,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button,
} from "@mui/material";
import {
  Search,
  FilterList,
  Clear,
  Sort,
  Refresh,
  Download,
  Upload,
} from "@mui/icons-material";

const SearchAndFilterBar = ({
  tabValue,
  searchTerm,
  onSearch,
  onClearSearch,
  filters = {},
  onFilterChange,
  viewMode = "table",
  onViewModeChange,
  onExport,
  onImport,
  onRefresh,
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = React.useState(null);
  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);

  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const handleSortClick = (event) => setSortAnchorEl(event.currentTarget);
  const handleSortClose = () => setSortAnchorEl(null);

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // responsive
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          mb: 3,
          p: 2,
          backgroundColor: "rgba(248, 249, 250, 0.8)",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        {/* 🔎 Search */}
        <Zoom in timeout={600}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${tabValue}...`}
            value={searchTerm}
            onChange={onSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "action.active" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={onClearSearch}
                    sx={{ color: "action.active" }}
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", md: 400 }, // responsive
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "white",
              },
            }}
          />
        </Zoom>

        {/* ⚙️ Actions */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <IconButton onClick={handleFilterClick}>
            <FilterList />
          </IconButton>
          <IconButton onClick={handleSortClick}>
            <Sort />
          </IconButton>
          {onRefresh && (
            <IconButton onClick={onRefresh}>
              <Refresh />
            </IconButton>
          )}
         
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
        >
          <MenuItem>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, status: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
          <MenuItem>
            <FormControl fullWidth size="small">
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, location: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Lahore">Lahore</MenuItem>
                <MenuItem value="Karachi">Karachi</MenuItem>
                <MenuItem value="Islamabad">Islamabad</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
        </Menu>

        {/* Sort Menu */}
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
          PaperProps={{ sx: { minWidth: 180, mt: 1 } }}
        >
          <MenuItem onClick={() => onFilterChange({ ...filters, sort: "name" })}>
            Sort by Name
          </MenuItem>
          <MenuItem onClick={() => onFilterChange({ ...filters, sort: "date" })}>
            Sort by Date
          </MenuItem>
          <MenuItem
            onClick={() => onFilterChange({ ...filters, sort: "status" })}
          >
            Sort by Status
          </MenuItem>
          <MenuItem
            onClick={() => onFilterChange({ ...filters, sort: "rating" })}
          >
            Sort by Rating
          </MenuItem>
        </Menu>
      </Box>
    </Fade>
  );
};

export default SearchAndFilterBar;
