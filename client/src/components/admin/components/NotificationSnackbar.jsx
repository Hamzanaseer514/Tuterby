import React from 'react';
import {
  Snackbar,
  Alert,
  Slide,
  Fade
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';

const NotificationSnackbar = ({
  open,
  message,
  severity = 'success',
  autoHideDuration = 6000,
  onClose,
  position = 'bottom-right'
}) => {
  const getSeverityIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return <Info />;
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'top-left':
        return { vertical: 'top', horizontal: 'left' };
      case 'top-right':
        return { vertical: 'top', horizontal: 'right' };
      case 'bottom-left':
        return { vertical: 'bottom', horizontal: 'left' };
      case 'bottom-right':
      default:
        return { vertical: 'bottom', horizontal: 'right' };
    }
  };

  const SlideTransition = (props) => {
    return <Slide {...props} direction="up" />;
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={getPosition()}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbar-root': {
          zIndex: 9999
        }
      }}
    >
      <Fade in={open} timeout={300}>
        <Alert
          onClose={onClose}
          severity={severity}
          icon={getSeverityIcon()}
          variant="filled"
          sx={{
            minWidth: 300,
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            '& .MuiAlert-icon': {
              fontSize: 24
            },
            '& .MuiAlert-message': {
              fontSize: '0.9rem',
              fontWeight: 'medium'
            },
            '&.MuiAlert-filledSuccess': {
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: 'white'
            },
            '&.MuiAlert-filledError': {
              background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
              color: 'white'
            },
            '&.MuiAlert-filledWarning': {
              background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              color: 'white'
            },
            '&.MuiAlert-filledInfo': {
              background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
              color: 'white'
            }
          }}
        >
          {message}
        </Alert>
      </Fade>
    </Snackbar>
  );
};

export default NotificationSnackbar; 