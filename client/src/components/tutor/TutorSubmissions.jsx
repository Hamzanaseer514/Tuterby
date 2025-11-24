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
  GraduationCap,
  Edit3,
  Trash2,
  BarChart3,
  Send,
  Award
} from 'lucide-react';
import { RefreshCw, Repeat } from 'lucide-react';
import { getTutorSubmissions, gradeSubmission } from '../../services/assignmentService';
import { deleteSubmission } from '../../services/assignmentService';
import { useSubject } from '../../hooks/useSubject';

// Truncate text function
function truncate(text, len = 50) {
  if (!text) return '';
  const s = String(text);
  return s.length > len ? s.slice(0, len).trim() + '...' : s;
}

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
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{submission.assignment_id.title}</h3>
            {submission.assignment_id.description && (
              <p className="text-gray-600 text-sm">{submission.assignment_id.description}</p>
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
            <div>
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-sm font-medium">{submission.student_id.user_id.full_name}</p>
            </div>
          </div>
          {submission.assignment_id.subject && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="text-sm font-medium">{submission.assignment_id.subject.name}</p>
              </div>
            </div>
          )}
          {submission.assignment_id.academic_level && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Academic Level</p>
                <p className="text-sm font-medium">{submission.assignment_id.academic_level.level}</p>
              </div>
            </div>
          )}
          {submission.assignment_id.due_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm font-medium">{formatDateTime(submission.assignment_id.due_date)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submission Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">Student's Submission</h4>
            <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
              {submission.is_late ? 'Late Submission' : 'On Time'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="text-sm font-medium">{formatDateTime(submission.submitted_at)}</p>
            </div>
          </div>
        </div>
        
        {submission.submission_text && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Submission Text:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.submission_text}</p>
          </div>
        )}

        {submission.submission_file_url && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{submission.submission_file_name}</p>
                <p className="text-xs text-blue-600">Submitted file</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(submission.submission_file_url, '_blank')}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
          </div>
        )}

        {!submission.submission_text && !submission.submission_file_url && (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No submission content provided</p>
          </div>
        )}
      </div>

      {/* Grade Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Award className="h-4 w-4" />
          Evaluation
        </h4>
        {submission.status === 'graded' ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Grade: {submission.grade}/100</span>
            </div>
            {submission.feedback && (
              <div className="mt-3">
                <p className="text-sm font-medium text-green-900 mb-1">Feedback:</p>
                <p className="text-sm text-green-800 whitespace-pre-wrap">{submission.feedback}</p>
              </div>
            )}
            <p className="text-xs text-green-600 mt-3">
              Evaluated: {formatDateTime(submission.graded_at)}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-orange-500" />
            <p className="text-sm text-orange-800 mb-3">Ready to evaluate this submission?</p>
            <Button
              onClick={() => onGradeSubmission(submission)}
              disabled={grading[submission._id]}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              {grading[submission._id] ? 'Evaluating...' : 'Evaluate Submission'}
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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(false);
  const [lastDataHash, setLastDataHash] = useState(null);
  const [grading, setGrading] = useState({});
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingSubmissionId, setDeletingSubmissionId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    submission_status: 'all',
    subject: 'all',
    academic_level: 'all',
    sort_by: 'submitted_at',
    sort_order: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  // polling for updates when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchSubmissions(true);
    }, 30000); // every 30s
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // fetchSubmissions supports silent polling when `silent` is true
  const fetchSubmissions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getTutorSubmissions(user._id);
      const newSubs = data || [];

      // detect changes by hashing submission ids
      try {
        const hash = JSON.stringify(newSubs.map(s => s._id || s));
        if (lastDataHash && hash !== lastDataHash) {
          setNewUpdatesAvailable(true);
        }
        setLastDataHash(hash);
      } catch (e) {
        if (lastDataHash && (newSubs.length !== (submissions?.length || 0))) {
          setNewUpdatesAvailable(true);
        }
        setLastDataHash(String(newSubs.length));
      }

      setSubmissions(newSubs);
    } catch (error) {
      // Error handling
    } finally {
      if (!silent) setLoading(false);
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
    setShowDetailsModal(false);
  };

  const openDeleteSubmissionDialog = (submissionId) => {
    setDeletingSubmissionId(submissionId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSubmission = async () => {
    if (!deletingSubmissionId) return;
    setDeleteSubmitting(true);
    try {
      await deleteSubmission(user._id, deletingSubmissionId);
      toast({ title: 'Deleted', description: 'Submission deleted successfully' });
      setSubmissions(prev => prev.filter(s => s._id !== deletingSubmissionId));
      setShowDeleteDialog(false);
      setDeletingSubmissionId(null);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to delete submission', variant: 'destructive' });
    } finally {
      setDeleteSubmitting(false);
    }
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
        description: "Submission evaluated successfully"
      });

      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeForm({ grade: '', feedback: '' });
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to evaluate submission",
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment Submissions</h2>
          <p className="text-gray-600 mt-1">Review and evaluate student submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {getFilteredSubmissions().length} submission{getFilteredSubmissions().length !== 1 ? 's' : ''}
          </Badge>

          {/* {newUpdatesAvailable && (
            <Button size="sm" variant="default" onClick={() => { setNewUpdatesAvailable(false); fetchSubmissions(false); }}>
              New updates — Refresh
            </Button>
          )} */}

          <Button
            size="sm"
            variant="outline"
            onClick={() => { setNewUpdatesAvailable(false); fetchSubmissions(false); }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {/* Refresh */}
          </Button>

          {/* <Button
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
                      <SelectItem value="graded">Evaluated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

      {/* Submissions List */}
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
                <p className="text-sm text-gray-500">Student submissions will appear here</p>
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
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </Button>
            </div>
          )}

          {getFilteredSubmissions().map((submission) => (
            <Card key={submission._id} className={
              submission.status === 'graded' 
                ? 'border-green-200 bg-green-50' 
                : 'border-orange-200 bg-orange-50'
            }>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{truncate(submission.assignment_id.title, 60)}</h3>
                      {submission.status === 'graded' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    {submission.assignment_id.description && (
                      <p className="text-gray-600 text-sm">{truncate(submission.assignment_id.description, 80)}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                      {submission.status === 'graded' ? 'Evaluated' : 'Pending'}
                    </Badge>
                    <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
                      {submission.is_late ? 'Late' : 'On Time'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Student</p>
                      <p className="text-sm font-medium">{submission.student_id.user_id.full_name}</p>
                    </div>
                  </div>
                  
                  {submission.assignment_id.subject && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Subject</p>
                        <p className="text-sm font-medium">{submission.assignment_id.subject.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {submission.assignment_id.academic_level && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Level</p>
                        <p className="text-sm font-medium">{submission.assignment_id.academic_level.level}</p>
                      </div>
                    </div>
                  )}
                  
                  {submission.status === 'graded' && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Grade</p>
                        <p className="text-sm font-medium text-green-600">{submission.grade}/100</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {formatDateTime(submission.submitted_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewDetails(submission)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGradeSubmission(submission)}
                      title={submission.status === 'graded' ? "Edit Evaluation" : "Evaluate Submission"}
                    >
                      <Award className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => openDeleteSubmissionDialog(submission._id)}
                      title="Delete Submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submission Details
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={() => { setShowDeleteDialog(false); setDeletingSubmissionId(null); }}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Confirm Delete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this submission? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeletingSubmissionId(null); }}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteSubmission} disabled={deleteSubmitting} className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  {deleteSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={() => {
            setShowGradeModal(false);
            setSelectedSubmission(null);
            setGradeForm({ grade: '', feedback: '' });
          }}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Evaluate Submission
              </CardTitle>
              <p className="text-sm text-gray-600">{selectedSubmission.assignment_id.title}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="grade" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Grade (0-100) *
                </Label>
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
                <Label htmlFor="feedback" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Feedback (Optional)
                </Label>
                <Textarea
                  id="feedback"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide constructive feedback for the student..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitGrade}
                  disabled={grading[selectedSubmission._id]}
                  className="flex-1 flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  {grading[selectedSubmission._id] ? 'Evaluating...' : 'Submit Evaluation'}
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