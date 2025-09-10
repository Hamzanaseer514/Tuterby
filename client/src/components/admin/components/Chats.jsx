// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Box,
//   Typography,
//   Container,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Chip,
//   Avatar,
//   TextField,
//   InputAdornment,
//   CircularProgress,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   IconButton,
//   Tooltip,
//   Divider,
//   useTheme
// } from '@mui/material';
// import {
//   Search,
//   ExpandMore,
//   Email,
//   Person,
//   QuestionAnswer,
//   CheckCircle,
//   PendingActions
// } from '@mui/icons-material';
// import { format } from 'date-fns';
// import AdminLayout from './AdminLayout';

// const ChatAdminDashboard = () => {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [expanded, setExpanded] = useState(null);
//   const theme = useTheme();

//   useEffect(() => {
//     const fetchChats = async () => {
//       try {
//         const response = await axios.get('/api/admin/chats');
//         setChats(response.data.data);
//         // Expand the first conversation by default
//         if (response.data.data.length > 0) {
//           const firstKey = `${response.data.data[0].student.id}-${response.data.data[0].tutor.id}`;
//           setExpanded(firstKey);
//         }
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch chats');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChats();
//   }, []);

//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpanded(isExpanded ? panel : null);
//   };

//   const filteredChats = chats.filter(chat => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       chat.student.full_name.toLowerCase().includes(searchLower) ||
//       chat.tutor.full_name.toLowerCase().includes(searchLower) ||
//       chat.student.email.toLowerCase().includes(searchLower) ||
//       chat.tutor.email.toLowerCase().includes(searchLower) ||
//       chat.message.toLowerCase().includes(searchLower) ||
//       (chat.response && chat.response.toLowerCase().includes(searchLower))
//     );
//   });

//   const groupChatsByParticipants = () => {
//     const grouped = {};

//     filteredChats.forEach(chat => {
//       const key = `${chat.student.id}-${chat.tutor.id}`;
//       if (!grouped[key]) {
//         grouped[key] = {
//           id: key,
//           student: chat.student,
//           tutor: chat.tutor,
//           chats: []
//         };
//       }
//       grouped[key].chats.push(chat);
//     });

//     return Object.values(grouped);
//   };

//   const groupedChats = groupChatsByParticipants();

//   const getStatusSummary = (chats) => {
//     const answered = chats.filter(c => c.status === 'answered').length;
//     const unanswered = chats.length - answered;
//     return { answered, unanswered };
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <Typography color="error" variant="h6">{error}</Typography>
//       </Box>
//     );
//   }

//   return (
//     <AdminLayout>
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
//             Message Center
//           </Typography>
//           <Typography variant="subtitle1" color="textSecondary">
//             Monitor and manage all tutor-student communications
//           </Typography>
//         </Box>

//         <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: theme.shadows[3] }}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search by name, email, or message content..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Search color="primary" />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Paper>

