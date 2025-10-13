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
  X
} from 'lucide-react';
import { createAssignment, getTutorAssignments } from '../../services/assignmentService';

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
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'submitted'
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    submission_status: 'all', // 'all', 'submitted', 'not_submitted', 'graded'
    subject: 'all',
    academic_level: 'all',
    sort_by: 'created_at', // 'created_at', 'submission_date', 'title', 'student_name'
    sort_order: 'desc' // 'asc', 'desc'
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

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchTutorAcademicLevels();
      fetchSubmittedAssignments();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const data = await getTutorAssignments(user._id);
      setAssignments(data);
      
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to fetch assignments",
      //   variant: "destructive"
      // });
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
      console.error('Failed to fetch academic levels:', error);
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
      console.error('Failed to fetch subjects:', error);
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
      console.error('Failed to fetch students:', error);
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
      console.error('Failed to fetch submitted assignments:', error);
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
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If academic level changes, fetch subjects for that level
      if (field === 'academic_level' && value) {
        fetchSubjectsForLevel(value);
        // Reset subject and students when academic level changes
        newData.subject = '';
        newData.selected_students = [];
        setAvailableSubjects([]);
        setAvailableStudents([]);
      }
      
      // If subject changes, fetch students for that subject and level
      if (field === 'subject' && value && prev.academic_level) {
        fetchStudentsForAssignment(prev.academic_level, value);
        // Reset selected students when subject changes
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
      // Create assignment for each selected student
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  // Filter and search functions
  const getFilteredAssignments = () => {
    let filtered = activeTab === 'all' ? assignments : submittedAssignments;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(query) ||
        assignment.description.toLowerCase().includes(query) ||
        assignment.student_id.user_id.full_name.toLowerCase().includes(query)
      );
    }

    // Apply submission status filter
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

    // Apply subject filter
    if (filters.subject !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.subject._id === filters.subject
      );
    }

    // Apply academic level filter
    if (filters.academic_level !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.academic_level._id === filters.academic_level
      );
    }

    // Apply sorting
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
        <div className="flex items-center gap-3">
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
            >
              All Assignments ({assignments.length})
            </Button>
            <Button
              variant={activeTab === 'submitted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('submitted')}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-1" />
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
                      <SelectItem value="not_submitted">Not Submitted</SelectItem>
                      <SelectItem value="submitted">Submitted (Pending)</SelectItem>
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
              {/* Step 1: Academic Level Selection */}
              <div className="space-y-2">
                <Label htmlFor="academic_level" className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Step 1: Select Academic Level *
                </Label>
                <Select 
                  value={formData.academic_level} 
                  onValueChange={(value) => handleInputChange('academic_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic level you teach" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutorAcademicLevels.map((level) => (
                      <SelectItem key={level._id} value={level._id}>
                        {level.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tutorAcademicLevels.length === 0 && (
                  <p className="text-xs text-gray-500">No academic levels configured for your profile</p>
                )}
              </div>

              {/* Step 2: Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Step 2: Select Subject *
                </Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => handleInputChange('subject', value)}
                  disabled={!formData.academic_level}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.academic_level ? "Select subject" : "Select academic level first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.academic_level && (
                  <p className="text-xs text-gray-500">Please select an academic level first</p>
                )}
                {formData.academic_level && availableSubjects.length === 0 && (
                  <p className="text-xs text-gray-500">Loading subjects...</p>
                )}
              </div>

              {/* Step 3: Student Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Step 3: Select Students * ({formData.selected_students.length} selected)
                </Label>
                
                {!formData.subject ? (
                  <p className="text-xs text-gray-500">Please select a subject first</p>
                ) : loadingStudents ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading students...
                  </div>
                ) : availableStudents.length === 0 ? (
                  <p className="text-xs text-red-500">No students found with active payment for this subject and academic level</p>
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
                          {console.log("student", student)}
                          <p className="text-xs text-gray-500 ml-2">Payment Status: {(student.payment_info.validity_status === 'active') ? (
                            <Badge variant="success">
                              Active
                            </Badge>
                          ) : (student.payment_info.validity_status === 'expired') ? (
                            <Badge variant="error">
                              Expired
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              Pending
                            </Badge>
                          )}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
  <Label htmlFor="due_date">Due Date</Label>
  <Input
    type="datetime-local"
    id="due_date"
    value={formData.due_date}
    className="w-full appearance-none"
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
                <Button type="submit" disabled={submitting}>
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
            {activeTab === 'all' ? `Your Assignments (${getFilteredAssignments().length})` : `Submitted Assignments (${getFilteredAssignments().length})`}
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
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        
        {activeTab === 'all' ? (
          // All Assignments View
          getFilteredAssignments().length === 0 ? (
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
              <p className="text-gray-600">No assignments created yet</p>
              <p className="text-sm text-gray-500">Create your first assignment to get started</p>
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
                      ? 'border-green-200' 
                      : 'border-orange-200' 
                    : 'border-gray-200'
                }>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                      <span className="text-medium font-medium">Title:</span>
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
                      <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-gray-600">{assignment.description}</p>
                      </div>
                    </div>
                      <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">
                      {formatDate(assignment.createdAt)}
                    </Badge>
                        {assignment.has_submission ? (
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={assignment.is_graded ? 'default' : 'secondary'}>
                              {assignment.is_graded ? 'Graded' : 'Submitted'}
                            </Badge>
                            {/* {assignment.grade && (
                              <Badge variant="outline" className="text-green-600">
                                Grade: {assignment.grade}/100
                              </Badge>
                            )} */}
                            {assignment.is_late && (
                              <Badge variant="destructive" className="text-xs">
                                Late Submission
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
                      <span className="text-sm font-medium">Student:</span>
                      <span className="text-sm">{assignment.student_id.user_id.full_name}</span>
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
                        <span className="text-sm">{formatDate(assignment.due_date)}</span>
                      </div>
                    )}
                      
                  </div>

                  {assignment.file_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">{assignment.file_name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                          onClick={() => window.open(assignment.file_url, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          )
        ) : (
          // Submitted Assignments View
          getFilteredAssignments().length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {getActiveFiltersCount() > 0 ? (
                  <>
                    <p className="text-gray-600">No submitted assignments match your filters</p>
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
                    <p className="text-gray-600">No submitted assignments yet</p>
                    <p className="text-sm text-gray-500">Students will submit their assignments here</p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getFilteredAssignments().map((assignment) => (
                <Card key={assignment._id} className={assignment.is_graded ? 'border-green-200' : 'border-orange-200'}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-medium font-medium">Title:</span>
                          <h4 className="text-lg font-semibold">{assignment.title}</h4>
                          {assignment.is_graded ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Description:</span>
                          <p className="text-gray-600">{assignment.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={assignment.is_graded ? 'default' : 'secondary'}>
                          {assignment.is_graded ? 'Graded' : 'Pending Evaluation'}
                        </Badge>
                        {assignment.grade && (
                          <Badge variant="outline" className="text-green-600">
                            Grade: {assignment.grade}/100
                          </Badge>
                        )}
                        {console.log("assignment", assignment)}
                        {assignment.is_late && (
                          <Badge variant="destructive" className="text-xs">
                            Late Submission
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Student:</span>
                        <span className="text-sm">{assignment.student_id.user_id.full_name}</span>
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
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Submitted:</span>
                        <span className="text-sm">{formatDate(assignment.submission_date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600">Student has submitted this assignment</span>
                      </div>
                      {/* <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>{} }
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Submission
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TutorAssignments;
