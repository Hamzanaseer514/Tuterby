import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { BASE_URL } from '@/config';
import { useSubject } from '../../hooks/useSubject';
import { Loader2 } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { User } from 'lucide-react';

const API_BASE_URL = `${BASE_URL}/api/tutor`;

const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const res = await fetchWithAuth(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  }, token, (newToken) => localStorage.setItem("authToken", newToken));
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json();
};

const StudentCard = ({ student, onRespond, loadingId }) => {
  const user = student.user_id || {};
  const hire = student.hire_for_this_tutor || { status: 'pending' };
  const { academicLevels, subjects } = useSubject();
  const academic_level_name = academicLevels.find(s => s._id === hire.academic_level_id)?.level;
  const student_academic_level_name = academicLevels.find(s => s._id === student.academic_level)?.level;

  const getSubjectById = useCallback((id) => {
    if (!id) return undefined;
    const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
    return s;
  }, [subjects]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Header with avatar and name */}
          <div className="flex items-center gap-3">
            {user.photo_url ? (
              <img
                src={`${BASE_URL}${user.photo_url}`}
                alt={user.full_name || "Student"}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
              />
            ) : (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <div className="h-full w-full bg-blue-100 flex items-center justify-center rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">{user.full_name}</h3>
              <div className="mt-1">
                {hire.status === 'accepted' && (
                  <Badge variant="success" className="text-xs">Accepted</Badge>
                )}
                {hire.status === 'rejected' && (
                  <Badge variant="destructive" className="text-xs">Rejected</Badge>
                )}
                {(!hire.status || hire.status === 'pending') && (
                  <Badge variant="secondary" className="text-xs">Pending</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Student details */}
          <div className="space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">Academic level: </span>
              {student_academic_level_name || 'N/A'}
            </div>
            
            {Array.isArray(student.preferred_subjects) && student.preferred_subjects.length > 0 ? (
              <div>
                <span className="font-medium">Interests: </span>
                  {student.preferred_subjects.slice(0, 5).map(subject => getSubjectById(subject)?.name || subject).join(', ')}
              </div>
            ) : (
              <div>
                <span className="font-medium">Interests: </span>N/A
              </div>
            )}

            <div>
              <span className="font-medium">Requested For: </span>
              {academic_level_name} - {getSubjectById(hire.subject)?.name || hire.subject}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {(hire.status === 'accepted' || hire.status === 'pending') && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 p-2"
                onClick={() => onRespond(student._id, 'reject')}
                disabled={loadingId === student._id}
              >
                {loadingId === student._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
              </Button>
            )}
            {(hire.status === 'rejected' || hire.status === 'pending') && (
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 p-2"
                onClick={() => onRespond(student._id, 'accept')}
                disabled={loadingId === student._id}
              >
                {loadingId === student._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StudentHireRequests = () => {
  const { user, getAuthToken, fetchWithAuth } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [status, setStatus] = useState('all');
  const [respondingId, setRespondingId] = useState(null);
  const token = getAuthToken();

  const fetchRequests = async () => {
    if (!user?._id) return;
    setError('');
    if (!requests.length) {
      setLoading(true);
    }

    try {
      const query = new URLSearchParams();
      if (status) query.set('status', status);
      const res = await fetchWithAuth(`${API_BASE_URL}/hire-requests/${user._id}?${query.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        },
        token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      const data = await res.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (e) {
      setError(e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, status]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = requests;
    if (term) {
      list = list.filter((r) => {
        const u = r.user_id || {};
        return (
          (u.full_name || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term) ||
          (r.academic_level || '').toLowerCase().includes(term)
        );
      });
    }
    if (sortBy === 'name') {
      list = [...list].sort((a, b) => (a.user_id?.full_name || '').localeCompare(b.user_id?.full_name || ''));
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [requests, search, sortBy]);

  const handleRespond = async (studentProfileId, action) => {
    if (!user?._id) return;
    setRespondingId(studentProfileId);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/hire-requests/${user._id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_profile_id: studentProfileId, action }),
      }, token, (newToken) => localStorage.setItem("authToken", newToken));
      toast({ title: `Request ${action}ed` });
      await res.json();
      await fetchRequests();
    } catch (e) {
      toast({ title: 'Action failed', description: e.message, variant: 'destructive' });
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Student Requests</h2>
          <p className="text-sm text-gray-600 mt-1">Review and respond to students who want your help in their studies.</p>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
          <div className="flex-1">
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={fetchRequests} className="hidden sm:flex">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {loading && requests.length === 0 && (
        <div className="py-16 text-center text-gray-500">Loading requests...</div>
      )}
      
      {!loading && error && (
        <div className="py-6 text-center text-red-600 text-sm">{error}</div>
      )}
      
      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          {search || status !== 'all' ? 'No matching requests found.' : 'No help requests found.'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((student) => (
          <StudentCard
            key={student._id}
            student={student}
            onRespond={handleRespond}
            loadingId={respondingId}
          />
        ))}
      </div>
      
      {loading && requests.length > 0 && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default StudentHireRequests;