import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  FileText,
  User,
  Calendar,
  Clock,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { getTutorSubmissions, gradeSubmission } from '../../services/assignmentService';

// Submission Details Modal Component
const SubmissionDetailsModal = ({ 
  submission, 
  onGradeSubmission, 
  grading 
}) => {
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

  return (
    <div className="space-y-6">
      {/* Assignment Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-medium font-medium">Title:</span>
                <h3 className="text-xl font-semibold mb-2">{submission.assignment_id.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Description:</span>
                <p className="text-gray-600">{submission.assignment_id.description}</p>
              </div>
           
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
              {submission.status === 'graded' ? 'Graded' : 'Pending'}
            </Badge>
          
          </div>
        </div>

        {/* Student and Submission Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Student:</span>
            <span className="text-sm">{submission.student_id.user_id.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Submitted:</span>
            <span className="text-sm">{formatDateTime(submission.submitted_at)}</span>
          </div>
          {submission.assignment_id.due_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Due Date:</span>
              <span className="text-sm">{formatDateTime(submission.assignment_id.due_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Submission Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Student's Submission</h4>
        <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
                            {submission.is_late ? 'Late' : 'On Time'}
                          </Badge>
                          </div>
        {submission.submission_text && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-5">
            <p className="text-sm font-medium">Submission Text:</p>
            <p className="text-sm text-gray-700">{submission.submission_text}</p>
            </div>
          </div>
        )}
        
        {submission.submission_file_url && (
          <div className="flex items-center gap-2 justify-between">
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
                onClick={() => window.open(submission.submission_file_url, '_blank')}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
          </div>
        )}

        {!submission.submission_text && !submission.submission_file_url && (
          <div className="text-center py-4 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No submission content provided</p>
          </div>
        )}
      </div>

      {/* Grade Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Grading</h4>
        {submission.status === 'graded' ? (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Grade: {submission.grade}/100</span>
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
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Ready to grade this submission?</p>
            <Button
              onClick={() => onGradeSubmission(submission)}
              disabled={grading[submission._id]}
              className="w-full max-w-xs"
            >
              {grading[submission._id] ? 'Grading...' : 'Grade Submission'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const TutorSubmissions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState({});
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      const data = await getTutorSubmissions(user._id);
      setSubmissions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setShowGradeModal(true);
    setShowDetailsModal(false); // Close details modal
  };

  const handleViewDetails = (submission) => {
    setCurrentSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    if (!gradeForm.grade || gradeForm.grade < 0 || gradeForm.grade > 100) {
      toast({
        title: "Error",
        description: "Please enter a valid grade (0-100)",
        variant: "destructive"
      });
      return;
    }

    setGrading(prev => ({ ...prev, [selectedSubmission._id]: true }));

    try {
      await gradeSubmission(selectedSubmission._id, {
        grade: parseInt(gradeForm.grade),
        feedback: gradeForm.feedback
      });

      toast({
        title: "Success",
        description: "Submission graded successfully"
      });

      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeForm({ grade: '', feedback: '' });
      fetchSubmissions(); // Refresh submissions
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
        variant: "destructive"
      });
    } finally {
      setGrading(prev => ({ ...prev, [selectedSubmission._id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assignment Submissions</h2>
        <Badge variant="outline" className="text-sm">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet</p>
            <p className="text-sm text-gray-500">Students will submit their assignments here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-medium font-medium">Title:</span>
                      <h3 className="text-xl font-semibold mb-2">{submission.assignment_id.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-gray-600">{submission.assignment_id.description}</p>
                    </div>
                   
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                      {submission.status === 'graded' ? 'Graded' : 'Pending'}
                    </Badge>
                    <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
                            {submission.is_late ? 'Late' : 'On Time'}
                          </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{submission.student_id.user_id.full_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(submission.submitted_at)}</span>
                    </div>
                    {submission.status === 'graded' && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">{submission.grade}/100</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDetails(submission)}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submission Details Modal */}
      {showDetailsModal && currentSubmission && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowDetailsModal(false);
            setCurrentSubmission(null);
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
                  {currentSubmission.assignment_id.title}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setCurrentSubmission(null);
                  }}
                >
                  Close
                </Button>
              </div>

              <SubmissionDetailsModal 
                submission={currentSubmission}
                onGradeSubmission={handleGradeSubmission}
                grading={grading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowGradeModal(false);
            setSelectedSubmission(null);
            setGradeForm({ grade: '', feedback: '' });
          }}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Grade Submission</CardTitle>
              <p className="text-sm text-gray-600">{selectedSubmission.assignment_id.title}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="grade">Grade (0-100) *</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="Enter grade"
                />
              </div>
              
              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Enter feedback for the student..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitGrade}
                  disabled={grading[selectedSubmission._id]}
                  className="flex-1"
                >
                  {grading[selectedSubmission._id] ? 'Grading...' : 'Submit Grade'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedSubmission(null);
                    setGradeForm({ grade: '', feedback: '' });
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

export default TutorSubmissions;
