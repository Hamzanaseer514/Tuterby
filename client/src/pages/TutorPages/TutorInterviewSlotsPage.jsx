import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { useToast } from '../../components/ui/use-toast';
import { RefreshCw, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const TutorInterviewSlotsPage = () => {
  const { user, getAuthToken, fetchWithAuth } = useAuth();
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
      // Error handling
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
      Pending: { icon: <Clock className="w-3 h-3 md:w-4 md:h-4" />, color: 'bg-yellow-100 text-yellow-800' },
      Scheduled: { icon: <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />, color: 'bg-green-100 text-green-800' },
      Failed: { icon: <XCircle className="w-3 h-3 md:w-4 md:h-4" />, color: 'bg-red-100 text-red-800' },
      Completed: { icon: <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status] || { icon: <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium ${config.color}`}>
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
    <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-4xl">
      <Card className="border shadow-sm">
        <CardHeader className="border-b p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Interview Scheduling</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSlots}
              disabled={loading}
              className="self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-1 md:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Status Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Interview Status</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
              </div>
            </div>
            
            {scheduled && (
              <div className="space-y-1">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Scheduled Time</h3>
                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs md:text-sm">
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
                className="mt-2 sm:mt-0 sm:ml-auto text-xs md:text-sm py-1 h-8"
              >
                {requesting ? 'Requesting...' : 'Request New Interview'}
              </Button>
            )}
            
            {status === 'Failed' && again && (
              <div className="text-xs md:text-sm text-gray-600 flex items-center gap-2 mt-2 sm:mt-0">
                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span>Re-interview requested. Waiting for admin.</span>
              </div>
            )}
          </div>

          {/* Slots Section */}
          {(!slots || slots.length === 0) ? (
            <div className="text-center py-6 md:py-8">
              <p className="text-gray-500 text-sm md:text-base">No interview slots available yet.</p>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Please wait for the admin to assign time slots.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base font-medium text-gray-700">Available Time Slots</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
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
                      className={`h-auto py-2 md:py-3 ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''} text-xs md:text-sm`}
                    >
                      <div className="flex flex-col items-center w-full">
                        <span className="font-medium">
                          {date.toLocaleDateString(undefined, { 
                            timeZone: 'UTC', 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="font-normal mt-1">
                          {date.toLocaleTimeString(undefined, { 
                            timeZone: 'UTC', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {isSelected && (
                          <span className="mt-1 flex items-center gap-1 text-xs">
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