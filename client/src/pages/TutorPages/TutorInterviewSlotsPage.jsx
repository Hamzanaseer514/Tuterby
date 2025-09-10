import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { useToast } from '../../components/ui/use-toast';
import { RefreshCw, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const TutorInterviewSlotsPage = () => {
  const { user, getAuthToken , fetchWithAuth } = useAuth();
  const token = getAuthToken();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState('Pending');
  const [scheduled, setScheduled] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [again, setAgain] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    loadSlots();
  }, [user]);

  async function loadSlots() {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${BASE_URL}/api/tutor/interview-slots/${user._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }, token, (newToken) => localStorage.setItem("authToken", newToken));
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load');
      setSlots(json.data.preferred_interview_times || []);
      setStatus(json.data.interview_status || 'Pending');
      setScheduled(json.data.scheduled_time || null);
      setAgain(Boolean(json.data.again_interview));
    } catch (e) {
      // toast({ title: 'Error', description: e.message || 'Failed to load slots', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function requestAgain() {
    try {
      setRequesting(true);
      const res = await fetchWithAuth(`${BASE_URL}/api/tutor/interview-slots/${user._id}/request-again`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, token, (newToken) => localStorage.setItem("authToken", newToken));
      const json = await res.json();
      if (res.status !== 200 || !json.success) throw new Error(json.message || 'Failed to request again');
      toast({ title: 'Requested', description: 'Re-interview requested successfully' });
      await loadSlots();
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to request again', variant: 'destructive' });
    } finally {
      setRequesting(false);
    }
  }

  async function selectSlot(isoString) {
    try {
      setSelecting(true);
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/tutors/interview/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user._id, scheduled_time: isoString })
      }, token, (newToken) => localStorage.setItem("authToken", newToken));
      const json = await res.json();
      if (res.status !== 200) throw new Error(json.message || 'Failed to select slot');
      toast({ title: 'Scheduled', description: 'Interview slot selected successfully' });
      await loadSlots();
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to select slot', variant: 'destructive' });
    } finally {
      setSelecting(false);
    }
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: { icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
      Scheduled: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
      Failed: { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-800' },
      Completed: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status] || { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Interview Scheduling</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSlots}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Interview Status</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
              </div>
            </div>
            
            {scheduled && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Scheduled Time</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">
                    {new Date(scheduled).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                  </span>
                  <span className="text-gray-500">
                    {new Date(scheduled).toLocaleTimeString(undefined, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
            
            {status === 'Failed' && !again && (
              <Button 
                variant="outline" 
                onClick={requestAgain}
                disabled={requesting}
                className="ml-auto"
              >
                {requesting ? 'Requesting...' : 'Request New Interview'}
              </Button>
            )}
            
            {status === 'Failed' && again && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Re-interview requested. Waiting for admin.</span>
              </div>
            )}
          </div>

          {(!slots || slots.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No interview slots available yet.</p>
              <p className="text-sm text-gray-400 mt-1">Please wait for the admin to assign time slots.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Available Time Slots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {slots.map((s, idx) => {
                  const raw = typeof s === 'string' ? s : new Date(s).toISOString();
                  const isoZ = raw.endsWith('Z') ? raw : new Date(raw).toISOString();
                  const date = new Date(isoZ);
                  const isSelected = scheduled && new Date(scheduled).getTime() === date.getTime();
                  
                  return (
                    <Button
                      key={idx}
                      variant={isSelected ? 'default' : 'outline'}
                      disabled={Boolean(scheduled) || selecting}
                      onClick={() => selectSlot(isoZ)}
                      className={`h-auto py-3 ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      <div className="flex flex-col items-center w-full">
                        <span className="font-medium">
                          {date.toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-sm font-normal mt-1">
                          {date.toLocaleTimeString(undefined, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isSelected && (
                          <span className="text-xs mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Selected
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorInterviewSlotsPage;