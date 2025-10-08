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
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="space-y-6">
      {/* Assignment Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-medium font-medium">Title:</span>
              <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Description:</span>
              <p className="text-gray-600">{assignment.description}</p>
            </div>

          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">
              Created: {formatDate(assignment.createdAt)}
            </Badge>
            {dueStatus && (
              <Badge variant={dueStatus.color}>
                {dueStatus.status === 'missing' && 'Missing Assignment'}
                {dueStatus.status === 'due-soon' && 'Due Soon'}
                {dueStatus.status === 'upcoming' && 'Upcoming'}
                {dueStatus.status === 'submitted' && 'Submitted'}
                {dueStatus.status === 'graded' && 'Graded'}
              </Badge>
            )}
          </div>
        </div>

        {/* Assignment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Tutor:</span>
            <span className="text-sm">{getTutorName(assignment)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Subject:</span>
            <span className="text-sm">{getSubjectName(assignment.subject._id)}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Academic Level:</span>
            <span className="text-sm">{getLevelName(assignment.academic_level._id)}</span>
          </div>
          {assignment.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Due Date:</span>
              <span className="text-sm">{formatDateTime(assignment.due_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignment File */}
      {assignment.file_url && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Assignment File</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{assignment.file_name}</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(assignment.file_url, '_blank')}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={() => onDownload(assignment._id, assignment.file_name)}
                disabled={downloading[assignment._id]}
              >
                <Download className="h-3 w-3 mr-1" />
                {downloading[assignment._id] ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!assignment.file_url && (
        <div className="text-center py-4 text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No file attached</p>
        </div>
      )}

      {/* Submission Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Your Submission</h4>
          {submission && (
            <Badge variant={submission.is_late ? 'destructive' : 'default'}>
              {submission.is_late ? 'Late Submission' : 'On Time'}
            </Badge>
          )}
        </div>
        {submission ? (
          <div className="space-y-3">


            {submission.submission_text && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-5">
                  <p className="text-sm font-medium">Submission Text:</p>
                  <p className="text-sm text-gray-700">{submission.submission_text}</p>
                </div>
              </div>
            )}

            {submission.submission_file_url && (
              <div className="flex items-center gap-5 justify-between">
                <div className="flex items-center gap-12">
                  <p className="text-sm font-medium">Submitted File:</p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">{submission.submission_file_name}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-end"
                  onClick={() => window.open(submission.submission_file_url, '_blank')}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Submitted: {formatDateTime(submission.submitted_at)}
            </p>

            {submission.status === 'graded' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Grade: {submission.grade}/100</span>
                  <Badge variant="default">Graded</Badge>
                </div>
                {submission.feedback && (
                  <div className="mt-2">
                    <div className="flex items-center gap-5">
                      <p className="text-sm font-medium">Feedback:</p>
                      <p className="text-sm text-gray-700">{submission.feedback}</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Graded: {formatDateTime(submission.graded_at)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Ready to submit your work?</p>
            <Button
              onClick={() => onSubmitAssignment(assignment)}
              className="w-full max-w-xs"
            >
              Submit Assignment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentAssignments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { academicLevels, subjects } = useSubject();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchAssignments = async () => {
    try {
      const data = await getStudentAssignments(user._id);
      setAssignments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await getStudentSubmissions(user._id);
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
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
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
        <Badge variant="outline" className="text-sm">
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assignments yet</p>
            <p className="text-sm text-gray-500">Your tutors will assign work here when you have active sessions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const dueStatus = getDueDateStatus(assignment.due_date, assignment);
            const submission = getSubmissionForAssignment(assignment._id);

            return (
              <Card key={assignment._id} className={dueStatus?.status === 'missing' ? 'border-red-200 bg-red-50' : ''}>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-medium font-medium">Title:</span>
                        <h4 className="text-lg font-semibold">{assignment.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Description:</span>
                        <p className="text-gray-600">{assignment.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {submission && (
                        <div className="flex flex-col items-end gap-1">

                          {dueStatus && (
                            <Badge variant={dueStatus.color}>
                              {dueStatus.status === 'missing' && 'Missing Assignment'}
                              {dueStatus.status === 'due-soon' && 'Due Soon'}
                              {dueStatus.status === 'upcoming' && 'Upcoming'}
                              {dueStatus.status === 'submitted' && 'Submitted'}
                              {dueStatus.status === 'graded' && 'Graded'}
                            </Badge>
                          )}
                          <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
                            {submission.is_late ? 'Late' : 'On Time'}
                          </Badge>
                          {submission.status === 'graded' && (
                            <span className="text-sm font-medium text-green-600">
                              Grade: {submission.grade}/100
                            </span>
                          )}
                        </div>
                      )}
                      {dueStatus && !submission && (
                        <Badge variant={dueStatus.color}>
                          {dueStatus.status === 'missing' && 'Missing Assignment'}
                          {dueStatus.status === 'due-soon' && 'Due Soon'}
                          {dueStatus.status === 'upcoming' && 'Upcoming'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{getTutorName(assignment)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{getSubjectName(assignment.subject._id)}</span>
                      </div>
                      {assignment.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(assignment.due_date)}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(assignment)}
                    >
                      <Info className="h-4 w-4 mr-1" />
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowDetailsModal(false);
            setCurrentAssignment(null);
          }}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {currentAssignment.title}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setCurrentAssignment(null);
                  }}
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowSubmitModal(false);
            setSelectedAssignment(null);
            setSubmissionForm({ submission_text: '', file: null });
          }}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Submit Assignment</CardTitle>
              <p className="text-sm text-gray-600">{selectedAssignment.title}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="submission_text">Submission Text (Optional)</Label>
                <Textarea
                  id="submission_text"
                  value={submissionForm.submission_text}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, submission_text: e.target.value }))}
                  placeholder="Enter your submission text here..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="submission_file">Upload File (Optional)</Label>
                <Input
                  id="submission_file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitForm}
                  disabled={submitting}
                  className="flex-1"
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