//         {groupedChats.length === 0 ? (
//           <Paper sx={{
//             p: 4,
//             textAlign: 'center',
//             borderRadius: 2,
//             boxShadow: theme.shadows[2]
//           }}>
//             <QuestionAnswer sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
//             <Typography variant="h6" gutterBottom>
//               No conversations found
//             </Typography>
//             <Typography color="textSecondary">
//               {searchTerm ? 'Try a different search term' : 'No messages available yet'}
//             </Typography>
//           </Paper>
//         ) : (
//           groupedChats.map((group) => (
//             <Accordion
//               key={group.id}
//               expanded={expanded === group.id}
//               onChange={handleAccordionChange(group.id)}
//               sx={{
//                 mb: 2,
//                 borderRadius: '8px !important',
//                 boxShadow: theme.shadows[2],
//                 '&:before': { display: 'none' }
//               }}
//             >
//               <AccordionSummary
//                 expandIcon={
//                   <Tooltip title={expanded === group.id ? 'Collapse' : 'Expand'}>
//                     <IconButton>
//                       <ExpandMore />
//                     </IconButton>
//                   </Tooltip>
//                 }
//                 sx={{
//                   backgroundColor: expanded === group.id ?
//                     theme.palette.action.selected : 'inherit',
//                   '&:hover': {
//                     backgroundColor: theme.palette.action.hover
//                   }
//                 }}
//               >
//                 <Box display="flex" alignItems="center" width="100%">
//                   {/* Student Info */}
//                   <Box display="flex" alignItems="center" flex={1} minWidth={0}>
//                     <Tooltip title={group.student.email}>
//                       <Avatar
//                         src={`https://i.pravatar.cc/150?u=${group.student.email}`}
//                         sx={{ mr: 2 }}
//                       >
//                         {group.student.full_name.charAt(0)}
//                       </Avatar>
//                     </Tooltip>
//                     <Box minWidth={0}>
//                       <Typography
//                         variant="subtitle1"
//                         noWrap
//                         fontWeight="medium"
//                       >
//                         {group.student.full_name}
//                       </Typography>
//                       <Typography
//                         variant="caption"
//                         color="textSecondary"
//                         display="flex"
//                         alignItems="center"
//                       >
//                         <Email fontSize="inherit" sx={{ mr: 0.5 }} />
//                         {group.student.email}
//                       </Typography>
//                     </Box>
//                   </Box>

//                   <Box mx={2} textAlign="center">
//                     <Chip
//                       label="Conversation"
//                       size="small"
//                       color="primary"
//                       icon={<QuestionAnswer fontSize="small" />}
//                     />
//                   </Box>

//                   {/* Tutor Info */}
//                   <Box display="flex" alignItems="center" flex={1} minWidth={0}>
//                     <Box minWidth={0} textAlign="right" mr={2}>
//                       <Typography
//                         variant="subtitle1"
//                         noWrap
//                         fontWeight="medium"
//                       >
//                         {group.tutor.full_name}
//                       </Typography>
//                       <Typography
//                         variant="caption"
//                         color="textSecondary"
//                         display="flex"
//                         alignItems="center"
//                         justifyContent="flex-end"
//                       >
//                         <Email fontSize="inherit" sx={{ mr: 0.5 }} />
//                         {group.tutor.email}
//                       </Typography>
//                     </Box>
//                     <Tooltip title={group.tutor.email}>
//                       <Avatar
//                         src={`https://i.pravatar.cc/150?u=${group.tutor.email}`}
//                       >
//                         {group.tutor.full_name.charAt(0)}
//                       </Avatar>
//                     </Tooltip>
//                   </Box>

//                   {/* Stats */}
//                   <Box ml={3} display="flex" alignItems="center">
//                     <Tooltip title="Answered messages">
//                       <Chip
//                         label={getStatusSummary(group.chats).answered}
//                         size="small"
//                         color="success"
//                         icon={<CheckCircle fontSize="small" />}
//                         sx={{ mr: 1 }}
//                       />
//                     </Tooltip>
//                     <Tooltip title="Pending responses">
//                       <Chip
//                         label={getStatusSummary(group.chats).unanswered}
//                         size="small"
//                         color="warning"
//                         icon={<PendingActions fontSize="small" />}
//                       />
//                     </Tooltip>
//                   </Box>
//                 </Box>
//               </AccordionSummary>

