// export default ChatAdminDashboard;
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Search,
  Email,
  Person,
  QuestionAnswer,
  CheckCircle,
  PendingActions,
  Close,
  Refresh,
} from "@mui/icons-material";
import { format } from "date-fns";
import AdminLayout from "./AdminLayout";
import { BASE_URL } from '@/config';

const ChatAdminDashboard = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/chats`);
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setChats(data.data);
    } catch (err) {
      setError(err.message || "Failed to fetch chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleOpenChat = (group) => {
    setSelectedChat(group);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  const filteredChats = chats.filter((chat) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      chat.student.full_name.toLowerCase().includes(searchLower) ||
      chat.tutor.full_name.toLowerCase().includes(searchLower) ||
      chat.student.email.toLowerCase().includes(searchLower) ||
      chat.tutor.email.toLowerCase().includes(searchLower) ||
      chat.message.toLowerCase().includes(searchLower) ||
      (chat.response && chat.response.toLowerCase().includes(searchLower))
    );
  });

  const groupChatsByParticipants = () => {
    const grouped = {};

    filteredChats.forEach((chat) => {
      const key = `${chat.student.id}-${chat.tutor.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          student: chat.student,
          tutor: chat.tutor,
          chats: [],
        };
      }
      grouped[key].chats.push(chat);
    });

    return Object.values(grouped);
  };

  const groupedChats = groupChatsByParticipants();

  const getStatusSummary = (chats) => {
    const answered = chats.filter((c) => c.status === "answered").length;
    const unanswered = chats.length - answered;
    return { answered, unanswered };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // if (error) {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
  //       <Typography color="error" variant="h6">
  //         {error}
  //       </Typography>
  //     </Box>
  //   );
  // }

  return (
    // <AdminLayout tabValue="chat">
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
              >
                Message Center
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, display: { xs: 'none', sm: 'block' } }}
              >
                Monitor and manage all tutor-student communications
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Refresh">
                <span>
                  <IconButton
                    onClick={fetchChats}
                    size={isMobile ? 'small' : 'medium'}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Refresh />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 }, borderRadius: 2, boxShadow: theme.shadows[3] }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isMobile ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }} />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {groupedChats.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <QuestionAnswer sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No conversations found
            </Typography>
            <Typography color="textSecondary">
              {searchTerm ? "Try a different search term" : "No messages available yet"}
            </Typography>
          </Paper>
        ) : (
          <Box>
            {groupedChats.map((group) => (
              <Paper 
                key={group.id} 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 }, 
                  p: { xs: 1.5, sm: 2 }, 
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
                onClick={() => handleOpenChat(group)}
              >
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={{ xs: 2, sm: 0 }}
                >
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    flex={1}
                    width="100%"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    gap={{ xs: 1, sm: 0 }}
                  >
                    {/* Student Info */}
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      mr={{ xs: 0, sm: 2 }}
                      width={{ xs: '100%', sm: 'auto' }}
                      justifyContent={{ xs: 'flex-start', sm: 'flex-start' }}
                    >
                      <Tooltip title={group.student.email}>
                        <Avatar
                          src={`${BASE_URL}${group.student.photo_url}`}
                          alt={group.student.full_name}
                          sx={{ 
                            width: { xs: 40, sm: 50 }, 
                            height: { xs: 40, sm: 50 }, 
                            mr: { xs: 1, sm: 2 }
                          }}
                        />
                      </Tooltip>
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="medium"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          {group.student.full_name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {isMobile ? group.student.email.split("@")[0] + "..." : group.student.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Tutor Info */}
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      flex={1} 
                      justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                      width={{ xs: '100%', sm: 'auto' }}
                    >
                      <Box 
                        mr={{ xs: 1, sm: 2 }} 
                        textAlign={{ xs: 'left', sm: 'right' }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="medium"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          {group.tutor.full_name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {isMobile ? group.tutor.email.split("@")[0] + "..." : group.tutor.email}
                        </Typography>
                      </Box>
                      <Tooltip title={group.tutor.email}>
                        <Avatar
                          src={`${BASE_URL}${group.tutor.photo_url}`}
                          alt={group.tutor.full_name}
                          sx={{ 
                            width: { xs: 40, sm: 50 }, 
                            height: { xs: 40, sm: 50 }
                          }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Stats */}
                  <Box 
                    ml={{ xs: 0, sm: 2 }} 
                    display="flex" 
                    width={{ xs: '100%', sm: 'auto' }}
                    justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                    gap={1}
                  >
                    <Chip
                      label={getStatusSummary(group.chats).answered}
                      size="small"
                      color="success"
                      icon={<CheckCircle fontSize="small" />}
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 22, sm: 24 }
                      }}
                    />
                    <Chip
                      label={getStatusSummary(group.chats).unanswered}
                      size="small"
                      color="warning"
                      icon={<PendingActions fontSize="small" />}
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 22, sm: 24 }
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* WhatsApp-like Chat Modal */}
        <Dialog
          open={Boolean(selectedChat)}
          onClose={handleCloseChat}
          fullWidth
          maxWidth="md"
          fullScreen={isMobile}
          sx={{
            '& .MuiDialog-paper': {
              height: isMobile ? '100vh' : '80vh',
              borderRadius: isMobile ? 0 : 2,
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              borderBottom: `1px solid ${theme.palette.divider}`,
              p: { xs: 1.5, sm: 2 }
            }}
          >
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <Typography 
                variant="h6"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  wordBreak: 'break-word'
                }}
              >
                {selectedChat?.student.full_name} ↔ {selectedChat?.tutor.full_name}
              </Typography>
              <IconButton 
                onClick={handleCloseChat}
                size={isMobile ? "small" : "medium"}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0, overflow: 'hidden' }}>
            {selectedChat && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <Box 
                  sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 2, sm: 0 }
                  }}
                >
                  <Box 
                    display="flex" 
                    alignItems="center"
                    width={{ xs: '100%', sm: 'auto' }}
                  >
                    <Avatar 
                      src={`${BASE_URL}${selectedChat.student.photo_url}`}
                      sx={{ 
                        mr: { xs: 1, sm: 2 },
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 }
                      }} 
                    />
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="medium"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        {selectedChat.student.full_name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {selectedChat.student.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box 
                    display="flex" 
                    alignItems="center"
                    width={{ xs: '100%', sm: 'auto' }}
                    justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                  >
                    <Avatar 
                      src={`${BASE_URL}${selectedChat.tutor.photo_url}`}
                      sx={{ 
                        mr: { xs: 1, sm: 2 },
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 }
                      }} 
                    />
                    <Box textAlign={{ xs: 'left', sm: 'right' }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="medium"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        {selectedChat.tutor.full_name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {selectedChat.tutor.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Chat Messages */}
                <Box 
                  sx={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    p: { xs: 1, sm: 2 },
                    background: theme.palette.grey[50]
                  }}
                >
                  {selectedChat.chats.map((chat) => (
                    <React.Fragment key={chat._id}>
                      {/* Student Message */}
                      <Box 
                        sx={{ 
                          mb: { xs: 1.5, sm: 2 },
                          display: 'flex',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <Box 
                          sx={{
                            maxWidth: { xs: '85%', sm: '70%' },
                            p: { xs: 1.5, sm: 2 },
                            backgroundColor: 'white',
                            borderRadius: '18px 18px 18px 0',
                            boxShadow: theme.shadows[1]
                          }}
                        >
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                          >
                            {chat.message}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="textSecondary"
                            display="block"
                            textAlign="right"
                            mt={1}
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          >
                            {format(new Date(chat.createdAt), 'hh:mm a')}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Tutor Response */}
                      {chat.response && (
                        <Box 
                          sx={{ 
                            mb: { xs: 1.5, sm: 2 },
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }}
                        >
                          <Box 
                            sx={{
                              maxWidth: { xs: '85%', sm: '70%' },
                              p: { xs: 1.5, sm: 2 },
                              backgroundColor: theme.palette.primary.light,
                              color: 'white',
                              borderRadius: '18px 18px 0 18px',
                              boxShadow: theme.shadows[1]
                            }}
                          >
                            <Typography 
                              variant="body2"
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                              {chat.response}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="inherit"
                              display="block"
                              textAlign="right"
                              mt={1}
                              sx={{ 
                                opacity: 0.8,
                                fontSize: { xs: '0.65rem', sm: '0.75rem' }
                              }}
                            >
                              {format(new Date(chat.updatedAt), 'hh:mm a')}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={handleCloseChat}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    // </AdminLayout>
  );
};

export default ChatAdminDashboard;