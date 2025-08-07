// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   Avatar,
//   Chip,
//   Divider,
//   IconButton,
//   Grid,
//   Card,
//   CardContent,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Badge,
//   Fade,
//   Zoom
// } from '@mui/material';
// import {
//   ArrowBack,
//   Close,
//   Person,
//   Email,
//   Phone,
//   LocationOn,
//   School,
//   Work,
//   CalendarToday,
//   Star,
//   CheckCircle,
//   Pending,
//   Description,
//   CloudDownload,
//   Schedule,
//   Today,
//   Assignment,
//   ContactMail,
//   Gavel,
//   ExpandMore
// } from '@mui/icons-material';

// const UserDetailDialog = ({
//   open,
//   user,
//   tabValue,
//   onClose,
//   onVerifyDocument,
//   onRejectDocument,
//   onAddDocumentNotes,
//   onScheduleInterview,
//   onCompleteInterview,
//   onSetAvailableSlots,
//   availableSlots = [],
//   loading = false
// }) => {
//   // Early return if no user or dialog is not open
//   if (!user || !open) return null;

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'verified':
//         return 'success';
//       case 'pending':
//         return 'warning';
//       case 'rejected':
//         return 'error';
//       default:
//         return 'default';
//     }
//   };

//   const getTabIcon = (tabValue) => {
//     switch (tabValue) {
//       case 'tutors':
//         return <School />;
//       case 'students':
//         return <Person />;
//       case 'parents':
//         return <ContactMail />;
//       default:
//         return <Person />;
//     }
//   };
//   // Safe access to user properties
//   const userName = user?.name || 'Unknown User';
//   const userEmail = user?.email || 'No email provided';
//   const userPhone = user?.phone || 'No phone provided';
//   const userLocation = user?.location || 'No location provided';
//   const userJoinDate = user?.joinDate || 'Unknown';
//   const userLastActive = user?.lastActive || 'Unknown';
//   const userRating = user?.rating;
//   const userStatus = user?.status;
//   const userDocuments = user?.documents || [];
//   const userSubjects = user?.subjects || [];
//   const userChildren = user?.children || [];
//   const userSessionsCompleted = user?.sessionsCompleted || 0;
//   const userSessionsBooked = user?.sessionsBooked || 0;
//   const userApplicationNotes = user?.applicationNotes;

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose} 
//       maxWidth="lg" 
//       fullWidth
//       TransitionComponent={Fade}
//       transitionDuration={300}
//     >
//       <DialogTitle>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton onClick={onClose} sx={{ mr: 1 }}>
//               <ArrowBack />
//             </IconButton>
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               {getTabIcon(tabValue)}
//               <Typography variant="h6" sx={{ ml: 1 }}>
//                 {userName}
//               </Typography>
//             </Box>
//           </Box>
//           {userStatus && (
//             <Chip
//               label={userStatus}
//               color={getStatusColor(userStatus)}
//               variant={userStatus === 'unverified' ? 'outlined' : 'filled'}
//             />
//           )}
//         </Box>
//       </DialogTitle>

//       <DialogContent dividers>
//         <Zoom in timeout={400}>
//           <Box>
//             {/* Basic Info Section */}
//             <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
//               <CardContent>
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} md={3}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                       <Avatar 
//                         sx={{ 
//                           width: 80, 
//                           height: 80, 
//                           mb: 2,
//                           background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
//                           fontSize: '2rem',
//                           fontWeight: 'bold'
//                         }}
//                       >
//                         {userName.charAt(0)}
//                       </Avatar>
//                       {userRating && (
//                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                           <Star color="warning" fontSize="small" />
//                           <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
//                             {userRating}/5
//                           </Typography>
//                         </Box>
//                       )}
//                     </Box>
//                   </Grid>
                  
//                   <Grid item xs={12} md={9}>
//                     <Typography variant="h5" fontWeight="bold" gutterBottom>
//                       {userName}
//                     </Typography>
                    
//                     <List dense>
//                       <ListItem>
//                         <ListItemIcon>
//                           <Email color="primary" />
//                         </ListItemIcon>
//                         <ListItemText 
//                           primary="Email" 
//                           secondary={userEmail}
//                           primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
//                           secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
//                         />
//                       </ListItem>
                      
//                       <ListItem>
//                         <ListItemIcon>
//                           <Phone color="primary" />
//                         </ListItemIcon>
//                         <ListItemText 
//                           primary="Phone" 
//                           secondary={userPhone}
//                           primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
//                           secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
//                         />
//                       </ListItem>
                      
//                       <ListItem>
//                         <ListItemIcon>
//                           <LocationOn color="primary" />
//                         </ListItemIcon>
//                         <ListItemText 
//                           primary="Location" 
//                           secondary={userLocation}
//                           primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
//                           secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
//                         />
//                       </ListItem>
                      
//                       <ListItem>
//                         <ListItemIcon>
//                           <CalendarToday color="primary" />
//                         </ListItemIcon>
//                         <ListItemText 
//                           primary="Joined" 
//                           secondary={userJoinDate}
//                           primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
//                           secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
//                         />
//                       </ListItem>
                      
//                       <ListItem>
//                         <ListItemIcon>
//                           <Work color="primary" />
//                         </ListItemIcon>
//                         <ListItemText 
//                           primary="Last Active" 
//                           secondary={userLastActive}
//                           primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
//                           secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
//                         />
//                       </ListItem>
//                     </List>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>

//             <Divider sx={{ my: 2 }} />