//               <AccordionDetails sx={{ p: 0 }}>
//                 <TableContainer component={Paper} variant="outlined">
//                   <Table>
//                     <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
//                       <TableRow>
//                         <TableCell width="20%">
//                           <Typography variant="subtitle2">Date & Time</Typography>
//                         </TableCell>
//                         <TableCell width="30%">
//                           <Box display="flex" alignItems="center">
//                             <Person color="primary" sx={{ mr: 1 }} />
//                             <Typography variant="subtitle2">Student's Message</Typography>
//                           </Box>
//                         </TableCell>
//                         <TableCell width="30%">
//                           <Box display="flex" alignItems="center">
//                             <Person color="secondary" sx={{ mr: 1 }} />
//                             <Typography variant="subtitle2">Tutor's Response</Typography>
//                           </Box>
//                         </TableCell>
//                         <TableCell width="20%" align="center">
//                           <Typography variant="subtitle2">Status</Typography>
//                         </TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {group.chats.map((chat) => (
//                         <React.Fragment key={chat._id}>
//                           <TableRow hover>
//                             <TableCell>
//                               <Typography variant="body2">
//                                 {format(new Date(chat.createdAt), 'MMM dd, yyyy')}
//                               </Typography>
//                               <Typography variant="caption" color="textSecondary">
//                                 {format(new Date(chat.createdAt), 'hh:mm a')}
//                               </Typography>
//                             </TableCell>
//                             <TableCell>
//                               <Typography
//                                 variant="body2"
//                                 sx={{ whiteSpace: 'pre-wrap' }}
//                                 color="text.primary"
//                               >
//                                 {chat.message}
//                               </Typography>
//                             </TableCell>
//                             <TableCell>
//                               {chat.response ? (
//                                 <Typography
//                                   variant="body2"
//                                   sx={{ whiteSpace: 'pre-wrap' }}
//                                   color="text.secondary"
//                                 >
//                                   {chat.response}
//                                 </Typography>
//                               ) : (
//                                 <Typography
//                                   variant="body2"
//                                   color="text.disabled"
//                                   fontStyle="italic"
//                                 >
//                                   Awaiting response...
//                                 </Typography>
//                               )}
//                             </TableCell>
//                             <TableCell align="center">
//                               <Chip
//                                 label={chat.status === 'answered' ? 'Answered' : 'Pending'}
//                                 color={chat.status === 'answered' ? 'success' : 'warning'}
//                                 size="small"
//                                 variant="outlined"
//                               />
//                             </TableCell>
//                           </TableRow>
//                           <TableRow>
//                             <TableCell colSpan={4} sx={{ p: 0 }}>
//                               <Divider />
//                             </TableCell>
//                           </TableRow>
//                         </React.Fragment>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </AccordionDetails>
//             </Accordion>
//           ))
//         )}
//       </Container>
//     </AdminLayout>
//   );
// };

// export default ChatAdminDashboard;
// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Container,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Chip,
//   Avatar,
//   TextField,
//   InputAdornment,
//   CircularProgress,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   IconButton,
//   Tooltip,
//   Divider,
//   useTheme,
//   useMediaQuery,
// } from "@mui/material";
// import {
//   Search,
//   ExpandMore,
//   Email,
//   Person,
//   QuestionAnswer,
//   CheckCircle,
//   PendingActions,
// } from "@mui/icons-material";
// import { format } from "date-fns";
// import AdminLayout from "./AdminLayout";

// const ChatAdminDashboard = () => {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expanded, setExpanded] = useState(null);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   useEffect(() => {
//     const fetchChats = async () => {
//       try {
//         const response = await fetch("/api/admin/chats");
//         if (!response.ok) throw new Error("Failed to fetch chats");
//         const data = await response.json();
//         setChats(data.data);
//         // if (data.data.length > 0) {
//         //   const firstKey = `${data.data[0].student.id}-${data.data[0].tutor.id}`;
//         //   setExpanded(firstKey);
//         // }
//       } catch (err) {
//         setError(err.message || "Failed to fetch chats");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChats();
//   }, []);

//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpanded(isExpanded ? panel : null);
//   };

//   const filteredChats = chats.filter((chat) => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       chat.student.full_name.toLowerCase().includes(searchLower) ||
//       chat.tutor.full_name.toLowerCase().includes(searchLower) ||
//       chat.student.email.toLowerCase().includes(searchLower) ||
//       chat.tutor.email.toLowerCase().includes(searchLower) ||
//       chat.message.toLowerCase().includes(searchLower) ||
//       (chat.response && chat.response.toLowerCase().includes(searchLower))
//     );
//   });

