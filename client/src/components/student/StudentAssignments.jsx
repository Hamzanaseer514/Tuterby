import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSubject } from '../../hooks/useSubject';
import { useToast } from '../ui/use-toast';
import { BASE_URL } from '@/config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  FileText,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Download,
  Eye,
  Clock,
  Info
} from 'lucide-react';
import { RefreshCw, Repeat } from 'lucide-react';
import { getStudentAssignments, downloadAssignment, submitAssignment, getStudentSubmissions } from '../../services/assignmentService';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Assignment Details Modal Component
const AssignmentDetailsModal = ({
  assignment,
  submission,
  dueStatus,
  onDownload,
  onSubmitAssignment,
  downloading,
  subjects,
  academicLevels
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects?.find(s => s._id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getLevelName = (levelId) => {
    const level = academicLevels?.find(l => l._id === levelId);
    return level?.level || 'Unknown Level';
  };

  const getTutorName = (assignment) => {
    return assignment.tutor_id?.user_id?.full_name || 'Unknown Tutor';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Assignment Info */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px]">Title:</span>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold break-words">{assignment.title}</h3>
            </div>
            {assignment.description && (
              <div className="flex flex-col gap-1 sm:gap-2 mt-2 sm:mt-3">
                <span className="text-xs sm:text-sm font-medium">Description:</span>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base break-words">{assignment.description}</p>
              </div>
            )}
          </div>
          <div className="flex flex-row xs:flex-col items-start xs:items-end gap-1 sm:gap-2 flex-wrap mt-1 xs:mt-0">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              Created: {formatDate(assignment.createdAt)}
            </Badge>
            {dueStatus && (
              <Badge variant={dueStatus.color} className="text-xs sm:text-sm">
                {dueStatus.status === 'missing' && 'Missing'}
                {dueStatus.status === 'due-soon' && 'Due Soon'}
                {dueStatus.status === 'upcoming' && 'Upcoming'}
                {dueStatus.status === 'submitted' && 'Submitted'}
                {dueStatus.status === 'graded' && 'Graded'}
              </Badge>
            )}
          </div>
        </div>

        {/* Assignment Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 sm:gap-2">
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium min-w-[40px] sm:min-w-[50px]">Tutor:</span>
            <span className="text-xs sm:text-sm break-words flex-1">{getTutorName(assignment)}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px]">Subject:</span>
            <span className="text-xs sm:text-sm break-words flex-1">{getSubjectName(assignment.subject._id)}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium min-w-[90px] sm:min-w-[110px]">Academic Level:</span>
            <span className="text-xs sm:text-sm break-words flex-1">{getLevelName(assignment.academic_level._id)}</span>
          </div>
          {assignment.due_date && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium min-w-[60px] sm:min-w-[70px]">Due Date:</span>
              <span className="text-xs sm:text-sm break-words flex-1">{formatDateTime(assignment.due_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignment File */}
      {assignment.file_url && (
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Assignment File</h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium break-words">{assignment.file_name}</span>
            </div>
            <div className="flex flex-col xs:flex-row gap-1 sm:gap-2 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(assignment.file_url, '_blank')}
                className="w-full xs:w-auto text-xs sm:text-sm"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={() => onDownload(assignment._id, assignment.file_name)}
                disabled={downloading[assignment._id]}
                className="w-full xs:w-auto text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 mr-1" />
                {downloading[assignment._id] ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!assignment.file_url && (
        <div className="text-center py-4 sm:py-6 md:py-8 text-gray-500">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-gray-300 mx-auto mb-1 sm:mb-2" />
          <p className="text-xs sm:text-sm md:text-base">No file attached</p>
        </div>
      )}

      {/* Submission Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <h4 className="font-medium text-gray-900 text-base sm:text-lg">Your Submission</h4>
          {submission && (
            <Badge variant={submission.is_late ? 'destructive' : 'default'} className="text-xs sm:text-sm">
              {submission.is_late ? 'Late Submission' : 'On Time'}
            </Badge>
          )}
        </div>
        {submission ? (
          <div className="space-y-3 sm:space-y-4">
            {submission.submission_text && (
              <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:gap-4">
                  <p className="text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px] flex-shrink-0">Submission Text:</p>
                  <p className="text-xs sm:text-sm text-gray-700 break-words flex-1">{submission.submission_text}</p>
                </div>
              </div>
            )}

            {submission.submission_file_url && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 md:gap-8 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium min-w-[80px] sm:min-w-[100px]">Submitted File:</p>
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-blue-600 break-words">{submission.submission_file_name}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(submission.submission_file_url, '_blank')}
                  className="self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0 text-xs sm:text-sm"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            )}

            <p className="text-xs sm:text-sm text-gray-500">
              Submitted: {formatDateTime(submission.submitted_at)}
            </p>

            {submission.status === 'graded' && (
              <div className="bg-blue-50 p-3 sm:p-4 md:p-5 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <span className="font-medium text-sm sm:text-base">Grade: {submission.grade}/100</span>
                  <Badge variant="default" className="text-xs sm:text-sm">Graded</Badge>
                </div>
                {submission.feedback && (
                  <div className="mt-2 sm:mt-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:gap-4">
                      <p className="text-xs sm:text-sm font-medium min-w-[60px] sm:min-w-[70px] flex-shrink-0">Feedback:</p>
                      <p className="text-xs sm:text-sm text-gray-700 break-words flex-1">{submission.feedback}</p>
                    </div>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                  Graded: {formatDateTime(submission.graded_at)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 md:py-8 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3">Ready to submit your work?</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Note: File upload is required for submission</p>
            <Button
              onClick={() => onSubmitAssignment(assignment)}
              className="w-full sm:max-w-xs text-xs sm:text-sm"
              size="sm"
            >
              Submit Assignment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Truncate helper (declare before JSX usage)
function truncate(text, len = 50) {
  if (!text) return '';
  const s = String(text);
  return s.length > len ? s.slice(0, len).trim() + '...' : s;
}

const StudentAssignments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { academicLevels, subjects } = useSubject();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(false);
  const [lastDataHash, setLastDataHash] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    submission_text: '',
    file: null
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchSubmissions();
    }
  }, [user]);

  // polling for updates when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAssignments(true);
      fetchSubmissions(true);
    }, 30000); // every 30s
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // fetchAssignments supports silent polling when `silent` is true
  const fetchAssignments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getStudentAssignments(user._id);

      const newAssignments = data || [];

      // detect changes by hashing assignment ids
      try {
        const hash = JSON.stringify(newAssignments.map(a => a._id || a));
        if (lastDataHash && hash !== lastDataHash) {
          setNewUpdatesAvailable(true);
        }
        setLastDataHash(hash);
      } catch (e) {
        if (lastDataHash && (newAssignments.length !== (assignments?.length || 0))) {
          setNewUpdatesAvailable(true);
        }
        setLastDataHash(String(newAssignments.length));
      }

      setAssignments(newAssignments);
    } catch (error) {
      if (!silent) {
        // optional: show toast
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // supports silent polling when `silent` is true
  const fetchSubmissions = async (silent = false) => {
    try {
      const data = await getStudentSubmissions(user._id);
      const newSubs = data || [];

      // optional: detect submission changes too (compare assignment ids)
      try {
        const subHash = JSON.stringify(newSubs.map(s => s._id || s));
        if (lastDataHash && subHash !== lastDataHash) {
          setNewUpdatesAvailable(true);
        }
        // do not overwrite lastDataHash here to avoid clobbering assignment hash
      } catch (e) {
        if (lastDataHash && (newSubs.length !== (submissions?.length || 0))) {
          setNewUpdatesAvailable(true);
        }
      }

      setSubmissions(newSubs);
    } catch (error) {
      // ignore for silent polling
    }
  };

  const handleDownload = async (assignmentId, fileName) => {
    setDownloading(prev => ({ ...prev, [assignmentId]: true }));

    try {
      const data = await downloadAssignment(assignmentId);
      // Open the S3 URL directly in a new tab
      window.open(data.file_url, '_blank');

      toast({
        title: "Success",
        description: "File opened successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open file",
        variant: "destructive"
      });
    } finally {
      setDownloading(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects?.find(s => s._id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getLevelName = (levelId) => {
    const level = academicLevels?.find(l => l._id === levelId);
    return level?.level || 'Unknown Level';
  };

  const getTutorName = (assignment) => {
    return assignment.tutor_id?.user_id?.full_name || 'Unknown Tutor';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getDueDateStatus = (dueDate, assignment) => {
    if (!dueDate || !assignment) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);

    // Check if assignment is submitted first
    const submission = getSubmissionForAssignment(assignment._id);
    if (submission) {
      if (submission.status === 'graded') {
        return { status: 'graded', color: 'default' };
      }
      return { status: 'submitted', color: 'secondary' };
    }

    // If not submitted, check due date status
    if (diffHours < 0) return { status: 'missing', color: 'destructive' };
    if (diffHours < 24) return { status: 'due-soon', color: 'secondary' };
    return { status: 'upcoming', color: 'default' };
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(sub => sub.assignment_id._id === assignmentId);
  };

  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionForm({ submission_text: '', file: null });
    setShowSubmitModal(true);
    setShowDetailsModal(false); // Close details modal
  };

  const handleViewDetails = (assignment) => {
    setCurrentAssignment(assignment);
    setShowDetailsModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSubmissionForm(prev => ({ ...prev, file }));
  };

  const handleSubmitForm = async () => {
    if (!selectedAssignment) {
      return;
    }

    // Validate that a file is uploaded
    if (!submissionForm.file) {
      toast({
        title: "Error",
        description: "Please upload a file to submit your assignment",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitAssignment(selectedAssignment._id, {
        student_user_id: user._id,
        submission_text: submissionForm.submission_text,
        file: submissionForm.file
      });

      toast({
        title: "Success",
        description: "Assignment submitted successfully"
      });

      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmissionForm({ submission_text: '', file: null });
      fetchSubmissions(); // Refresh submissions
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit assignment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-row sm:flex-row justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">My Assignments</h2>
          <Badge variant="subtle" className="text-xs sm:text-sm md:text-base mt-3">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* {newUpdatesAvailable && (
            <Button
              size="sm"
              variant="default"
              className="text-xs"
              onClick={() => { setNewUpdatesAvailable(false); fetchAssignments(false); fetchSubmissions(false); }}
            >
              New updates — Refresh
            </Button>
          )} */}

          <Button
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-2"
            onClick={() => { setNewUpdatesAvailable(false); fetchAssignments(false); fetchSubmissions(false); }}
          >
            <RefreshCw className="w-4 h-4" />
            {/* Refresh */}
          </Button>
          {/* 
          <Button
            size="sm"
            variant={autoRefresh ? 'default' : 'outline'}
            className="text-xs flex items-center gap-2"
            onClick={() => setAutoRefresh(prev => !prev)}
          >
            <Repeat className="w-4 h-4" />
            {autoRefresh ? 'Auto On' : 'Auto Off'}
          </Button> */}
        </div>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6 sm:py-8 md:py-12">
            <FileText className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">No assignments yet</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1 sm:mt-2">
              Your tutors will assign work here when you have active sessions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {assignments.map((assignment) => {
            const dueStatus = getDueDateStatus(assignment.due_date, assignment);
            const submission = getSubmissionForAssignment(assignment._id);

            return (
              <Card
                key={assignment._id}
                className={dueStatus?.status === 'missing' ? 'border-red-200 bg-red-50' : 'hover:shadow-md transition-shadow'}
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  {/* Title and Status Section */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 md:gap-3 mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium whitespace-nowrap min-w-[40px] sm:min-w-[50px]">Title:</span>
                        <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold break-words">{assignment.title}</h4>
                      </div>
                      {assignment.description && (
                        <div className="mt-1 sm:mt-2">
                          <p className="text-gray-600 text-xs sm:text-sm md:text-base break-words">
                            {truncate(assignment.description, 80)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-1 sm:gap-2 min-w-0 mt-2 lg:mt-0">
                      {submission && (
                        <div className="flex flex-col items-start lg:items-end gap-1 sm:gap-2 w-full lg:w-auto">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {dueStatus && (
                              <Badge variant={dueStatus.color} className="text-xs sm:text-sm">
                                {dueStatus.status === 'missing' && 'Missing'}
                                {dueStatus.status === 'due-soon' && 'Due Soon'}
                                {dueStatus.status === 'upcoming' && 'Upcoming'}
                                {dueStatus.status === 'submitted' && 'Submitted'}
                                {dueStatus.status === 'graded' && 'Graded'}
                              </Badge>
                            )}
                            {submission.status === 'graded' && (
                              <span className="text-xs sm:text-sm md:text-base font-medium text-green-600 whitespace-nowrap">
                                Grade: {submission.grade}/100
                              </span>
                            )}
                          </div>
                          <Badge variant={submission.is_late ? 'destructive' : 'secondary'} className="text-xs sm:text-sm">
                            {submission.is_late ? 'Late Submission' : 'On Time'}
                          </Badge>
                        </div>
                      )}
                      {dueStatus && !submission && (
                        <Badge variant={dueStatus.color} className="text-xs sm:text-sm">
                          {dueStatus.status === 'missing' && 'Missing'}
                          {dueStatus.status === 'due-soon' && 'Due Soon'}
                          {dueStatus.status === 'upcoming' && 'Upcoming'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info and Button Section - FIXED FOR IPAD */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
                    {/* Info Section - Now properly contained */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-gray-600">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                          <span className="font-medium whitespace-nowrap">Tutor:</span>
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="break-words truncate">{getTutorName(assignment)}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                          <span className="font-medium whitespace-nowrap">Subject:</span>
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="break-words truncate">{getSubjectName(assignment.subject._id)}</span>
                        </div>
                        {assignment.due_date && (
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            <span className="font-medium whitespace-nowrap">Due:</span>
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            <span className="break-words truncate text-xs sm:text-sm">
                              {formatDateTime(assignment.due_date)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Button Section */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(assignment)}
                      className="w-full lg:w-auto mt-2 lg:mt-0 text-xs sm:text-sm min-w-[120px]"
                    >
                      <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Assignment Details Modal */}
      {showDetailsModal && currentAssignment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-3 md:p-4 lg:p-6"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowDetailsModal(false);
            setCurrentAssignment(null);
          }}
        >
          <div
            className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto bg-white rounded-lg mx-2 sm:mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-1 sm:gap-2 min-w-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
                  <span className="break-words">{currentAssignment.title}</span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setCurrentAssignment(null);
                  }}
                  className="flex-shrink-0 ml-1 sm:ml-2 text-xs sm:text-sm"
                >
                  Close
                </Button>
              </div>

              <AssignmentDetailsModal
                assignment={currentAssignment}
                submission={getSubmissionForAssignment(currentAssignment._id)}
                dueStatus={getDueDateStatus(currentAssignment.due_date, currentAssignment)}
                onDownload={handleDownload}
                onSubmitAssignment={handleSubmitAssignment}
                downloading={downloading}
                subjects={subjects}
                academicLevels={academicLevels}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmitModal && selectedAssignment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-3 md:p-4 lg:p-6"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowSubmitModal(false);
            setSelectedAssignment(null);
            setSubmissionForm({ submission_text: '', file: null });
          }}
        >
          <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Submit Assignment</CardTitle>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">{selectedAssignment.title}</p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 md:space-y-5 p-4 sm:p-6">
              <div>
                <Label htmlFor="submission_text" className="text-xs sm:text-sm md:text-base">Submission Text</Label>
                <Textarea
                  id="submission_text"
                  value={submissionForm.submission_text}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, submission_text: e.target.value }))}
                  placeholder="Enter your submission text here..."
                  rows={3}
                  className="text-xs sm:text-sm md:text-base"
                />
              </div>

              <div>
                <Label htmlFor="submission_file" className="text-xs sm:text-sm md:text-base">
                  Upload File <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="submission_file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  required
                  className="text-xs sm:text-sm md:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">File upload is required for submission</p>
                {submissionForm.file && (
                  <p className="text-xs sm:text-sm text-green-600 mt-1 break-words">
                    ✓ File selected: {submissionForm.file.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleSubmitForm}
                  disabled={submitting || !submissionForm.file}
                  className="flex-1 text-xs sm:text-sm"
                  size="sm"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedAssignment(null);
                    setSubmissionForm({ submission_text: '', file: null });
                  }}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;