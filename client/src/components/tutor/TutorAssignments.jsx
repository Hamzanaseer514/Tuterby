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
import {
  Plus,
  Upload,
  FileText,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Download,
  Eye
} from 'lucide-react';
import { createAssignment, getTutorAssignments, getPaidSubjectsAndLevels } from '../../services/assignmentService';

const TutorAssignments = () => {
  const { toast } = useToast();
  const { user, fetchWithAuth } = useAuth();
  const { academicLevels, subjects } = useSubject();
  
  const [assignments, setAssignments] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [paidSubjectsAndLevels, setPaidSubjectsAndLevels] = useState({
    paid_subjects: [],
    paid_academic_levels: [],
    subject_level_combinations: []
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    student_user_id: '',
    subject: '',
    academic_level: '',
    title: '',
    description: '',
    due_date: '',
    file: null
  });

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchAvailableStudents();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const data = await getTutorAssignments(user._id);
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

  const fetchAvailableStudents = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/tutor/students/${user._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If student changes, fetch their paid subjects/levels
      if (field === 'student_user_id' && value) {
        fetchPaidSubjectsAndLevels(value);
        // Reset subject and academic level when student changes
        newData.subject = '';
        newData.academic_level = '';
      }
      
      // If subject changes, filter academic levels
      if (field === 'subject' && value) {
        newData.academic_level = '';
      }
      
      return newData;
    });
  };

  const fetchPaidSubjectsAndLevels = async (studentUserId) => {
    try {
      const data = await getPaidSubjectsAndLevels(user._id, studentUserId);
      setPaidSubjectsAndLevels(data);
    } catch (error) {
      console.error('Failed to fetch paid subjects and levels:', error);
      setPaidSubjectsAndLevels({
        paid_subjects: [],
        paid_academic_levels: [],
        subject_level_combinations: []
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.student_user_id || !formData.subject || !formData.academic_level || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await createAssignment(user._id, formData);
      toast({
        title: "Success",
        description: "Assignment created successfully"
      });
      setFormData({
        student_user_id: '',
        subject: '',
        academic_level: '',
        title: '',
        description: '',
        due_date: '',
        file: null
      });
      setShowCreateForm(false);
      fetchAssignments();
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
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student">Student *</Label>
                  <Select 
                    value={formData.student_user_id} 
                    onValueChange={(value) => handleInputChange('student_user_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => handleInputChange('subject', value)}
                    disabled={!formData.student_user_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.student_user_id ? "Select subject" : "Select student first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {paidSubjectsAndLevels.paid_subjects?.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.student_user_id && (
                    <p className="text-xs text-gray-500 mt-1">Please select a student first to see available subjects</p>
                  )}
                  {formData.student_user_id && paidSubjectsAndLevels.paid_subjects?.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No paid subjects available for this student</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="academic_level">Academic Level *</Label>
                  <Select 
                    value={formData.academic_level} 
                    onValueChange={(value) => handleInputChange('academic_level', value)}
                    disabled={!formData.subject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.subject ? "Select level" : "Select subject first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {paidSubjectsAndLevels.subject_level_combinations
                        ?.filter(combo => combo.subject._id === formData.subject)
                        ?.map((combo) => (
                          <SelectItem key={combo.academic_level._id} value={combo.academic_level._id}>
                            {combo.academic_level.level}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {!formData.subject && (
                    <p className="text-xs text-gray-500 mt-1">Please select a subject first to see available levels</p>
                  )}
                  {formData.subject && paidSubjectsAndLevels.subject_level_combinations?.filter(combo => combo.subject._id === formData.subject).length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No paid academic levels available for this subject</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter assignment title"
                />
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
        <h3 className="text-lg font-semibold">Your Assignments ({assignments.length})</h3>
        
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No assignments created yet</p>
              <p className="text-sm text-gray-500">Create your first assignment to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                      <span className="text-medium font-medium">Title:</span>
                      <h4 className="text-lg font-semibold">{assignment.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-gray-600">{assignment.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {formatDate(assignment.createdAt)}
                    </Badge>
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
                        onClick={() => window.open(`${BASE_URL}${assignment.file_url}`, '_blank')}
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
        )}
      </div>
    </div>
  );
};

export default TutorAssignments;