//   const groupChatsByParticipants = () => {
//     const grouped = {};

//     filteredChats.forEach((chat) => {
//       const key = `${chat.student.id}-${chat.tutor.id}`;
//       if (!grouped[key]) {
//         grouped[key] = {
//           id: key,
//           student: chat.student,
//           tutor: chat.tutor,
//           chats: [],
//         };
//       }
//       grouped[key].chats.push(chat);
//     });

//     return Object.values(grouped);
//   };

//   const groupedChats = groupChatsByParticipants();

//   const getStatusSummary = (chats) => {
//     const answered = chats.filter((c) => c.status === "answered").length;
//     const unanswered = chats.length - answered;
//     return { answered, unanswered };
//   };

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="80vh"
//       >
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="80vh"
//       >
//         <Typography color="error" variant="h6">
//           {error}
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <AdminLayout>
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Box sx={{ mb: 4 }}>
//           <Typography
//             variant="h4"
//             component="h1"
//             gutterBottom
//             fontWeight="bold"
//           >
//             Message Center
//           </Typography>
//           <Typography variant="subtitle1" color="textSecondary">
//             Monitor and manage all tutor-student communications
//           </Typography>
//         </Box>

//         <Paper
//           sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: theme.shadows[3] }}
//         >
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search by name, email, or message..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Search color="primary" />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Paper>

//         {groupedChats.length === 0 ? (
//           <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
//             <QuestionAnswer
//               sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
//             />
//             <Typography variant="h6" gutterBottom>
//               No conversations found
//             </Typography>
//             <Typography color="textSecondary">
//               {searchTerm
//                 ? "Try a different search term"
//                 : "No messages available yet"}
//             </Typography>
//           </Paper>
//         ) : (
//           groupedChats.map((group) => (
//             <Accordion
//               key={group.id}
//               expanded={expanded === group.id}
//               onChange={handleAccordionChange(group.id)}
//               sx={{ mb: 2, borderRadius: "8px !important" }}
//             >
//               <AccordionSummary
//                 expandIcon={
//                   <Tooltip
//                     title={expanded === group.id ? "Collapse" : "Expand"}
//                   >
//                     <IconButton>
//                       <ExpandMore />
//                     </IconButton>
//                   </Tooltip>
//                 }
//                 sx={{
//                   backgroundColor:
//                     expanded === group.id
//                       ? theme.palette.action.selected
//                       : "inherit",
//                   "&:hover": { backgroundColor: theme.palette.action.hover },
//                 }}
//               >
//                 <Box
//                   display="flex"
//                   alignItems="center"
//                   width="100%"
//                   flexDirection={isMobile ? "column" : "row"}
//                 >
//                   {/* Student Info */}
//                   <Box
//                     display="flex"
//                     alignItems="center"
//                     flex={1}
//                     minWidth={0}
//                     mb={isMobile ? 1 : 0}
//                   >
//                     <Tooltip title={group.student.email}>
//                       <Avatar
//                         src={`https://i.pravatar.cc/150?u=${group.student.email}`}
//                         sx={{ mr: 2 }}
//                       />
//                     </Tooltip>
//                     <Box minWidth={0}>
//                       <Typography
//                         variant="subtitle1"
//                         noWrap
//                         fontWeight="medium"
//                       >
//                         {group.student.full_name}
//                       </Typography>
//                       <Typography
//                         variant="caption"
//                         color="textSecondary"
//                         display="flex"
//                         alignItems="center"
//                       >
//                         <Email fontSize="inherit" sx={{ mr: 0.5 }} />
//                         {isMobile
//                           ? group.student.email.split("@")[0] + "..."
//                           : group.student.email}
//                       </Typography>
//                     </Box>
//                   </Box>

