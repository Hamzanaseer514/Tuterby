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


const API_BASE_URL = `${BASE_URL}/api/tutor`;

const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const res = await fetchWithAuth(url, {
    headers: {
      'Content-Type': 'application/json',
      // ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // ...(options.headers || {}),
    },
    // ...options,
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
    <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={`${BASE_URL}${user.photo_url}`}
              alt={user.full_name || 'Student'}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <div className="text-lg font-semibold text-gray-900">{user.full_name}</div>
              {/* <div className="text-sm text-gray-600">{user.email}</div> */}
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Academic level: </span>
                {student_academic_level_name || 'N/A'}
              </div>
              {Array.isArray(student.preferred_subjects) && student.preferred_subjects.length > 0 && (
                <div className="mt-1 text-sm text-gray-700">
                  <span className="font-semibold">Interests: </span>
                  {student.preferred_subjects.slice(0, 5).map(subject => getSubjectById(subject)?.name || subject).join(', ')}
                  {/* {getSubjectById(student.preferred_subjects.slice(0, 5)).join(', ')} */}
                </div>
              )}

              <div className="mt-2 text-sm text-gray-700"> <span className="font-semibold">Requested For:</span>  {academic_level_name}- {getSubjectById(hire.subject)?.name || hire.subject}</div>
              <div className="mt-2">
                {hire.status === 'accepted' && (
                  <Badge variant="success">Accepted</Badge>
                )}
                {hire.status === 'rejected' && (
                  <Badge variant="destructive">Rejected</Badge>
                )}
                {(!hire.status || hire.status === 'pending') && (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              // disabled={loadingId === student._id || hire.status !== 'pending'}
              onClick={() => onRespond(student._id, 'reject')}
            >
              {loadingId === student._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              // disabled={loadingId === student._id || hire.status !== 'pending'}
              onClick={() => onRespond(student._id, 'accept')}
            >
              {loadingId === student._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept'}
            </Button>
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
  const [status, setStatus] = useState('all'); // all | pending | accepted | rejected
  const [respondingId, setRespondingId] = useState(null);
  const token = getAuthToken();

  const fetchRequests = async () => {
    if (!user?._id) return;
    setError('');
    if (!requests.length) {
      setLoading(true); // only show full "loading" if first time
    }

    try {
      const query = new URLSearchParams();
      if (status) query.set('status', status);
      const res = await fetchWithAuth(`${API_BASE_URL}/hire-requests/${user._id}?${query.toString()}`,
        { method: 'GET' ,
        headers: { 'Content-Type': 'application/json'
        },
      },
        token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      const data = await res.json();
      // const data = await authFetch(`${API_BASE_URL}/hire-requests/${user._id}?${query.toString()}`);
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
      // newest first by createdAt
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Student Requests</h2>
          <p className="text-sm text-gray-600 mt-1">Review and respond to students who want to your help in their studies.</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* <Input
            placeholder="Search by name, email or level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          /> */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchRequests}>Refresh</Button>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center text-gray-500">Loading requests...</div>
      )}
      {/* {!loading && error && (
        <div className="py-6 text-center text-red-600">{error}</div>
      )} */}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-24 text-center text-gray-500">No help requests found.</div>
      )}

      {loading && requests.length > 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((student) => (
          <StudentCard
            key={student._id}
            student={student}
            onRespond={handleRespond}
            loadingId={respondingId}
          />)
        )}
      </div>
    </div>
  );
};

export default StudentHireRequests;

