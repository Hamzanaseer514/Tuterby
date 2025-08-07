import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Refresh,
  CloudDownload,
  CloudUpload
} from '@mui/icons-material';

const LoadingOverlay = ({ 
  loading = false, 
  message = 'Loading...', 
  type = 'default',
  showBackdrop = true 
}) => {
  const getLoadingIcon = () => {
    switch (type) {
      case 'upload':
        return <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />;
      case 'download':
        return <CloudDownload sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'refresh':
        return <Refresh sx={{ fontSize: 40, color: 'info.main' }} />;
      default:
        return <CircularProgress size={40} />;
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'upload':
        return 'primary.main';
      case 'download':
        return 'success.main';
      case 'refresh':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  if (!loading) return null;

  return (
    <Fade in={loading} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: showBackdrop ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: showBackdrop ? 'blur(2px)' : 'none'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 4,
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minWidth: 200,
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              animation: type === 'refresh' ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            {getLoadingIcon()}
          </Box>
          
          <Typography
            variant="body1"
            color={getMessageColor()}
            fontWeight="medium"
            sx={{ mt: 1 }}
          >
            {message}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.8rem' }}
          >
            Please wait while we process your request...
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default LoadingOverlay; 