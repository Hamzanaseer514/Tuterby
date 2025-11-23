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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Plus,
  Upload,
  FileText,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Download,
  Eye,
  CheckCircle,
  Users,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Edit3,
  Trash2,
  Info,
  BarChart3,
  Send
} from 'lucide-react';
import { createAssignment, getTutorAssignments, editAssignment, deleteAssignment } from '../../services/assignmentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

const TutorAssignments = () => {
  const { toast } = useToast();
  const { user, fetchWithAuth } = useAuth();
  const { academicLevels, subjects } = useSubject();

  const [assignments, setAssignments] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [tutorAcademicLevels, setTutorAcademicLevels] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    submission_status: 'all',
    subject: 'all',
    academic_level: 'all',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    academic_level: '',
    subject: '',
    selected_students: [],
    title: '',
    description: '',
    due_date: '',
    file: null
  });

  // Edit and Delete states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editForm, setEditForm] = useState({
    academic_level: '',
    subject: '',
    student_user_id: '',
    title: '',
    description: '',
    due_date: '',
    file: null,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchTutorAcademicLevels();
      fetchSubmittedAssignments();
      fetchUnreadCount();
    }
  }, [user]);

    function truncate(text, len = 100) {
    if (!text) return '';
    const s = String(text);
    return s.length > len ? s.slice(0, len).trim() + '...' : s;
  }

  const fetchAssignments = async () => {
    try {
      const data = await getTutorAssignments(user._id);
      setAssignments(data);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorAcademicLevels = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/assignments/tutor/${user._id}/academic-levels`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setTutorAcademicLevels(data.academic_levels || []);
      }
    } catch (error) {
      // Error handling
    }
  };

  const fetchSubjectsForLevel = async (academicLevelId) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/assignments/tutor/${user._id}/academic-levels/${academicLevelId}/subjects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableSubjects(data.subjects || []);
      }
    } catch (error) {
      setAvailableSubjects([]);
    }
  };

  const fetchStudentsForAssignment = async (academicLevelId, subjectId) => {
    try {
      setLoadingStudents(true);
      const response = await fetchWithAuth(`${BASE_URL}/api/assignments/tutor/${user._id}/academic-levels/${academicLevelId}/subjects/${subjectId}/students`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data.students || []);
      }
    } catch (error) {
      setAvailableStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSubmittedAssignments = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/assignments/tutor/${user._id}/submitted-assignments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setSubmittedAssignments(data.assignments || []);
      }
    } catch (error) {
      // Error handling
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/assignments/tutor/${user._id}/unread-submissions-count`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      // Error handling
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      if (field === 'academic_level' && value) {
        fetchSubjectsForLevel(value);
        newData.subject = '';
        newData.selected_students = [];
        setAvailableSubjects([]);
        setAvailableStudents([]);
      }

      if (field === 'subject' && value && prev.academic_level) {
        fetchStudentsForAssignment(prev.academic_level, value);
        newData.selected_students = [];
      }

      return newData;
    });
  };

  const handleStudentSelection = (studentId, isSelected) => {
    setFormData(prev => {
      const newSelectedStudents = isSelected
        ? [...prev.selected_students, studentId]
        : prev.selected_students.filter(id => id !== studentId);

      return {
        ...prev,
        selected_students: newSelectedStudents
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.academic_level || !formData.subject || !formData.title || formData.selected_students.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one student",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const assignmentPromises = formData.selected_students.map(studentId =>
        createAssignment(user._id, {
          ...formData,
          student_user_id: studentId
        })
      );

      await Promise.all(assignmentPromises);

      toast({
        title: "Success",
        description: `Assignment created successfully for ${formData.selected_students.length} student(s)`
      });

      setFormData({
        academic_level: '',
        subject: '',
        selected_students: [],
        title: '',
        description: '',
        due_date: '',
        file: null
      });
      setShowCreateForm(false);
      fetchAssignments();
      fetchSubmittedAssignments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatOnlyDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = weekdays[date.getUTCDay()];
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${dayName}, ${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setDeletingAssignmentId(assignmentId);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (assignment) => {
    setEditingAssignment(assignment);
    setEditForm({
      academic_level: assignment.academic_level?._id || '',
      subject: assignment.subject?._id || '',
      student_user_id: assignment.student_id?._id || '',
      title: assignment.title || '',
      description: assignment.description || '',
      due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
      file: null,
    });

    if (assignment.academic_level?._id) {
      fetchSubjectsForLevel(assignment.academic_level._id);
    }
    if (assignment.academic_level?._id && assignment.subject?._id) {
      fetchStudentsForAssignment(assignment.academic_level._id, assignment.subject._id);
    }
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (field === 'academic_level' && value) {
      fetchSubjectsForLevel(value);
      setEditForm(prev => ({ ...prev, subject: '', student_user_id: '' }));
    }
    if (field === 'subject' && value && editForm.academic_level) {
      fetchStudentsForAssignment(editForm.academic_level, value);
      setEditForm(prev => ({ ...prev, student_user_id: '' }));
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditForm(prev => ({ ...prev, file }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;
    try {
      await editAssignment(user._id, editingAssignment._id, {
        title: editForm.title,
        description: editForm.description,
        due_date: editForm.due_date || undefined,
        subject: editForm.subject || undefined,
        academic_level: editForm.academic_level || undefined,
        student_user_id: editForm.student_user_id || undefined,
        file: editForm.file || undefined,
      });
      toast({ title: 'Updated', description: 'Assignment updated successfully' });
      setEditDialogOpen(false);
      setEditingAssignment(null);
      fetchAssignments();
      fetchSubmittedAssignments();
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to update assignment', variant: 'destructive' });
    }
  };

  const handleEditAssignment = (assignment) => {
    openEditDialog(assignment);
  };

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetails(true);
  };

  const confirmDeleteAssignment = async () => {
    if (!deletingAssignmentId) return;
    setDeleteSubmitting(true);
    try {
      const res = await deleteAssignment(user._id, deletingAssignmentId);
      toast({ title: 'Deleted', description: res.message || 'Assignment deleted' });
      setAssignments(prev => prev.filter(a => a._id !== deletingAssignmentId));
      setSubmittedAssignments(prev => prev.filter(a => a._id !== deletingAssignmentId));
      setDeleteDialogOpen(false);
      setDeletingAssignmentId(null);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to delete assignment', variant: 'destructive' });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects?.find(s => s._id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getLevelName = (levelId) => {
    const level = academicLevels?.find(l => l._id === levelId);
    return level?.level || 'Unknown Level';
  };

  const getFilteredAssignments = () => {
    let filtered = activeTab === 'all' ? assignments : submittedAssignments;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(query) ||
        assignment.description.toLowerCase().includes(query) ||
        assignment.student_id.user_id.full_name.toLowerCase().includes(query)
      );
    }

    if (filters.submission_status !== 'all') {
      filtered = filtered.filter(assignment => {
        switch (filters.submission_status) {
          case 'submitted':
            return assignment.has_submission && !assignment.is_graded;
          case 'graded':
            return assignment.has_submission && assignment.is_graded;
          case 'not_submitted':
            return !assignment.has_submission;
          default:
            return true;
        }
      });
    }

    if (filters.subject !== 'all') {
      filtered = filtered.filter(assignment =>
        assignment.subject._id === filters.subject
      );
    }

    if (filters.academic_level !== 'all') {
      filtered = filtered.filter(assignment =>
        assignment.academic_level._id === filters.academic_level
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sort_by) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'student_name':
          aValue = a.student_id.user_id.full_name.toLowerCase();
          bValue = b.student_id.user_id.full_name.toLowerCase();
          break;
        case 'submission_date':
          aValue = a.submission_date ? new Date(a.submission_date) : new Date(0);
          bValue = b.submission_date ? new Date(b.submission_date) : new Date(0);
          break;
        case 'created_at':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
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
      sort_by: 'created_at',
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
          <p className="text-gray-600 mt-1">Create, manage, and review student assignments</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {unreadCount} New
            </Badge>
          )}

          {/* Tab Buttons */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              All ({assignments.length})
            </Button>
            <Button
              variant={activeTab === 'submitted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('submitted')}
              className="relative flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submitted ({submittedAssignments.length})
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Assignment
          </Button>
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
                  placeholder="Search assignments by title, description, or student name..."
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
                      <SelectItem value="not_submitted">Not Submitted</SelectItem>
                      <SelectItem value="submitted">Submitted (Pending)</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
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
                        <SelectItem value="created_at">Created Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="student_name">Student Name</SelectItem>
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

      {/* Create Assignment Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="academic_level" className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Level *
                </Label>
                <Select
                  value={formData.academic_level}
                  onValueChange={(value) => handleInputChange('academic_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutorAcademicLevels.map((level) => (
                      <SelectItem key={level._id} value={level._id}>
                        {level.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Subject *
                </Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange('subject', value)}
                  disabled={!formData.academic_level}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Students * ({formData.selected_students.length} selected)
                </Label>

                {!formData.subject ? (
                  <p className="text-xs text-gray-500">Please select a subject first</p>
                ) : loadingStudents ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading students...
                  </div>
                ) : availableStudents.length === 0 ? (
                  <p className="text-xs text-red-500">No students found with active payment for this subject</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {availableStudents.map((student) => (
                      <div key={student._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={student._id}
                          checked={formData.selected_students.includes(student._id)}
                          onCheckedChange={(checked) => handleStudentSelection(student._id, checked)}
                        />
                        <Label htmlFor={student._id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{student.user_id.full_name}</span>
                          </div>
                          <p className="text-xs text-gray-500 ml-2">
                            Payment: {(student.payment_info.validity_status === 'active') ? (
                              <Badge variant="success">Active</Badge>
                            ) : (student.payment_info.validity_status === 'expired') ? (
                              <Badge variant="error">Expired</Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    type="datetime-local"
                    id="due_date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assignment title"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter assignment description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="file">Assignment File (Optional)</Label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Creating...' : 'Create Assignment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {activeTab === 'all' ? `All Assignments (${getFilteredAssignments().length})` : `Submitted Assignments (${getFilteredAssignments().length})`}
          </h3>
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing {getFilteredAssignments().length} of {activeTab === 'all' ? assignments.length : submittedAssignments.length} assignments
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {getFilteredAssignments().length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {getActiveFiltersCount() > 0 ? (
                <>
                  <p className="text-gray-600">No assignments match your filters</p>
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
                  <p className="text-gray-600">No assignments found</p>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'all' ? 'Create your first assignment to get started' : 'No submitted assignments yet'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {getFilteredAssignments().map((assignment) => (
              <Card key={assignment._id} className={
                assignment.has_submission
                  ? assignment.is_graded
                    ? 'border-green-200 bg-green-50'
                    : 'border-orange-200 bg-orange-50'
                  : 'border-gray-200'
              }>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{assignment.title}</h4>
                        {assignment.has_submission ? (
                          assignment.is_graded ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          )
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      {assignment.description && (
                        <p className="text-gray-600 text-sm">{truncate(assignment.description)}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatOnlyDate(assignment.createdAt)}
                      </Badge>
                      {assignment.has_submission ? (
                        <div className="flex gap-1">
                          <Badge variant={assignment.is_graded ? 'default' : 'secondary'}>
                            {assignment.is_graded ? 'Graded' : 'Submitted'}
                          </Badge>
                          {assignment.is_late && (
                            <Badge variant="destructive" className="text-xs">
                              Late
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Not Submitted
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Student</p>
                        <p className="text-sm font-medium">{assignment.student_id.user_id.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Subject</p>
                        <p className="text-sm font-medium">{getSubjectName(assignment.subject._id)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Level</p>
                        <p className="text-sm font-medium">{getLevelName(assignment.academic_level._id)}</p>
                      </div>
                    </div>
                    {assignment.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm font-medium">{formatDate(assignment.due_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {assignment.file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(assignment.file_url, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          View File
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewDetails(assignment)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditAssignment(assignment)}
                        title="Edit Assignment"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        title="Delete Assignment"
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
      </div>

      {/* Edit Assignment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Assignment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Student</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {(() => {
                    const id = editForm.student_user_id || editingAssignment?.student_id?._id;
                    const s = availableStudents.find(x => x._id === id);
                    return s?.user_id?.full_name || editingAssignment?.student_id?.user_id?.full_name || '—';
                  })()}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Academic Level & Subject</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {getLevelName(editForm.academic_level) || (editingAssignment?.academic_level?.level) || '—'} - {getSubjectName(editForm.subject) || (editingAssignment?.subject?.name) || '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input value={editForm.title} onChange={(e) => handleEditFormChange('title', e.target.value)} />
              </div>

              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <Input type="datetime-local" value={editForm.due_date} onChange={(e) => handleEditFormChange('due_date', e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea value={editForm.description} onChange={(e) => handleEditFormChange('description', e.target.value)} rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <Label className="text-sm font-medium">Assignment File</Label>
                <Input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" onChange={handleEditFileChange} />
              </div>
              <div className="text-sm text-gray-600">
                {editingAssignment?.file_url ? (
                  <div className="flex items-center justify-end gap-2">
                    <a href={editingAssignment.file_url} target="_blank" rel="noreferrer" className="text-blue-600 underline flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Current file
                    </a>
                    <span className="text-xs text-gray-500">(upload to replace)</span>
                  </div>
                ) : (
                  <div className="flex justify-end items-center gap-1 text-gray-500">
                    <FileText className="h-3 w-3" />
                    No existing file
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setEditDialogOpen(false); setEditingAssignment(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Assignment Details Dialog */}
      {showDetails && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{selectedAssignment.title}</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Assignment Details</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDetails(false); setSelectedAssignment(null); }}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-4 sm:mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Assignment Information
                  </h3>
                  <div className="space-y-3">
                    {selectedAssignment.description && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-500">Description:</span>
                        <p className="text-xs sm:text-sm text-gray-900 mt-1 break-words">{selectedAssignment.description}</p>
                      </div>
                    )}
                    {selectedAssignment.due_date && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-500">Due Date:</span>
                        <p className="text-xs sm:text-sm text-gray-900">{formatDate(selectedAssignment.due_date)}</p>
                      </div>
                    )}
                    {selectedAssignment.file_url && (
                      <div className="mt-2">
                        <a href={selectedAssignment.file_url} target="_blank" rel="noreferrer" className="text-blue-600 underline flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Open attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants
                  </h3>
                  <div className="space-y-3">
                    {/* <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Tutor:</span>
                      <p className="text-xs sm:text-sm text-gray-900 break-words">{selectedAssignment.tutor_id?.user_id?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 break-words">{selectedAssignment.tutor_id?.user_id?.email || ''}</p>
                    </div> */}
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Student:</span>
                      <p className="text-xs sm:text-sm text-gray-900 break-words">{selectedAssignment.student_id?.user_id?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 break-words">{selectedAssignment.student_id?.user_id?.email || ''}</p>
                    </div>
                      <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Subject:</span>
                      <p className="text-xs sm:text-sm text-gray-900">{selectedAssignment.subject?.name || selectedAssignment.subject}</p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Academic Level:</span>
                      <p className="text-xs sm:text-sm text-gray-900">{selectedAssignment.academic_level?.level || selectedAssignment.academic_level}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => { setShowDetails(false); setSelectedAssignment(null); }} className="w-full sm:w-auto">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Are you sure you want to delete this assignment? This will remove all related student submissions.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingAssignmentId(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAssignment} disabled={deleteSubmitting} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                {deleteSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TutorAssignments;