//                   {!isMobile && (
//                     <Box mx={2}>
//                       <Chip label="↔" size="small" />
//                     </Box>
//                   )}

//                   {/* Tutor Info */}
//                   <Box
//                     display="flex"
//                     alignItems="center"
//                     flex={1}
//                     sx={{
//                       justifyContent: "flex-end",
//                       minWidth: 0,
//                     }}
//                   >
//                     {/* Desktop Layout */}
//                     {!isMobile && (
//                       <>
//                         <Box
//                           sx={{
//                             display: "flex",
//                             flexDirection: "column",
//                             alignItems: "flex-end",
//                             mr: 2,
//                             minWidth: 0,
//                             maxWidth: "60%",
//                           }}
//                         >
//                           <Typography
//                             variant="subtitle1"
//                             noWrap
//                             fontWeight="medium"
//                             sx={{ width: "100%", textAlign: "right" }}
//                           >
//                             {group.tutor.full_name}
//                           </Typography>
//                           <Typography
//                             variant="caption"
//                             color="textSecondary"
//                             noWrap
//                             sx={{
//                               display: "flex",
//                               justifyContent: "flex-end",
//                               width: "100%",
//                               alignItems: "center",
//                             }}
//                           >
//                             <Email
//                               fontSize="inherit"
//                               sx={{ mr: 0.5, flexShrink: 0 }}
//                             />
//                             <Box
//                               component="span"
//                               sx={{
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis",
//                                 textAlign: "right",
//                               }}
//                             >
//                               {group.tutor.email}
//                             </Box>
//                           </Typography>
//                         </Box>
//                         <Tooltip title={group.tutor.email}>
//                           <Avatar
//                             src={`https://i.pravatar.cc/150?u=${group.tutor.email}`}
//                             sx={{
//                               width: 40,
//                               height: 40,
//                               flexShrink: 0,
//                             }}
//                           />
//                         </Tooltip>
//                       </>
//                     )}

//                     {/* Mobile Layout */}
//                     {isMobile && (
//                       <>
//                         <Tooltip title={group.tutor.email}>
//                           <Avatar
//                             src={`https://i.pravatar.cc/150?u=${group.tutor.email}`}
//                             sx={{
//                               width: 40,
//                               height: 40,
//                               flexShrink: 0,
//                               mr: 2,
//                             }}
//                           />
//                         </Tooltip>
//                         <Box sx={{ minWidth: 0, maxWidth: "60%" }}>
//                           <Typography
//                             variant="subtitle1"
//                             noWrap
//                             fontWeight="medium"
//                           >
//                             {group.tutor.full_name}
//                           </Typography>
//                           <Typography
//                             variant="caption"
//                             color="textSecondary"
//                             noWrap
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                             }}
//                           >
//                             <Email
//                               fontSize="inherit"
//                               sx={{ mr: 0.5, flexShrink: 0 }}
//                             />
//                             <Box
//                               component="span"
//                               sx={{
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis",
//                               }}
//                             >
//                               {group.tutor.email.split("@")[0] + "..."}
//                             </Box>
//                           </Typography>
//                         </Box>
//                       </>
//                     )}
//                   </Box>

//                   {/* Stats */}
//                   <Box
//                     ml={isMobile ? 0 : 3}
//                     display="flex"
//                     alignItems="center"
//                     justifyContent={isMobile ? "center" : "flex-end"}
//                     width={isMobile ? "100%" : "auto"}
//                   >
//                     <Tooltip title="Answered">
//                       <Chip
//                         label={getStatusSummary(group.chats).answered}
//                         size="small"
//                         color="success"
//                         icon={<CheckCircle fontSize="small" />}
//                         sx={{ mr: 1 }}
//                       />
//                     </Tooltip>
//                     <Tooltip title="Pending">
//                       <Chip
//                         label={getStatusSummary(group.chats).unanswered}
//                         size="small"
//                         color="warning"
//                         icon={<PendingActions fontSize="small" />}
//                       />
//                     </Tooltip>
//                   </Box>
//                 </Box>
//               </AccordionSummary>

