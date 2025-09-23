import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BASE_URL } from '@/config';
import { useToast } from '../components/ui/use-toast';
import { Calendar, Clock, CheckCircle2, AlertCircle, User, Mail } from 'lucide-react';

const PublicInterviewPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid interview link");
      setLoading(false);
      return;
    }
    loadInterviewData();
  }, [token]);

  const loadInterviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/public/interview/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load interview data');
      }
      
      setInterviewData(data.data);
    } catch (err) {
      console.error('Error loading interview data:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load interview data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectSlot = async (isoString) => {
    try {
      setSelecting(true);
      const response = await fetch(`${BASE_URL}/api/public/interview/${token}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_time: isoString })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to select slot');
      }
      
      toast({
        title: 'Success',
        description: 'Interview slot selected successfully!',
        variant: 'default'
      });
      
      // Reload data to show updated status
      await loadInterviewData();
    } catch (err) {
      console.error('Error selecting slot:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to select slot',
        variant: 'destructive'
      });
    } finally {
      setSelecting(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: { icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
      Scheduled: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
      Failed: { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-800' },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h2>
            <p className="text-gray-600 mb-4">Unable to load interview information.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { 
    tutor_name, 
    tutor_email, 
    preferred_interview_times, 
    interview_status, 
    scheduled_time,
    token_expires_at 
  } = interviewData;

  const isExpired = new Date(token_expires_at) < new Date();
  const hasSlots = preferred_interview_times && preferred_interview_times.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Calendar className="w-5 h-5" />
              <span>Interview Scheduling - Tutorby</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Tutor Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tutor Information</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{tutor_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4" />
                  <span>{tutor_email}</span>
                </div>
              </div>
            </div>

            {/* Token Expiration Warning */}
            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Link Expired</span>
                </div>
                <p className="text-red-700 mt-1">
                  This interview scheduling link has expired. Please contact support for assistance.
                </p>
              </div>
            )}

            {/* Interview Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Interview Status</h3>
                <StatusBadge status={interview_status} />
              </div>
              
              {scheduled_time && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Scheduled Time</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">
                      {new Date(scheduled_time).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    </span>
                    <span className="text-gray-500">
                      {new Date(scheduled_time).toLocaleTimeString(undefined, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Available Time Slots */}
            {!isExpired && (
              <>
                {!hasSlots ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No interview slots available yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Please wait for the admin to assign time slots.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Available Time Slots</h3>
                    <p className="text-sm text-gray-600">
                      Please select your preferred interview time from the available slots below:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {preferred_interview_times.map((time, idx) => {
                        const raw = typeof time === 'string' ? time : new Date(time).toISOString();
                        const isoZ = raw.endsWith('Z') ? raw : new Date(raw).toISOString();
                        const date = new Date(isoZ);
                        const isSelected = scheduled_time && new Date(scheduled_time).getTime() === date.getTime();
                        
                        return (
                          <Button
                            key={idx}
                            variant={isSelected ? 'default' : 'outline'}
                            disabled={Boolean(scheduled_time) || selecting || isExpired}
                            onClick={() => selectSlot(isoZ)}
                            className={`h-auto py-4 ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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
              </>
            )}

            {/* Success Message */}
            {scheduled_time && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Interview Scheduled Successfully!</span>
                </div>
                <p className="text-green-700 mt-1">
                  Your interview has been scheduled. You will receive further instructions via email.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicInterviewPage;
