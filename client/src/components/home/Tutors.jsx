import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  Avatar,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  TextField,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@mui/material';
import {
  School,
  Work,
  CheckCircle,
  TrendingUp
} from '@mui/icons-material';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { BASE_URL } from '@/config';
import { useSubject } from '@/hooks/useSubject';
import { useCallback } from 'react';

const TutorCard = ({ tutor, onHire, loading, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { subjects, academicLevels } = useSubject();

  const getSubjectById = useCallback((id) => {
    if (!id) return undefined;
    const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
    return s;
  }, [subjects]);

  const getAcademicLevelById = useCallback((id) => {
    if (!id) return undefined;
    const s = (academicLevels || []).find(s => s?._id?.toString() === id.toString());
    return s;
  }, [academicLevels]);

  const formatPrice = (price) => {
    return `£${price}/hr`;
  };

  const getPriceRange = () => {
    if (tutor.min_hourly_rate === 0 && tutor.max_hourly_rate === 0) {
      return 'Contact for pricing';
    }
    if (tutor.min_hourly_rate === tutor.max_hourly_rate) {
      return `£${tutor.min_hourly_rate}/hr`;
    }
    return `£${tutor.min_hourly_rate} - £${tutor.max_hourly_rate}/hr`;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: '400px',
        width: '100%',
        maxWidth: '400px', // Fixed max width
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        overflow: 'hidden',
        flex: '0 0 auto', // Don't grow or shrink
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          borderColor: theme.palette.primary.main
        }
      }}
    >
      <CardContent sx={{ 
        p: 0, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* Header Section */}
        <Box sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)',
          minWidth: 0,
          width: '100%'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 0, width: '100%' }}>
            <Box sx={{ p: 0.5, borderRadius: '50%', background: 'linear-gradient(90deg, #6C63FF, #3F3D56)' }}>
              <Avatar
                src={`${tutor.photo_url}`}
                alt={tutor.full_name}
                sx={{
                  width: 72,
                  height: 72,
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '1.2rem',
                    minWidth: 0,
                    color: theme.palette.text.primary
                  }}
                >
                  {tutor.full_name}
                </Typography>
                {(tutor.is_background_checked || tutor.is_qualification_verified) && (
                  <CheckCircle sx={{ fontSize: '1rem', color: 'success.main', flexShrink: 0 }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5, flexWrap: 'wrap', minWidth: 0 }}>
                <Rating
                  value={tutor.average_rating || 0}
                  readOnly
                  size="small"
                  sx={{ color: '#6C63FF' }}
                />
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {tutor.average_rating || 0}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ 
                  fontSize: '1rem',
                  color: '#3F3D56',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {getPriceRange()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content Section */}
        <Box sx={{ 
          p: 2.5, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '200px',
          minWidth: 0,
          width: '100%',
          overflow: 'hidden'
        }}>
          {/* Qualifications and Experience */}
          <Box sx={{ mb: 1.5, minWidth: 0, width: '100%' }}>
            {tutor.qualifications && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, minWidth: 0 }}>
                <School fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  {tutor.qualifications}
                </Typography>
              </Box>
            )}
            {tutor.experience_years > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
                <Work fontSize="small" color="primary" sx={{ flexShrink: 0, mt: 0.25 }} />
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  sx={{ 
                    fontWeight: 500, 
                    fontSize: '0.8rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  {tutor.experience_years} years experience
                </Typography>
              </Box>
            )}
          </Box>

          {/* Subjects Section */}
          {tutor.subjects && tutor.subjects.length > 0 && (
            <Box sx={{ mb: 1.5, minHeight: '60px', minWidth: 0, width: '100%' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#6b7280', fontSize: '0.8rem', letterSpacing: 0.2 }}>
                📚 Subjects
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                // flexWrap: 'wrap', 
                gap: 0.5,
                minWidth: 0
              }}>
                {tutor.subjects.slice(0, 2).map((subject, index) => (
                  <Chip
                    key={index}
                    label={getSubjectById(subject)?.name || subject}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      borderColor: theme.palette.grey[300],
                      color: '#3F3D56',
                      backgroundColor: theme.palette.grey[100],
                      fontWeight: 500,
                      height: '22px',
                      borderRadius: 1.5,
                      '&:hover': { backgroundColor: theme.palette.grey[200] }
                    }}
                  />
                ))}
                {tutor.subjects.length > 2 && (
                  <Chip
                    label={`+${tutor.subjects.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.7rem",
                      borderColor: theme.palette.grey[300],
                      color: theme.palette.grey[600],
                      height: '22px',
                      flexShrink: 0,
                      borderRadius: 1.5
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Academic Levels Section */}
          {tutor.academic_levels && tutor.academic_levels.length > 0 && (
            <Box sx={{ mb: 1.5, minHeight: '60px', minWidth: 0, width: '100%' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#6b7280', fontSize: '0.8rem', letterSpacing: 0.2 }}>
                🎓 Levels
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                // flexWrap: 'wrap', 
                gap: 0.5,
                minWidth: 0
              }}>
                {tutor.academic_levels.slice(0, 2).map((level, index) => (
                  <Chip
                    key={index}
                    label={`${getAcademicLevelById(level.educationLevel._id)?.level} - ${formatPrice(level.hourlyRate)}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      borderColor: theme.palette.grey[300],
                      color: '#3F3D56',
                      backgroundColor: theme.palette.grey[100],
                      fontWeight: 500,
                      height: '22px',
                      borderRadius: 1.5,
                      '&:hover': { backgroundColor: theme.palette.grey[200] }
                    }}
                  />
                ))}
                {tutor.academic_levels.length > 2 && (
                  <Chip
                    label={`+${tutor.academic_levels.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      borderColor: theme.palette.grey[300],
                      color: theme.palette.grey[600],
                      height: '22px',
                      // flexShrink: 0
                      borderRadius: 1.5
                    }}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer Section */}
        <Box sx={{
          p: 2.5,
          pt: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[50],
          minWidth: 0,
          width: '100%'
        }}>
          <Button
            variant={!user || user.role !== 'student' ? 'outlined' : 'contained'}
            fullWidth
            onClick={() => onHire(tutor)}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.2,
              fontSize: '0.9rem',
              minWidth: 0,
              ...(user && user.role === 'student' ? {
                background: 'linear-gradient(90deg, #6C63FF, #3F3D56)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #5A53E6, #343247)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                }
              } : {
                borderColor: '#6C63FF',
                color: '#6C63FF',
                '&:hover': {
                  borderColor: '#3F3D56',
                  backgroundColor: 'rgba(108, 99, 255, 0.08)',
                  color: '#3F3D56'
                }
              })
            }}
          >
            {loading ? 'Processing...' :
              !user ? 'Request This Tutor' :
                user.role !== 'student' ? 'Students Only' :
                  'Request This Tutor'
            }
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const Tutors = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hireLoading, setHireLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [visibleCount, setVisibleCount] = useState(6);

  // Filter states
  const [filters, setFilters] = useState({
    searchName: '',
    subject: '',
    academicLevel: '',
    minRating: 0,
    maxRating: 5,
    minPrice: 0,
    maxPrice: 1000
  });

  useEffect(() => {
    fetchVerifiedTutors();
  }, []);

  // Apply filters whenever tutors or filters change
  useEffect(() => {
    applyFilters();
  }, [tutors, filters]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [filters]);

  const applyFilters = () => {
    let filtered = [...tutors];

    // Filter by name search
    if (filters.searchName) {
      filtered = filtered.filter(tutor =>
        tutor.full_name.toLowerCase().includes(filters.searchName.toLowerCase())
      );
    }

    // Filter by subject
    if (filters.subject) {
      filtered = filtered.filter(tutor =>
        tutor.subjects.some(subject =>
          subject.toLowerCase().includes(filters.subject.toLowerCase())
        )
      );
    }

    // Filter by academic level
    if (filters.academicLevel) {
      filtered = filtered.filter(tutor =>
        tutor.academic_levels.some(level =>
          level.name.toLowerCase().includes(filters.academicLevel.toLowerCase())
        )
      );
    }

    // Filter by rating range
    filtered = filtered.filter(tutor =>
      tutor.average_rating >= filters.minRating && tutor.average_rating <= filters.maxRating
    );

    // Filter by price range
    filtered = filtered.filter(tutor =>
      tutor.min_hourly_rate >= filters.minPrice && tutor.max_hourly_rate <= filters.maxPrice
    );

    setFilteredTutors(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchName: '',
      subject: '',
      academicLevel: '',
      minRating: 0,
      maxRating: 5,
      minPrice: 0,
      maxPrice: 1000
    });
    setVisibleCount(6);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleShowLess = () => {
    setVisibleCount(6);
  };

  const fetchVerifiedTutors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/tutor/verified`);

      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }

      const data = await response.json();
      setTutors(data.tutors || []);
    } catch (error) {
      // console.error('Error fetching tutors:', error);
      // setError('Failed to load tutors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleHire = async (tutor) => {
    if (!isAuthenticated()) {
      // Redirect to login page if not authenticated
      navigate('/login', {
        state: {
          from: '/tutors',
          message: 'Please login to hire a tutor'
        }
      });
      return;
    }

    // Check if the authenticated user is a student
    if (user?.role !== 'student') {
      setSnackbar({
        open: true,
        message: 'Only students can hire tutors. Please login with a student account.',
        severity: 'warning'
      });
      return;
    }

    try {
      setHireLoading(true);

      // Redirect to student dashboard
      navigate('/student/tutor-search', {
        state: {
          tutor: tutor
        }
      })

    } catch (error) {
      // console.error('Error hiring tutor:', error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to hire tutor. Please try again.",
        severity: 'error'
      });
    } finally {
      setHireLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, px: isMobile ? 2 : 4 }}>
        <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Tutors of  <span className="gradient-text">TutorNearby</span>
        </h2>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover qualified and experienced tutors who have been thoroughly verified and background checked
        </p>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 5,
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} sx={{ 
              height: '100%', 
              minHeight: '400px', 
              borderRadius: 3, 
              width: '100%',
              maxWidth: { xs: '100%', sm: '350px', md: '400px' },
              flex: '0 0 auto'
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Skeleton variant="circular" width={60} height={60} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="50%" height={16} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1, mb: 2 }} />
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1, mb: 2 }} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, px: isMobile ? 2 : 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Tutors of  <span className="gradient-text">TutorNearby</span>
        </h2>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover qualified and experienced tutors who have been thoroughly verified and background checked
        </p>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper 
  sx={{ 
    p: {xs: 1.5, sm: 2, md: 2.5}, 
    mb: 5, 
    mx: { xs: 1, md:2, lg: 8 },
    borderRadius: 4,
    border: `1px solid ${theme.palette.divider}`,
    background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
    boxShadow: theme.shadows[2]
  }}
