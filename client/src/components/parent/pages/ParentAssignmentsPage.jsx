import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Calendar, FileText, Clock, User, BookOpen, Info, Loader2 } from 'lucide-react';
import { useSubject } from '../../../hooks/useSubject';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';

const ParentAssignmentsPage = () => {
    const { user } = useAuth();
    const { getParentProfile } = useParent();
    const { subjects, academicLevels } = useSubject();

    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);

    useEffect(() => {
        const fetchChildren = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                const profile = await getParentProfile(user._id);
                const rawKids = profile?.children || profile?.students || [];
                // Parent API returns direct child user objects (not nested user_id)
                const kids = rawKids.filter(k => k?._id);
                setChildren(kids);
                // Initialize selection to first valid child id if available
                if (kids.length > 0) {
                    setSelectedChildId(kids[0]._id.toString());
                } else {
                    setSelectedChildId('');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, [user]);

    useEffect(() => {
        const fetchChildAssignments = async () => {
            if (!selectedChildId) {
                setAssignments([]);
                setSubmissions([]);
                return;
            }
            try {
                setLoadingAssignments(true);
                // Reuse existing student endpoints via services
                const mod = await import('../../../services/assignmentService');
                const { getStudentAssignments, getStudentSubmissions } = mod;
                const data = await getStudentAssignments(selectedChildId);
                setAssignments(Array.isArray(data) ? data : []);

                // Fetch submissions for this child
                const submissionsData = await getStudentSubmissions(selectedChildId);
                setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
            } catch (e) {
                setAssignments([]);
                setSubmissions([]);
            } finally {
                setLoadingAssignments(false);
            }
        };
        fetchChildAssignments();
    }, [selectedChildId]);

    const getSubjectName = (subjectId) => subjects?.find(s => s._id === subjectId)?.name || 'Subject';
    const getLevelName = (levelId) => academicLevels?.find(l => l._id === levelId)?.level || 'Level';
    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const formatDateTime = (date) => new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });

    const getSubmissionForAssignment = (assignmentId) => {
        return submissions.find(sub => sub?.assignment_id?._id === assignmentId);
    };

    // Due status helpers (match StudentAssignments logic)
    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const getDueDateStatus = (dueDate, assignment) => {
        if (!dueDate || !assignment) return null;

        const now = new Date();
        const due = new Date(dueDate);
        const diffHours = (due - now) / (1000 * 60 * 60);

        const submission = getSubmissionForAssignment(assignment._id);
        if (submission) {
            if (submission.status === 'graded') {
                return { status: 'graded', color: 'default' };
            }
            return { status: 'submitted', color: 'secondary' };
        }

        if (diffHours < 0) return { status: 'missing', color: 'destructive' };
        if (diffHours < 24) return { status: 'due-soon', color: 'secondary' };
        return { status: 'upcoming', color: 'default' };
    };

    const renderDetails = (assignment) => {
        const submission = getSubmissionForAssignment(assignment._id);
        const dueStatus = getDueDateStatus(assignment.due_date, assignment);
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Tutor:</span>
                        <span>{assignment.tutor_id?.user_id?.full_name || 'Unknown Tutor'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Subject:</span>
                        <span>{getSubjectName(assignment.subject?._id)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Level:</span>
                        <span>{getLevelName(assignment.academic_level?._id)}</span>
                    </div>
                    {assignment.due_date && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Due:</span>
                            <span>{formatDateTime(assignment.due_date)}</span>
                        </div>
                    )}
                </div>

                {assignment.file_url ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{assignment.file_name}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => window.open(assignment.file_url, '_blank')}>
                            <Info className="h-3 w-3 mr-1" />
                            View File
                        </Button>
                    </div>
                ) : (
                    <div className="text-xs text-gray-500">No file attached</div>
                )}

                {(() => {
                    const s = submission;
                    if (!s) return (
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            No submission yet
                        </div>
                    );
                    return (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                            <div className="flex  gap-2">

                                {dueStatus && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant={dueStatus.color}>
                                            {dueStatus.status === 'missing' && 'Missing Assignment'}
                                            {dueStatus.status === 'due-soon' && 'Due Soon'}
                                            {dueStatus.status === 'upcoming' && 'Upcoming'}
                                            {dueStatus.status === 'submitted' && 'Submitted'}
                                            {dueStatus.status === 'graded' && 'Graded'}
                                        </Badge>
                                    </div>
                                )}
                                <Badge variant={s.is_late ? 'destructive' : 'default'}>
                                    {s.is_late ? 'Late Submission' : 'On Time'}
                                </Badge>
                                </div>
                                <span className="text-xs text-gray-500">Submitted: {formatDateTime(s.submitted_at)}</span>
                            </div>

                            {s.submission_text && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm font-medium">Submission Text:</span>
                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                                            {s.submission_text}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {s.submission_file_url && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs sm:text-sm">{s.submission_file_name}</span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => window.open(s.submission_file_url, '_blank')}>
                                        <Info className="h-3 w-3 mr-1" />
                                        View Submission
                                    </Button>
                                </div>
                            )}

                            {s.status === 'graded' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Grade:</span>
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{s.grade}/100</span>
                                    </div>
                                    {s.feedback && (
                                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Feedback: </span>
                                            <span>{s.feedback}</span>
                                        </div>
                                    )}
                                    {s.graded_at && (
                                        <div className="text-xs text-gray-500 mt-1">Graded: {formatDateTime(s.graded_at)}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">View your children's assignments</p>
                    </div>
                    <div className="w-full sm:w-72">
                        <Select value={selectedChildId || undefined} onValueChange={setSelectedChildId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select child" />
                            </SelectTrigger>
                            <SelectContent>
                                {children
                                    .filter(c => c?._id)
                                    .map((c) => {
                                        const id = c._id.toString();
                                        return (
                                            <SelectItem key={id} value={id}>
                                                {c?.full_name || 'Child'}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        {loadingAssignments ? 'Loading...' : `Assignments (${assignments.length})`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                    {loading || loadingAssignments ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Fetching assignments...</p>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">No assignments yet</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Assignments will appear once tutors share work.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {assignments.map((assignment) => {
                                const submission = getSubmissionForAssignment(assignment._id);
                                const dueStatus = getDueDateStatus(assignment.due_date, assignment);
                                return (
                                    <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">Title:</span>
                                                        <h4 className="text-base sm:text-lg font-semibold truncate">{assignment.title}</h4>
                                                    </div>
                                                    {assignment.description && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium">Description:</span>
                                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{assignment.description}</p>
                                                        </div>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                                        <span>Subject: <span className="font-medium">{getSubjectName(assignment.subject?._id)}</span></span>
                                                        <span>Level: <span className="font-medium">{getLevelName(assignment.academic_level?._id)}</span></span>
                                                        {assignment.due_date && (
                                                            <span>Due: <span className="font-medium">{formatDateTime(assignment.due_date)}</span></span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant="secondary">Created: {formatDate(assignment.createdAt)}</Badge>
                                                    <div className="flex  gap-2">

                                                        {dueStatus && (
                                                            <Badge variant={dueStatus.color}>
                                                                {dueStatus.status === 'missing' && 'Missing Assignment'}
                                                                {dueStatus.status === 'due-soon' && 'Due Soon'}
                                                                {dueStatus.status === 'upcoming' && 'Upcoming'}
                                                                {dueStatus.status === 'submitted' && 'Submitted'}
                                                                {dueStatus.status === 'graded' && 'Graded'}
                                                            </Badge>
                                                        )}

                                                        {submission && (
                                                            <Badge variant={submission.is_late ? 'destructive' : 'default'}>
                                                                {submission.status === 'graded' ? `Graded: ${submission.grade}/100` : submission.is_late ? 'Late Submission' : 'Submitted'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => { setCurrentAssignment(assignment); setShowDetailsModal(true); }}
                                                >
                                                    <Info className="h-3 w-3 mr-1" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Assignment Details</DialogTitle>
                    </DialogHeader>
                    {currentAssignment && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentAssignment.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{currentAssignment.description}</p>
                                <div className="mt-2 text-xs text-gray-500">Created: {formatDate(currentAssignment.createdAt)}</div>
                            </div>
                            {renderDetails(currentAssignment)}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ParentAssignmentsPage;