//             {/* Tab-specific content */}
//             {tabValue === 'tutors' && (
//               <Box>
//                 {/* Documents Section */}
//                 <Accordion defaultExpanded sx={{ mb: 2 }}>
//                   <AccordionSummary expandIcon={<ExpandMore />}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Description sx={{ mr: 1 }} />
//                       <Typography variant="h6">Uploaded Documents</Typography>
//                       <Badge
//                         badgeContent={userDocuments.filter(d => !d.verified).length}
//                         color="error"
//                         sx={{ ml: 2 }}
//                       />
//                     </Box>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     {userDocuments.length > 0 ? (
//                       <List>
//                         {userDocuments.map((doc, index) => (
//                           <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
//                             <ListItemIcon>
//                               <Description color={doc.verified ? "success" : "action"} />
//                             </ListItemIcon>
//                             <ListItemText
//                               primary={
//                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                                   <Typography variant="body1" fontWeight="medium">
//                                     {doc.type}
//                                   </Typography>
//                                   {doc.verified ? (
//                                     <CheckCircle color="success" fontSize="small" />
//                                   ) : (
//                                     <Pending color="warning" fontSize="small" />
//                                   )}
//                                 </Box>
//                               }
//                               secondary={
//                                 <Box>
//                                   <Typography variant="body2">Uploaded: {doc.uploadDate}</Typography>
//                                   {doc.notes && (
//                                     <Typography variant="body2" color="text.secondary">
//                                       {doc.notes}
//                                     </Typography>
//                                   )}
//                                 </Box>
//                               }
//                             />
//                             <Box sx={{ display: 'flex', gap: 1 }}>
//                               <IconButton
//                                 size="small"
//                                 href={doc.url}
//                                 target="_blank"
//                                 disabled={doc.url === '#'}
//                                 title={doc.url === '#' ? 'Document not available' : 'View document'}
//                               >
//                                 <CloudDownload />
//                               </IconButton>
//                               {!doc.verified && (
//                                 <>
//                                   <Button 
//                                     size="small" 
//                                     variant="outlined" 
//                                     color="success"
//                                     onClick={() => onVerifyDocument?.(doc.type)}
//                                   >
//                                     Verify
//                                   </Button>
//                                   <Button 
//                                     size="small" 
//                                     variant="outlined" 
//                                     color="error"
//                                     onClick={() => onRejectDocument?.(doc.type)}
//                                   >
//                                     Reject
//                                   </Button>
//                                 </>
//                               )}
//                             </Box>
//                           </ListItem>
//                         ))}
//                       </List>
//                     ) : (
//                       <Typography variant="body2" color="text.secondary">
//                         No documents uploaded yet.
//                       </Typography>
//                     )}
//                   </AccordionDetails>
//                 </Accordion>

//                 {/* Interview Section */}
//                 <Accordion defaultExpanded sx={{ mb: 2 }}>
//                   <AccordionSummary expandIcon={<ExpandMore />}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <CalendarToday sx={{ mr: 1 }} />
//                       <Typography variant="h6">Interview Management</Typography>
//                     </Box>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Typography variant="body2" color="text.secondary">
//                       Interview management functionality will be implemented soon.
//                     </Typography>
//                   </AccordionDetails>
//                 </Accordion>

//                 {/* Application Notes */}
//                 <Accordion>
//                   <AccordionSummary expandIcon={<ExpandMore />}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Assignment sx={{ mr: 1 }} />
//                       <Typography variant="h6">Application Notes</Typography>
//                     </Box>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Typography variant="body2" color="text.secondary">
//                       {userApplicationNotes || 'No application notes available.'}
//                     </Typography>
//                   </AccordionDetails>
//                 </Accordion>
//               </Box>
//             )}

//             {tabValue === 'students' && (
//               <Box>
//                 <Typography variant="h6" gutterBottom>Student Information</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={6}>
//                     <Card>
//                       <CardContent>
//                         <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
//                           Subjects
//                         </Typography>
//                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                           {userSubjects.map(subject => (
//                             <Chip key={subject} label={subject} size="small" />
//                           ))}
//                         </Box>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Card>
//                       <CardContent>
//                         <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
//                           Sessions Completed
//                         </Typography>
//                         <Typography variant="h4" color="primary">
//                           {userSessionsCompleted}
//                         </Typography>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                 </Grid>
//               </Box>
//             )}

//             {tabValue === 'parents' && (
//               <Box>
//                 <Typography variant="h6" gutterBottom>Parent Information</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={6}>
//                     <Card>
//                       <CardContent>
//                         <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
//                           Children
//                         </Typography>
//                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                           {userChildren.map(child => (
//                             <Chip key={child} label={child} size="small" />
//                           ))}
//                         </Box>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Card>
//                       <CardContent>
//                         <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
//                           Sessions Booked
//                         </Typography>
//                         <Typography variant="h4" color="primary">
//                           {userSessionsBooked}
//                         </Typography>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                 </Grid>
//               </Box>
//             )}
//           </Box>
//         </Zoom>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose} variant="outlined">
//           Close
//         </Button>
//         {tabValue === 'tutors' && userStatus !== 'verified' && (
//           <Button
//             variant="contained"
//             color="success"
//             onClick={() => {
//               // Handle approve tutor
//               onClose();
//             }}
//             disabled={
//               !userDocuments.every(d => d.verified) ||
//               !user.is_background_checked ||
//               !user.is_reference_verified ||
//               !user.is_qualification_verified
//             }
//           >
//             Approve Tutor
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default UserDetailDialog; 