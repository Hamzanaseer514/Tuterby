import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useSubject } from '../../../hooks/useSubject';
import { useToast } from '../../ui/use-toast';
import { BASE_URL } from '@/config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  FileText,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Eye,
  Clock,
  Search,
  Filter,
  Download,
  X
} from 'lucide-react';

const AdminAssignments = () => {
  const { toast } = useToast();
  const { fetchWithAuth, user } = useAuth();
  const { academicLevels, subjects } = useSubject();
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user is admin before making API calls
    if (user && user.role === 'admin') {
      fetchAllAssignments();
      fetchAllSubmissions();
    } else {
      setLoading(false);
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page",
        variant: "destructive"
      });
    }
  }, [user]);

  const fetchAllAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${BASE_URL}/api/admin/assignments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      } else if (response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to access admin features",
          variant: "destructive"
        });
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      if (error.message === 'Refresh failed') {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch assignments",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubmissions = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/admin/assignment-submissions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else if (response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to access admin features",
          variant: "destructive"
        });
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      if (error.message === 'Refresh failed') {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive"
        });
      }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(sub => sub.assignment_id._id === assignmentId);
  };

  const getAssignmentStatus = (assignment) => {
    const submission = getSubmissionForAssignment(assignment._id);
    if (submission) {
      if (submission.status === 'graded') {
        return { status: 'graded', color: 'default', label: 'Graded' };
      }
      return { status: 'submitted', color: 'secondary', label: 'Submitted' };
    }
    
    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return { status: 'overdue', color: 'destructive', label: 'Overdue' };
    }
    
    return { status: 'pending', color: 'outline', label: 'Pending' };
  };

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedAssignment(null);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchQuery || 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.tutor_id?.user_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.student_id?.user_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      getAssignmentStatus(assignment).status === statusFilter;

    const matchesSubject = subjectFilter === 'all' || 
      assignment.subject._id === subjectFilter;

    const matchesLevel = levelFilter === 'all' || 
      assignment.academic_level._id === levelFilter;

    return matchesSearch && matchesStatus && matchesSubject && matchesLevel;
  });

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

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
          <p className="text-gray-600 mt-1">Monitor all assignments and submissions across the platform</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title, tutor, or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Subject" />
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

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Level" />
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
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No assignments found</p>
              <p className="text-sm text-gray-500">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => {
                    const status = getAssignmentStatus(assignment);
                    return (
                      <tr key={assignment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {assignment.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.tutor_id?.user_id?.full_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.student_id?.user_id?.full_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getSubjectName(assignment.subject._id)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getLevelName(assignment.academic_level._id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={status.color}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(assignment.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(assignment)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Details Modal */}
      {showDetails && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                  <p className="text-gray-600 mt-1">Assignment Details</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseDetails}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Assignment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Description:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedAssignment.description}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subject:</span>
                      <p className="text-sm text-gray-900">{getSubjectName(selectedAssignment.subject._id)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Academic Level:</span>
                      <p className="text-sm text-gray-900">{getLevelName(selectedAssignment.academic_level._id)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedAssignment.createdAt)}</p>
                    </div>
                    {selectedAssignment.due_date && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Due Date:</span>
                        <p className="text-sm text-gray-900">{formatDate(selectedAssignment.due_date)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Participants</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Tutor:</span>
                      <p className="text-sm text-gray-900">{selectedAssignment.tutor_id?.user_id?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{selectedAssignment.tutor_id?.user_id?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Student:</span>
                      <p className="text-sm text-gray-900">{selectedAssignment.student_id?.user_id?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{selectedAssignment.student_id?.user_id?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <div className="mt-1">
                        <Badge variant={getAssignmentStatus(selectedAssignment).color}>
                          {getAssignmentStatus(selectedAssignment).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment File */}
              {selectedAssignment.file_url && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Assignment File</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{selectedAssignment.file_name}</p>
                      <p className="text-xs text-gray-500">Assignment attachment</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedAssignment.file_url, '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View File
                    </Button>
                  </div>
                </div>
              )}

              {/* Student Submission */}
              {getSubmissionForAssignment(selectedAssignment._id) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Student Submission</h3>
                  {(() => {
                    const submission = getSubmissionForAssignment(selectedAssignment._id);
                    return (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={submission.is_late ? 'destructive' : 'secondary'}>
                            {submission.is_late ? 'Late Submission' : 'On Time'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Submitted: {formatDate(submission.submitted_at)}
                          </span>
                        </div>
                        
                        {submission.submission_text && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-500">Submission Text:</span>
                            <p className="text-sm text-gray-900 mt-1 p-2 bg-white rounded border">
                              {submission.submission_text}
                            </p>
                          </div>
                        )}
                        
                        {submission.submission_file_url && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded border">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{submission.submission_file_name}</p>
                              <p className="text-xs text-gray-500">Student submission file</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(submission.submission_file_url, '_blank')}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View File
                            </Button>
                          </div>
                        )}
                        
                        {submission.status === 'graded' && (
                          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-800">Grade:</span>
                              <span className="text-lg font-bold text-green-900">{submission.grade}/100</span>
                            </div>
                            {submission.feedback && (
                              <p className="text-sm text-green-700 mt-1">{submission.feedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCloseDetails}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;