>

        <Accordion sx={{ boxShadow: 'none', background: 'transparent' }}>
          <AccordionSummary
            expandIcon={<TrendingUp />}
            sx={{
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                justifyContent: 'space-between'
              }
            }}
          >
    <Typography 
  variant="h6" 
  fontWeight="700"
  sx={{ 
    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.25rem' },
    display: 'flex', alignItems: 'center', gap: 1
  }}
>
  🔍 Filter & Search Tutors
</Typography>

<Typography 
  variant="body2" 
  color="textSecondary"
  sx={{ display: { xs: 'none', md: 'block' } }} 
>
  {filteredTutors.length} of {tutors.length} tutors found
</Typography>

          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 1.5, sm: 2, md: 2.5 }
            }}>
              {/* Name Search */}
              <TextField
                label="Search by Name"
                value={filters.searchName}
                onChange={(e) => handleFilterChange('searchName', e.target.value)}
                placeholder="Enter tutor name..."
                size="small"
                variant="outlined"
                sx={{ flex: '1 1 220px' }}
              />

              {/* Subject Filter */}
              <TextField
                label="Filter by Subject"
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                placeholder="e.g., Math, Science..."
                size="small"
                variant="outlined"
                sx={{ flex: '1 1 220px' }}
              />

              {/* Academic Level Filter */}
              <TextField
                label="Filter by Academic Level"
                value={filters.academicLevel}
                onChange={(e) => handleFilterChange('academicLevel', e.target.value)}
                placeholder="e.g., GCSE, A-Level..."
                size="small"
                variant="outlined"
                sx={{ flex: '1 1 220px' }}
              />

              {/* Rating Range */}
              <Box sx={{ flex: '1 1 240px' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Rating Range: {filters.minRating} - {filters.maxRating}
                </Typography>
                <Slider
                  value={[filters.minRating, filters.maxRating]}
                  onChange={(event, newValue) => {
                    handleFilterChange('minRating', newValue[0]);
                    handleFilterChange('maxRating', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  min={0}
                  max={5}
                  step={0.5}
                />
              </Box>

              {/* Price Range */}
              <Box sx={{ flex: '1 1 240px' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Price Range: £{filters.minPrice} - £{filters.maxPrice}/hr
                </Typography>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onChange={(event, newValue) => {
                    handleFilterChange('minPrice', newValue[0]);
                    handleFilterChange('maxPrice', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                />
              </Box>

              {/* Clear Filters Button */}
              <Button
                variant="contained"
                onClick={clearFilters}
                sx={{
                  height: 40,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: '700',
                  flex: '1 1 180px',
                  background: 'linear-gradient(90deg, #6C63FF, #3F3D56)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5A53E6, #343247)'
                  }
                }}
              >
                🗑️ Clear All Filters
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Tutors Grid */}
      {filteredTutors.length > 0 ? (
        <>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 2, sm: 2.5, md: 3 },
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            {filteredTutors.slice(0, visibleCount).map((tutor) => (
              <TutorCard
                key={tutor._id}
                tutor={tutor}
                onHire={handleHire}
                loading={hireLoading}
                user={user}
              />
            ))}
          </Box>
          {/* Load More / Show Less Buttons */}
          {filteredTutors.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              {visibleCount < filteredTutors.length && (
                <Button
                  onClick={handleLoadMore}
                  variant="contained"
                  sx={{
                    mr: 2,
                    px: 4,
                    py: 1.25,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    }
                  }}
                >
                  Load More
                </Button>
              )}
              {visibleCount > 6 && (
                <Button
                  onClick={handleShowLess}
                  variant="outlined"
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                      color: '#7C3AED'
                    }
                  }}
                >
                  Show Less
                </Button>
              )}
            </Box>
          )}
        </>
      ) : tutors.length > 0 ? (
        <Box sx={{
          textAlign: 'center',
          py: 8,
          backgroundColor: theme.palette.grey[50],
          borderRadius: 3
        }}>
          <School sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
            No tutors match your filters
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search criteria or clear all filters to see all available tutors.
          </Typography>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
          >
            Clear All Filters
          </Button>
        </Box>
      ) : (
        <Box sx={{
          textAlign: 'center',
          py: 8,
          backgroundColor: theme.palette.grey[50],
          borderRadius: 3
        }}>
          <School sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
            No tutors available at the moment
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please check back later or contact us for more information.
          </Typography>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Tutors;