//               <AccordionDetails sx={{ p: 0 }}>
//                 <TableContainer component={Paper} variant="outlined">
//                   <Table>
//                     <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
//                       <TableRow>
//                         <TableCell width={isMobile ? "25%" : "20%"}>
//                           <Typography variant="subtitle2">Date</Typography>
//                         </TableCell>
//                         <TableCell width={isMobile ? "35%" : "30%"}>
//                           <Box display="flex" alignItems="center">
//                             <Person
//                               color="primary"
//                               sx={{
//                                 mr: 1,
//                                 fontSize: isMobile ? "1rem" : "inherit",
//                               }}
//                             />
//                             <Typography variant="subtitle2">Student</Typography>
//                           </Box>
//                         </TableCell>
//                         <TableCell width={isMobile ? "35%" : "30%"}>
//                           <Box display="flex" alignItems="center">
//                             <Person
//                               color="secondary"
//                               sx={{
//                                 mr: 1,
//                                 fontSize: isMobile ? "1rem" : "inherit",
//                               }}
//                             />
//                             <Typography variant="subtitle2">Tutor</Typography>
//                           </Box>
//                         </TableCell>
//                         <TableCell
//                           width={isMobile ? "15%" : "20%"}
//                           align="center"
//                         >
//                           <Typography variant="subtitle2">Status</Typography>
//                         </TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {group.chats.map((chat) => (
//                         <React.Fragment key={chat._id}>
//                           <TableRow hover>
//                             <TableCell>
//                               <Typography variant="body2">
//                                 {format(
//                                   new Date(chat.createdAt),
//                                   isMobile ? "MMM dd" : "MMM dd, yyyy"
//                                 )}
//                               </Typography>
//                               {!isMobile && (
//                                 <Typography
//                                   variant="caption"
//                                   color="textSecondary"
//                                 >
//                                   {format(new Date(chat.createdAt), "hh:mm a")}
//                                 </Typography>
//                               )}
//                             </TableCell>
//                             <TableCell>
//                               <Typography
//                                 variant="body2"
//                                 sx={{ whiteSpace: "pre-wrap" }}
//                               >
//                                 {chat.message}
//                               </Typography>
//                             </TableCell>
//                             <TableCell>
//                               {chat.response ? (
//                                 <Typography
//                                   variant="body2"
//                                   sx={{ whiteSpace: "pre-wrap" }}
//                                 >
//                                   {chat.response}
//                                 </Typography>
//                               ) : (
//                                 <Typography
//                                   variant="body2"
//                                   color="text.disabled"
//                                   fontStyle="italic"
//                                 >
//                                   {isMobile ? "..." : "Awaiting response..."}
//                                 </Typography>
//                               )}
//                             </TableCell>
//                             <TableCell align="center">
//                               <Chip
//                                 label={
//                                   chat.status === "answered"
//                                     ? isMobile
//                                       ? "✓"
//                                       : "Answered"
//                                     : isMobile
//                                     ? "!"
//                                     : "Pending"
//                                 }
//                                 color={
//                                   chat.status === "answered"
//                                     ? "success"
//                                     : "warning"
//                                 }
//                                 size="small"
//                               />
//                             </TableCell>
//                           </TableRow>
//                           <TableRow>
//                             <TableCell colSpan={4} sx={{ p: 0 }}>
//                               <Divider />
//                             </TableCell>
//                           </TableRow>
//                         </React.Fragment>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </AccordionDetails>
//             </Accordion>
//           ))
//         )}
//       </Container>
//     </AdminLayout>
//   );
// };

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

  useEffect(() => {
    const fetchChats = async () => {
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
    <AdminLayout tabValue="chat">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Message Center
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Monitor and manage all tutor-student communications
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: theme.shadows[3] }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
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
                  mb: 2, 
                  p: 2, 
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
                onClick={() => handleOpenChat(group)}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    {/* Student Info */}
                    <Box display="flex" alignItems="center" mr={2}>
                      <Tooltip title={group.student.email}>
                        {/* <Avatar src={`https://i.pravatar.cc/150?u=${group.student.email}`} /> */}
                        <Avatar
                                  src={`${BASE_URL}${group.student.photo_url}`}
                                  alt={group.student.full_name}
                                  sx={{ width: 50, height: 50, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                                />
                      </Tooltip>
                      <Box ml={2}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {group.student.full_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {isMobile ? group.student.email.split("@")[0] + "..." : group.student.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Tutor Info */}
                    <Box display="flex" alignItems="center" flex={1} justifyContent="flex-end">
                      <Box mr={2} textAlign="right">
                        <Typography variant="subtitle1" fontWeight="medium">
                          {group.tutor.full_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {isMobile ? group.tutor.email.split("@")[0] + "..." : group.tutor.email}
                        </Typography>
                      </Box>
                      <Tooltip title={group.tutor.email}>
                        {/* <Avatar src={`https://i.pravatar.cc/150?u=${group.tutor.email}`} /> */}
                        <Avatar
                                  src={`${BASE_URL}${group.tutor.photo_url}`}
                                  alt={group.tutor.full_name}
                                  sx={{ width: 50, height: 50, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                                />
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Stats */}
                  <Box ml={2} display="flex">
                    <Chip
                      label={getStatusSummary(group.chats).answered}
                      size="small"
                      color="success"
                      icon={<CheckCircle fontSize="small" />}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={getStatusSummary(group.chats).unanswered}
                      size="small"
                      color="warning"
                      icon={<PendingActions fontSize="small" />}
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
          <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {selectedChat?.student.full_name} ↔ {selectedChat?.tutor.full_name}
              </Typography>
              <IconButton onClick={handleCloseChat}>
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
                    p: 2, 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      src={`${BASE_URL}${selectedChat.student.photo_url}`}
                      sx={{ mr: 2 }} 
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {selectedChat.student.full_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedChat.student.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      src={`${BASE_URL}${selectedChat.tutor.photo_url}`}
                      sx={{ mr: 2 }} 
                    />
                    <Box textAlign="right">
                      <Typography variant="subtitle1" fontWeight="medium">
                        {selectedChat.tutor.full_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
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
                    p: 2,
                    background: theme.palette.grey[50]
                  }}
                >
                  {selectedChat.chats.map((chat) => (
                    <React.Fragment key={chat._id}>
                      {/* Student Message */}
                      <Box 
                        sx={{ 
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <Box 
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            backgroundColor: 'white',
                            borderRadius: '18px 18px 18px 0',
                            boxShadow: theme.shadows[1]
                          }}
                        >
                          <Typography variant="body2">
                            {chat.message}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="textSecondary"
                            display="block"
                            textAlign="right"
                            mt={1}
                          >
                            {format(new Date(chat.createdAt), 'hh:mm a')}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Tutor Response */}
                      {chat.response && (
                        <Box 
                          sx={{ 
                            mb: 2,
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }}
                        >
                          <Box 
                            sx={{
                              maxWidth: '70%',
                              p: 2,
                              backgroundColor: theme.palette.primary.light,
                              color: 'white',
                              borderRadius: '18px 18px 0 18px',
                              boxShadow: theme.shadows[1]
                            }}
                          >
                            <Typography variant="body2">
                              {chat.response}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="inherit"
                              display="block"
                              textAlign="right"
                              mt={1}
                              sx={{ opacity: 0.8 }}
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
    </AdminLayout>
  );
};

export default ChatAdminDashboard;