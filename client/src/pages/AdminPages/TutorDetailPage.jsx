import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/components/AdminLayout";
import { toast } from "react-toastify";
import { useSubject } from "../../hooks/useSubject";
import {
  User,
} from 'lucide-react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
    ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Zoom,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  Skeleton,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Star,
  School,
  Person,
  ContactMail,
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  Description,
  CloudDownload,
  Assignment,
  ExpandMore,
  Schedule,
  Cancel,
} from "@mui/icons-material";
import {
  verifyDocument,
  getTutorDetails,
  getAvailableInterviewSlots,
  setAvailableInterviewSlots,
  approveTutorProfile,
  rejectTutorProfile,
  partialApproveTutor,
  completeInterview,
} from "../../services/adminService";
import { BASE_URL } from "../../config";

const TutorDetailPage = () => {
  const { tabValue } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [schedulingStatus, setSchedulingStatus] = useState("");
  const [isInterview, setIsInterview] = useState(
    Boolean(
      user?.is_interview || (user?.interviewSlots || []).some((s) => s.is_interview)
    )
  );
  const [profileStatusReason, setProfileStatusReason] = useState(
    user?.profileStatusReason || ""
  );
  const [localUser, setLocalUser] = useState(user);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
const { subjects, academicLevels } = useSubject();

const getSubjectName = (id) => {
  const subject = subjects.find((s) => s._id === id);
  return subject ? subject : "";
};
const getAcademicLevel = (level) => {Experience
  const matchedLevel = academicLevels.find(l => l._id === level);
  if(matchedLevel){
    return matchedLevel;
  }
  return null;
}
  const formatDateTimeLabel = (slot) => {
    try {
      if (!slot) return "";
      // String ISO datetime
      if (typeof slot === "string") {
        const d = new Date(slot);
        if (Number.isNaN(d.getTime())) return slot;
        // Always show in UTC to match backend storage
        const date = d.toLocaleDateString(undefined, { timeZone: 'UTC' });
        const time = d.toLocaleTimeString(undefined, { timeZone: 'UTC', hour: "2-digit", minute: "2-digit" });
        return `${date}, ${time}`;
      }
      // Object with fields
      if (typeof slot === "object") {
        // If explicit dateTime provided
        if (slot.dateTime) {
          const d = new Date(slot.dateTime);
          if (!Number.isNaN(d.getTime())) {
            const date = d.toLocaleDateString(undefined, { timeZone: 'UTC' });
            const time = d.toLocaleTimeString(undefined, { timeZone: 'UTC', hour: "2-digit", minute: "2-digit" });
            return `${date}, ${time}`;
          }
        }
        // If separate date and time
        if (slot.date) {
          const d = new Date(slot.date);
          if (!Number.isNaN(d.getTime())) {
            const date = d.toLocaleDateString(undefined, { timeZone: 'UTC' });
            if (slot.time) return `${date}, ${slot.time}`;
            const time = d.toLocaleTimeString(undefined, { timeZone: 'UTC', hour: "2-digit", minute: "2-digit" });
            return `${date}, ${time}`;
          }
        }
      }
      return String(slot);
    } catch {
      return String(slot);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user?.id) return;
      try {
        const fresh = await getTutorDetails(user.id);
        setLocalUser(fresh);
      } catch (e) {
        console.error("Failed to refresh tutor details:", e);
      }
    };
    fetchDetails();
  }, [user?.id]);

  // Auto-refresh details periodically so admin sees tutor's booked slot without manual reload
  useEffect(() => {
    if (!user?.id) return;
    const intervalId = setInterval(async () => {
      try {
        const fresh = await getTutorDetails(user.id);
        setLocalUser(fresh);
      } catch {}
    }, 10000); // refresh every 10s
    return () => clearInterval(intervalId);
  }, [user?.id]);

  const handleInterviewToggle = async (event) => {
    const newValue = event.target.checked;
    setIsInterview(newValue);
    try {
      await fetch(`${BASE_URL}/api/admin/tutors/${user.id}/interview-toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_interview: newValue }),
      });
      setLocalUser((prev) => ({
        ...prev,
        interviewSlots: Array.isArray(prev?.interviewSlots)
          ? prev.interviewSlots.map((s) => ({ ...s, is_interview: newValue }))
          : [
              {
                date: new Date().toISOString(),
                time: "",
                is_interview: newValue,
              },
            ],
      }));
      toast.success("Interview toggle updated successfully!");
    } catch (error) {
      console.error("Failed to update interview toggle:", error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      setProfileStatusReason(user?.profileStatusReason || "");
      setLocalUser(user);
      setIsInterview(
        Boolean(
          user?.is_interview || (user?.interviewSlots || []).some((s) => s.is_interview)
        )
      );
    }
  }, [user]);

  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true);
    setSlotError("");
    try {
      const slots = await getAvailableInterviewSlots(date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlotError("Failed to load available slots. Using default times.");
      setAvailableSlots([
        { date: date, time: "09:00", available: true },
        { date: date, time: "10:00", available: true },
        { date: date, time: "11:00", available: false },
        { date: date, time: "14:00", available: true },
        { date: date, time: "15:00", available: true },
        { date: date, time: "16:00", available: true },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelection = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleScheduleInterview = async () => {
    if (selectedTimes.length === 0) {
      setSlotError("Please select at least one time slot");
      return;
    }
    setSchedulingStatus("scheduling");
    try {
      const scheduledDateTimes = selectedTimes.map((time) => `${selectedDate}T${time}`);
      await setAvailableInterviewSlots(user.id, scheduledDateTimes);
      setSchedulingStatus("success");
      setLocalUser((prev) => ({
        ...prev,
        preferredSlots: Array.isArray(prev?.preferredSlots)
          ? [...prev.preferredSlots, ...scheduledDateTimes]
          : [...scheduledDateTimes],
      }));
      try {
        const fresh = await getTutorDetails(user.id);
        setLocalUser(fresh);
      } catch (e) {
        console.error("Post-schedule refresh failed:", e);
      }
      setTimeout(() => {
        setSchedulingStatus("");
        setSelectedTimes([]);
      }, 2000);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      setSchedulingStatus("error");
    }
  };

  const handleSaveInterviewResults = async (userId, result) => {
    try {
      await completeInterview(userId, result);
      const normalized = (result || "").toLowerCase();
      const statusLabel = normalized === "passed" ? "Passed" : normalized === "failed" ? "Failed" : localUser?.interviewStatus;

      // Optimistic UI update so alert appears immediately
      setLocalUser((prev) => {
        const updatedSlots = Array.isArray(prev?.interviewSlots)
          ? prev.interviewSlots.map((s) => (s?.scheduled ? { ...s, completed: true, result: statusLabel } : s))
          : prev?.interviewSlots;
        return {
          ...prev,
          interviewStatus: statusLabel,
          againInterview: false,
          interviewSlots: updatedSlots,
        };
      });
      setSelectedOutcome(normalized);
      toast.success("Interview results saved successfully!");

      // Refresh from backend to ensure server state is reflected
      try {
        const fresh = await getTutorDetails(userId);
        setLocalUser(fresh);
      } catch (e) {
        // Non-fatal; UI already updated optimistically
      }
    } catch (e) {
      toast.error("Failed to save interview results");
    }
  };

  const handleApproveTutor = async () => {
    const res = await approveTutorProfile(user.id, profileStatusReason);
    if (res.status === 400) {
      toast.error(res.data.message);
    } else if (res.status === 200) {
      toast.success("Tutor profile approved successfully And Email Sent to Tutor");
      setLocalUser((prev) => ({
        ...prev,
        status: "verified",
        documents: prev?.documents || [],
      }));
    } else {
      toast.error("Tutor profile not approved");
    }
  };

  const handlePartialApproveTutor = async () => {
    const res = await partialApproveTutor(user.id, profileStatusReason);
    if (res.status === 400) {
      toast.error(res.data.message);
    } else if (res.status === 200) {
      toast.success("Tutor profile partially approved successfully And Email Sent to Tutor");
      setLocalUser((prev) => ({
        ...prev,
        status: "partial_approved",
        documents: prev?.documents || [],
      }));
    } else {
      toast.error(res.data.message);
    }
  };

  const handleRejectTutor = async () => {
    const res = await rejectTutorProfile(user.id, profileStatusReason);
    if (res.status === 400) {
      toast.error(res.data.message);
    } else if (res.status === 200) {
      toast.success("Tutor profile rejected successfully And Email Sent to Tutor");
      setLocalUser((prev) => ({
        ...prev,
        status: "rejected",
        documents: (prev?.documents || []).map((doc) => ({
          ...doc,
          verified: "Pending",
        })),
      }));
    } else {
      toast.error(res.data.message);
    }
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  const normalizeDocType = (t) => (t || "").toLowerCase();
  const getDocStatus = (doc) => {
    const v = doc?.verified;
    const s = (doc?.status || "").toString().toLowerCase();
    if (typeof v === "boolean") return v ? "Approved" : s.includes("reject") ? "Rejected" : "Pending";
    if (typeof v === "number") return v === 1 ? "Approved" : v === -1 ? "Rejected" : "Pending";
    const vs = (v || "").toString().toLowerCase();
    if (vs.includes("approve") || vs === "verified" || vs === "true") return "Approved";
    if (vs.includes("reject") || vs === "false") return "Rejected";
    if (vs.includes("pending") || vs.includes("unverified")) return "Pending";
    if (s.includes("approve")) return "Approved";
    if (s.includes("reject")) return "Rejected";
    return "Pending";
  };
  const isIdProof = (t) => /\b(id|identity|cnic|passport|aadhar)\b/.test(normalizeDocType(t));
  const isAddressProof = (t) => /address/.test(normalizeDocType(t));
  const isDegree = (t) => /degree|qualification/.test(normalizeDocType(t));
  const isCertificate = (t) => /certificate/.test(normalizeDocType(t));
  const isReference = (t) => /reference|referee/.test(normalizeDocType(t));

  const groupDocumentsByCategory = (docs = []) => {
    const backgroundDocs = docs.filter((d) => isIdProof(d.type) || isAddressProof(d.type));
    const qualificationDocs = docs.filter((d) => isDegree(d.type) || isCertificate(d.type));
    const referenceDocs = docs.filter((d) => isReference(d.type));
    const otherDocs = docs.filter(
      (d) => !backgroundDocs.includes(d) && !qualificationDocs.includes(d) && !referenceDocs.includes(d)
    );
    return { backgroundDocs, qualificationDocs, referenceDocs, otherDocs };
  };

  const handleVerifyDocuments = async (typesToVerify = []) => {
    if (!Array.isArray(typesToVerify) || typesToVerify.length === 0) return;
    try {
      await Promise.all(typesToVerify.map((t) => verifyDocument(user.id, t)));
      setLocalUser((prev) => {
        const updatedDocuments = (prev?.documents || []).map((d) =>
          typesToVerify.includes(d.type) ? { ...d, verified: "Approved" } : d
        );
        return { ...prev, documents: updatedDocuments };
      });
      try {
        const fresh = await getTutorDetails(user.id);
        setLocalUser(fresh);
        setSnackbar({ open: true, message: "Documents verified successfully.", severity: "success" });
      } catch (e) {
        console.error("Post-verify refresh failed:", e);
      }
    } catch (err) {
      console.error("Bulk verification failed:", err);
      setSnackbar({ open: true, message: "Failed to verify documents. Please try again.", severity: "error" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getTabIcon = (currentTab) => {
    switch (currentTab) {
      case "tutors":
        return <School />;
      case "students":
        return <Person />;
      case "parents":
        return <ContactMail />;
      default:
        return <Person />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading user details...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>User not found</Typography>
      </Box>
    );
  }

  const userName = localUser?.name || "Unknown User";
  const userEmail = localUser?.email || "No email provided";
  const userPhone = localUser?.phone || "No phone provided";
  const userLocation = localUser?.location || "No location provided";
  const userJoinDate = localUser?.joinDate || "Unknown";
  const userLastActive = localUser?.lastActive || "Unknown";
  const userRating = localUser?.rating;
  const userStatus = localUser?.status;
  const userDocuments = localUser?.documents || [];

  return (
    <AdminLayout tabValue={tabValue}>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => navigate("/admin/users")} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getTabIcon(tabValue)}
              <Typography variant="h4" sx={{ ml: 1 }}>
                {userName}
              </Typography>
            </Box>
          </Box>
          {userStatus && (
            <Chip
              label={userStatus}
              color={getStatusColor(userStatus)}
              variant={userStatus === "unverified" ? "outlined" : "filled"}
            />
          )}
        </Box>

        <Zoom in timeout={400}>
          <Box>
            <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2, width: "100%" }}>
                        {/* <Avatar sx={{ width: 80, height: 80, background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)", fontSize: "2rem", fontWeight: "bold", mr: 2 }}> */}
                          {/* {userName.charAt(0)} */}
                          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {localUser?.photo_url ? (
                        <img
                          src={`${BASE_URL}${localUser.photo_url}`}
                          alt="Profile"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                        {/* </Avatar> */}
                        <Box>
                          <Typography variant="h5" fontWeight="bold" style={{marginLeft:"19px"}}>
                            {userName}
                          </Typography>
                          {userRating && (
                            <Box sx={{ display: "flex", alignItems: "center" }} style={{marginLeft:"19px"}}>
                              <Star color="warning" fontSize="small" />
                              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: "medium" }}>
                                {userRating}/5
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Tutor Details
                      </Typography>

                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Full Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Join Date</TableCell>
                              <TableCell>Last Active</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Experience</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>1</TableCell>
                              <TableCell>{userName}</TableCell>
                              <TableCell>{userEmail}</TableCell>
                              <TableCell>{userPhone}</TableCell>
                              <TableCell>{userLocation}</TableCell>
                              <TableCell>
                                {userJoinDate
                                  ? new Date(userJoinDate).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {userLastActive
                                  ? new Date(userLastActive).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={userStatus || "N/A"}
                                  color={getStatusColor(userStatus)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{localUser?.experience_years || "N/A"}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
{console.log(localUser)}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Education Information
                      </Typography>

                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Academic Level</TableCell>
                              <TableCell>Subjects</TableCell>
                              <TableCell>Total Session</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>1</TableCell>
                              <TableCell>
                                {Array.isArray(localUser?.academic_levels_taught) &&
                                localUser.academic_levels_taught.length > 0 ? (
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {localUser.academic_levels_taught.map((level, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`${level.educationLevel.level} (${level.hourlyRate}$/hr)`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: "0.7rem",
                                          borderColor: "secondary.main",
                                          color: "secondary.main",
                                        }}
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell>
                                {localUser?.subjects?.length > 0 ? (
                                  localUser.subjects.map((s, i) => (
                                    <Chip
                                      key={s._id || i}
                                      label={getSubjectName(s._id).name || "N/A"}
                                      size="small"
                                      sx={{ mr: 0.5 }}
                                    />
                                  ))
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell>
  {localUser?.TotalSessions !== undefined ? localUser.TotalSessions : "N/A"}
</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Accordion defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Description sx={{ mr: 1 }} />
                    <Typography variant="h6">Uploaded Documents</Typography>
                    <Badge
                      badgeContent={userDocuments.filter((d) => getDocStatus(d) !== "Approved").length}
                      color="error"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {(() => {
                    const { backgroundDocs, qualificationDocs, referenceDocs, otherDocs } =
                      groupDocumentsByCategory(userDocuments);

                    const renderDocList = (docs) => (
                      <List sx={{ mt: 1 }}>
                        {docs.map((doc, idx) => (
                          <ListItem key={`${doc.type}-${idx}`} sx={{ border: "1px solid #e0e0e0", borderRadius: 1, mb: 1 }}>
                            <ListItemIcon>
                              <Description
                                color={
                                  getDocStatus(doc) === "Approved"
                                    ? "success"
                                    : getDocStatus(doc) === "Rejected"
                                    ? "error"
                                    : "action"
                                }
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography variant="body1" fontWeight="medium">
                                    {doc.type}
                                  </Typography>
                                  {getDocStatus(doc) === "Approved" ? (
                                    <CheckCircle color="success" fontSize="small" />
                                  ) : getDocStatus(doc) === "Rejected" ? (
                                    <Cancel color="error" fontSize="small" />
                                  ) : (
                                    <Pending color="warning" fontSize="small" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">Uploaded: {doc.uploadDate}</Typography>
                                  {doc.notes && (
                                    <Typography variant="body2" color="text.secondary">
                                      {doc.notes}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton size="small" onClick={() => handleViewDocument(doc)} disabled={doc.url === "#"} title={doc.url === "#" ? "Document not available" : "View document"}>
                                <CloudDownload />
                              </IconButton>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    );

                    const anyPendingOrRejected = (docs) =>
                      docs.some((d) => {
                        const s = getDocStatus(d);
                        return s === "Pending" || s === "Rejected";
                      });

                    return (
                      <Box>
                        {backgroundDocs.length > 0 && (
                          <Card sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                Background Check (ID Proof + Address Proof)
                              </Typography>
                              <Button size="small" variant="contained" color="success" disabled={!anyPendingOrRejected(backgroundDocs)} onClick={() => handleVerifyDocuments(backgroundDocs.map((d) => d.type))}>
                                Verify Background
                              </Button>
                            </Box>
                            {renderDocList(backgroundDocs)}
                          </Card>
                        )}

                        {qualificationDocs.length > 0 && (
                          <Card sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                Qualifications (Degree + Certificate)
                              </Typography>
                              <Button size="small" variant="contained" color="success" disabled={!anyPendingOrRejected(qualificationDocs)} onClick={() => handleVerifyDocuments(qualificationDocs.map((d) => d.type))}>
                                Verify Qualifications
                              </Button>
                            </Box>
                            {renderDocList(qualificationDocs)}
                          </Card>
                        )}

                        {referenceDocs.length > 0 && (
                          <Card sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="subtitle1" fontWeight="medium">References</Typography>
                              <Button size="small" variant="contained" color="success" disabled={!anyPendingOrRejected(referenceDocs)} onClick={() => handleVerifyDocuments(referenceDocs.map((d) => d.type))}>
                                Verify References
                              </Button>
                            </Box>
                            {renderDocList(referenceDocs)}
                          </Card>
                        )}

                        {otherDocs.length > 0 && (
                          <Card sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="medium">Other Documents</Typography>
                            {renderDocList(otherDocs)}
                          </Card>
                        )}

                        {userDocuments.length === 0 && (
                          <Typography variant="body2" color="text.secondary">No documents uploaded yet.</Typography>
                        )}
                      </Box>
                    );
                  })()}
                </AccordionDetails>
              </Accordion>

              <Accordion defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarToday sx={{ mr: 1 }} />
                      <Typography variant="h6">Interview Management</Typography>
                    </Box>
                    <FormControlLabel control={<Switch checked={isInterview} onChange={handleInterviewToggle} color="primary" />} label="Enable Interview" />
                  </Box>
                </AccordionSummary>
                {isInterview && (
                  <AccordionDetails>
                    {localUser.interviewStatus === "Passed" && (
                      <Alert severity="success" sx={{ mb: 2 }}>Interview Passed.</Alert>
                    )}
                    {localUser.interviewStatus === "Failed" && (
                      <Alert severity="error" sx={{ mb: 2 }}>Interview Failed.</Alert>
                    )}
                    {localUser.againInterview === true && localUser.interviewStatus === "Pending" && (
                        <Alert severity="warning" sx={{ mb: 2 }}>Re-interview requested.</Alert>
                   
                    )}

                    <Box>
                      <Card sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Interview Slot Scheduled by Admin
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {Array.isArray(localUser.preferredSlots) && localUser.preferredSlots.length > 0 && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, ml: 2 }}>
                              {localUser.preferredSlots.map((slot, index) => (
                                <Chip key={index} label={formatDateTimeLabel(slot)} variant="outlined" color="primary" size="small" />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Card>

                      <Card sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          Interview Slot Booked by Tutor
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {Array.isArray(localUser.interviewSlots) && localUser.interviewSlots.length > 0 ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, ml: 2 }}>
                              {localUser.interviewSlots.map((slot, index) => {
                                const date = new Date(slot.date || slot.dateTime || slot);
                                const dateStr = date.toLocaleDateString(undefined, { timeZone: 'UTC' });
                                const timeStr = date.toLocaleTimeString(undefined, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
                                let chipColor = "primary";
                                if (slot.completed) {
                                  chipColor = slot.result ? "success" : "warning";
                                } else if (slot.scheduled) {
                                  chipColor = "primary";
                                }
                                return (
                                  <Chip
                                    key={index}
                                    label={`${dateStr}, ${slot.time || timeStr}`}
                                    variant="outlined"
                                    color={chipColor}
                                    size="small"
                                    sx={{ borderStyle: slot.completed ? "solid" : "dashed", fontWeight: slot.completed ? "bold" : "normal" }}
                                    title={slot.completed ? `Completed: ${slot.result || "No result yet"}` : "Scheduled interview"}
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No interview slots booked yet.</Typography>
                          )}
                        </Box>
                      </Card>

                      {localUser.interviewSlots?.some((slot) => slot.scheduled) && (
                        <Card sx={{ p: 3, mt: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <Typography variant="h6" fontWeight="medium" gutterBottom>
                            Interview Results
                          </Typography>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Select interview outcome:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {[{ value: 'passed', label: 'Passed', color: 'success' }, { value: 'failed', label: 'Failed', color: 'error' }].map((outcome) => (
                                <Chip key={outcome.value} label={outcome.label} clickable variant={selectedOutcome === outcome.value ? 'filled' : 'outlined'} color={outcome.color} onClick={() => handleSaveInterviewResults(localUser.id, outcome.value)} sx={{ borderRadius: 1, fontWeight: 'medium', px: 2, py: 1.5, '& .MuiChip-label': { px: 1 } }} />
                              ))}
                            </Box>
                          </Box>
                        </Card>
                      )}

                      {!localUser.interviewSlots?.some((slot) => slot.scheduled) && (localUser.interviewStatus !== "Passed") && (
                        <Card sx={{ p: 3, mt: 3, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' }}>
                          <Typography variant="h6" fontWeight="medium" gutterBottom>
                            Schedule Interview
                          </Typography>
                          <Box sx={{ mb: 3 }}>
                            <TextField fullWidth label="Select Interview Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} InputLabelProps={{ shrink: true }} InputProps={{ sx: { '& input': { py: 1.5 } } }} sx={{ maxWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                          </Box>
                          {selectedDate && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                                Available Time Slots
                                {selectedTimes.length > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    ({selectedTimes.length} selected)
                                  </Typography>
                                )}
                              </Typography>
                              {loadingSlots ? (
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                  {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                                  ))}
                                </Box>
                              ) : (
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                  {availableSlots.map((slot, index) => (
                                    <Chip key={index} label={slot.time} color={selectedTimes.includes(slot.time) ? "primary" : "default"} variant={selectedTimes.includes(slot.time) ? "filled" : "outlined"} onClick={() => slot.available && handleTimeSelection(slot.time)} sx={{ borderRadius: 1, height: 36, fontWeight: 'medium', cursor: slot.available ? 'pointer' : 'default', opacity: slot.available ? 1 : 0.5, '&:hover': { boxShadow: slot.available ? '0 0 0 2px rgba(25, 118, 210, 0.2)' : 'none' } }} />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          )}
                          {selectedTimes.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                                Selected Time Slots
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {selectedTimes.map((time, index) => (
                                  <Chip key={index} label={time} color="primary" onDelete={() => handleTimeSelection(time)} deleteIcon={<Cancel fontSize="small" />} sx={{ borderRadius: 1, height: 32, '& .MuiChip-deleteIcon': { color: 'primary.light', '&:hover': { color: 'primary.contrastText' } } }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                            <Button variant="contained" startIcon={<Schedule />} onClick={handleScheduleInterview} disabled={schedulingStatus === "scheduling" || selectedTimes.length === 0} sx={{ px: 3, py: 1, borderRadius: 1, textTransform: 'none', fontWeight: 'medium', minWidth: 180 }}>
                              {schedulingStatus === "scheduling" ? (<><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Scheduling...</>) : ("Schedule Interview")}
                            </Button>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            {schedulingStatus === "success" && (
                              <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }} onClose={() => setSchedulingStatus(null)}>
                                Interview scheduled successfully!
                              </Alert>
                            )}
                            {schedulingStatus === "error" && (
                              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }} onClose={() => setSchedulingStatus(null)}>
                                Failed to schedule interview. Please try again.
                              </Alert>
                            )}
                            {slotError && (
                              <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }} onClose={() => setSlotError(null)}>
                                {slotError}
                              </Alert>
                            )}
                          </Box>
                        </Card>
                      )}
                    </Box>
                  </AccordionDetails>
                )}
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Assignment sx={{ mr: 1 }} />
                    <Typography variant="h6">Application Notes</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField fullWidth label="Application Notes" value={profileStatusReason} required multiline rows={4} onChange={(e) => setProfileStatusReason(e.target.value)} />
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}>
              <Button variant="outlined" color="primary" onClick={handlePartialApproveTutor} sx={{ minHeight: 48, minWidth: 160, px: 3, py: 1.5, fontSize: "0.875rem", fontWeight: 500, "&:hover": { backgroundColor: "primary.main", color: "white" }, cursor: "pointer", userSelect: "none" }}>
                Partial Approve Tutor
              </Button>
              <>
                <Button onClick={handleRejectTutor} variant="contained" color="error" sx={{ minHeight: 48, minWidth: 140, px: 3, py: 1.5, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", userSelect: "none" }}>
                  Reject Tutor
                </Button>
                {localUser.profileStatus !== "approved" ? (
                  <Button variant="contained" color="success" onClick={handleApproveTutor} sx={{ minHeight: 48, minWidth: 140, px: 3, py: 1.5, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", userSelect: "none" }}>
                    Approve Tutor
                  </Button>
                ) : (
                  <Button variant="contained" color="success" sx={{ minHeight: 48, minWidth: 140, px: 3, py: 1.5, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", userSelect: "none" }}>
                    Tutor is verified
                  </Button>
                )}
              </>
              <Button onClick={() => navigate("/admin/users")} variant="outlined" sx={{ minHeight: 48, minWidth: 120, px: 3, py: 1.5, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", userSelect: "none" }}>
                Back
              </Button>
            </Box>
          </Box>
        </Zoom>


        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
        {showDocumentModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" fontWeight="bold">{selectedDocument.type} Document</Typography>
                <IconButton onClick={handleCloseDocumentModal} size="large">
                  <Cancel />
                </IconButton>
              </div>
              <div className="space-y-4">
                <Card sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                  <Typography variant="body2" color="text.secondary"><strong>Type:</strong> {selectedDocument.type}</Typography>
                  {selectedDocument.uploadDate && (<Typography variant="body2" color="text.secondary"><strong>Uploaded:</strong> {selectedDocument.uploadDate}</Typography>)}
                  {selectedDocument.notes && (<Typography variant="body2" color="text.secondary"><strong>Notes:</strong> {selectedDocument.notes}</Typography>)}
                </Card>
                <div className="flex justify-center">
                  {selectedDocument.url && selectedDocument.url !== "#" ? (
                    <div className="w-full">
                      {selectedDocument.type?.toLowerCase().includes("image") || selectedDocument.url?.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i) ? (
                        <img src={selectedDocument.url} alt={selectedDocument.type} className="max-w-full h-auto max-h-[60vh] object-contain border rounded-lg shadow-lg" style={{ maxWidth: "100%", height: "auto", maxHeight: "60vh" }} />
                      ) : (
                        <iframe src={selectedDocument.url} title={selectedDocument.type} className="w-full h-[60vh] border rounded-lg shadow-lg" style={{ width: "100%", height: "60vh" }} />
                      )}
                    </div>
                  ) : (
                    <Card sx={{ p: 4, textAlign: "center", backgroundColor: "#f8f9fa" }}>
                      <CloudDownload sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">Document Not Available</Typography>
                      <Typography variant="body2" color="text.secondary">The document file could not be loaded or is not accessible.</Typography>
                    </Card>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {selectedDocument.url && selectedDocument.url !== "#" && (
                    <Button variant="outlined" startIcon={<CloudDownload />} onClick={() => window.open(selectedDocument.url, "_blank")}>
                      Download
                    </Button>
                  )}
                  <Button variant="outlined" onClick={handleCloseDocumentModal}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Box>
    </AdminLayout>
  );
};

export default TutorDetailPage;

 
