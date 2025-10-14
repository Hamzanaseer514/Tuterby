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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  FileText,
  User,
  Calendar,
  Clock,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { getTutorSubmissions, gradeSubmission } from '../../services/assignmentService';
import { useSubject } from '../../hooks/useSubject';

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
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  return (
    <div className="space-y-6">
      {/* Assignment Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          {console.log("submission", submission)}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-medium font-medium">Title:</span>
              <h3 className="text-xl font-semibold mb-2">{submission.assignment_id.title}</h3>
            </div>
            {submission.assignment_id.description && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Description:</span>
                <p className="text-gray-600">{submission.assignment_id.description}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
              {submission.status === 'graded' ? 'Graded' : 'Pending Evaluation'}
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
          {submission.assignment_id.subject && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Subject:</span>
              <span className="text-sm">{submission.assignment_id.subject.name}</span>
            </div>
          )}
          {submission.assignment_id.academic_level && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Academic Level:</span>
              <span className="text-sm">{submission.assignment_id.academic_level.level}</span>
            </div>
          )}
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
          <div className="flex  gap-2">
            <h4 className="font-medium text-gray-900">Student's Submission</h4>
            <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
              {submission.is_late ? 'Late Submission' : 'On Time'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Submitted:</span>
            <span className="text-sm">{formatDateTime(submission.submitted_at)}</span>
          </div>
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
  const { academicLevels, subjects } = useSubject();

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

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    submission_status: 'all', // 'all', 'graded', 'pending'
    subject: 'all',
    academic_level: 'all',
    sort_by: 'submitted_at', // 'submitted_at', 'title', 'student_name', 'grade'
    sort_order: 'desc' // 'asc', 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      const data = await getTutorSubmissions(user._id);
      setSubmissions(data);
      console.log("submissions", data);
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
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  // Filter and search functions
  const getFilteredSubmissions = () => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(submission => {
        const title = submission?.assignment_id?.title || '';
        const description = submission?.assignment_id?.description || '';
        const studentName = submission?.student_id?.user_id?.full_name || '';
        return (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          studentName.toLowerCase().includes(query)
        );
      });
    }

    // Apply submission status filter
    if (filters.submission_status !== 'all') {
      filtered = filtered.filter(submission => {
        switch (filters.submission_status) {
          case 'graded':
            return submission?.status === 'graded';
          case 'pending':
            return submission?.status !== 'graded';
          default:
            return true;
        }
      });
    }

    // Apply subject filter
    if (filters.subject !== 'all') {
      filtered = filtered.filter(submission => {
        const subjectId = submission?.assignment_id?.subject?._id;
        return subjectId === filters.subject;
      });
    }

    // Apply academic level filter
    if (filters.academic_level !== 'all') {
      filtered = filtered.filter(submission => {
        const levelId = submission?.assignment_id?.academic_level?._id;
        return levelId === filters.academic_level;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sort_by) {
        case 'title': {
          const aTitle = a?.assignment_id?.title || '';
          const bTitle = b?.assignment_id?.title || '';
          aValue = aTitle.toLowerCase();
          bValue = bTitle.toLowerCase();
          break;
        }
        case 'student_name': {
          const aName = a?.student_id?.user_id?.full_name || '';
          const bName = b?.student_id?.user_id?.full_name || '';
          aValue = aName.toLowerCase();
          bValue = bName.toLowerCase();
          break;
        }
        case 'grade':
          aValue = a?.grade ?? 0;
          bValue = b?.grade ?? 0;
          break;
        case 'submitted_at':
        default:
          aValue = new Date(a?.submitted_at || 0);
          bValue = new Date(b?.submitted_at || 0);
          break;
      }

      if (filters.sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      submission_status: 'all',
      subject: 'all',
      academic_level: 'all',
      sort_by: 'submitted_at',
      sort_order: 'desc'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.submission_status !== 'all') count++;
    if (filters.subject !== 'all') count++;
    if (filters.academic_level !== 'all') count++;
    return count;
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects?.find(s => s._id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getLevelName = (levelId) => {
    const level = academicLevels?.find(l => l._id === levelId);
    return level?.level || 'Unknown Level';
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
          {getFilteredSubmissions().length} submission{getFilteredSubmissions().length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search and Filters Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search submissions by assignment title, description, or student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                {/* Submission Status Filter */}
                <div>
                  <Label className="text-sm font-medium">Submission Status</Label>
                  <Select
                    value={filters.submission_status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, submission_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending Evaluation</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Filter */}
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <Select
                    value={filters.subject}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Academic Level Filter */}
                <div>
                  <Label className="text-sm font-medium">Academic Level</Label>
                  <Select
                    value={filters.academic_level}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, academic_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {academicLevels?.map((level) => (
                        <SelectItem key={level._id} value={level._id}>
                          {level.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <div className="flex gap-2">
                    <Select
                      value={filters.sort_by}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted_at">Submission Date</SelectItem>
                        <SelectItem value="title">Assignment Title</SelectItem>
                        <SelectItem value="student_name">Student Name</SelectItem>
                        <SelectItem value="grade">Grade</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc'
                      }))}
                    >
                      {filters.sort_order === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {getFilteredSubmissions().length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {getActiveFiltersCount() > 0 ? (
              <>
                <p className="text-gray-600">No submissions match your filters</p>
                <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-3"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-600">No submissions yet</p>
                <p className="text-sm text-gray-500">Students will submit their assignments here</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Results Summary */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                Showing {getFilteredSubmissions().length} of {submissions.length} submissions
              </span>
            </div>
          )}

          {getFilteredSubmissions().map((submission) => (
            <Card key={submission._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-medium font-medium">Title:</span>
                      <h3 className="text-xl font-semibold mb-2">{submission.assignment_id.title}</h3>
                    </div>
                    {submission.assignment_id.description && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Description:</span>
                        <p className="text-gray-600">{submission.assignment_id.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                      {submission.status === 'graded' ? 'Graded' : 'Pending Evaluation'}
                    </Badge>
                    <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
                      {submission.is_late ? 'Late Submission' : 'On Time'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Student:</span>
                      <span className="text-sm">{submission.student_id.user_id.full_name}</span>
                    </div>

                    {/* <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Submitted:</span>
                      <span className="text-sm">{formatDateTime(submission.submitted_at)}</span>
                    </div> */}
                    {submission.assignment_id.subject && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Subject:</span>
                        <span>{submission.assignment_id.subject.name}</span>
                      </div>
                    )}
                    {submission.assignment_id.academic_level && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Academic Level:</span>
                        <span>{submission.assignment_id.academic_level.level}</span>
                      </div>
                    )}
                    {submission.status === 'graded' && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Grade:</span>
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
