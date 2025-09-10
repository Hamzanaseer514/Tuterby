import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../ui/use-toast';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Check,
  AlertCircle,
  Settings,
  CalendarDays,
  ArrowLeft
} from 'lucide-react';

const AvailabilityCalendar = () => {
  const { user , getAuthToken , fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showGeneralSettingsModal, setShowGeneralSettingsModal] = useState(false);
  // const [showRecurringModal, setShowRecurringModal] = useState(false);
  // const [showOneTimeModal, setShowOneTimeModal] = useState(false);
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingBlackout, setEditingBlackout] = useState(null);
  const token = getAuthToken();
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    general_availability: {
      monday: { start: "09:00", end: "17:00", available: true },
      tuesday: { start: "09:00", end: "17:00", available: true },
      wednesday: { start: "09:00", end: "17:00", available: true },
      thursday: { start: "09:00", end: "17:00", available: true },
      friday: { start: "09:00", end: "17:00", available: true },
      saturday: { start: "09:00", end: "17:00", available: false },
      sunday: { start: "09:00", end: "17:00", available: false }
    },
    minimum_notice_hours: 2,
    maximum_advance_days: 30,
    session_durations: [30, 60, 90, 120],
    is_accepting_bookings: true
  });
  
  // const [recurringForm, setRecurringForm] = useState({
  //   day_of_week: 1,
  //   start_time: "09:00",
  //   end_time: "10:00"
  // });
  
  // const [oneTimeForm, setOneTimeForm] = useState({
  //   date: "",
  //   start_time: "09:00",
  //   end_time: "10:00"
  // });
  
  const [blackoutForm, setBlackoutForm] = useState({
    start_date: "",
    end_date: "",
    reason: ""
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(`${BASE_URL}/api/tutor/availability/${user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      const data = await response.json();
      setAvailability(data);
      setGeneralSettings({
        general_availability: data.general_availability,
        minimum_notice_hours: data.minimum_notice_hours,
        maximum_advance_days: data.maximum_advance_days,
        session_durations: data.session_durations,
        is_accepting_bookings: data.is_accepting_bookings
      });
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/tutor/availability/${user._id}/general`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettings)
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to update general settings');
      }

      setShowGeneralSettingsModal(false);
      fetchAvailability();
      toast({
        title: "Success!",
        description: "General availability settings updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update settings: " + err.message,
        variant: "destructive",
      });
    }
  };

 

  const handleBlackoutSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBlackout 
        ? `${BASE_URL}/api/tutor/availability/${user._id}/blackout/${editingBlackout._id}`
        : `${BASE_URL}/api/tutor/availability/${user._id}/blackout`;
      
      const method = editingBlackout ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blackoutForm)
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to save blackout date');
      }

      setShowBlackoutModal(false);
      setEditingBlackout(null);
      setBlackoutForm({ start_date: "", end_date: "", reason: "" });
      fetchAvailability();
      toast({
        title: "Success!",
        description: `Blackout date ${editingBlackout ? 'updated' : 'added'} successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save blackout date: " + err.message,
        variant: "destructive",
      });
    }
  };



  const openEditBlackout = (blackout) => {
    setEditingBlackout(blackout);
    setBlackoutForm({
      start_date: new Date(blackout.start_date).toISOString().slice(0, 10),
      end_date: new Date(blackout.end_date).toISOString().slice(0, 10),
      reason: blackout.reason
    });
    setShowBlackoutModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Availability</h2>
  //         <p className="text-gray-600 mb-4">{error}</p>
  //         <Button onClick={fetchAvailability}>Try Again</Button>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!availability) return null;
  const {
    general_availability = {},
    blackout_dates = [],   // was blackout_slots
    recurring_slots = [],
    one_time_slots = [],
  } = availability || {};
  
  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Availability Management</h1>
              <p className="text-gray-600">Manage your teaching schedule and availability</p>
            </div>
            <Button 
              variant="outline"
                onClick={() => navigate(`/tutor-dashboard`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>

        {/* General Settings Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Availability Settings
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowGeneralSettingsModal(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Settings
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Accepting Bookings</p>
                <p className="text-lg font-semibold">
                  {availability && availability.is_accepting_bookings ? (
                    <span className="text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      No
                    </span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Minimum Notice</p>
                <p className="text-lg font-semibold">{availability?.minimum_notice_hours ?? "NA"} hours</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Max Advance Booking</p>
                <p className="text-lg font-semibold">{availability?.maximum_advance_days ?? "NA"} days</p>
                </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Session Durations</p>
                <p className="text-sm font-semibold">
                  {availability?.session_durations.map(d => `${d}min`).join(', ') ?? "NA"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {dayNames.map((day, index) => {
                const dayKey = day.toLowerCase();
                const daySettings = availability?.general_availability[dayKey] ?? "NA";
                return (
                  <div key={day} className="p-4 border rounded-lg">
                    <h3 className="font-medium text-sm mb-2">{day}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <Checkbox 
                          checked={daySettings.available}
                          disabled
                        />
                        <span className="text-xs text-gray-600">Available</span>
                      </div>
                      {daySettings.available && (
                        <div className="text-xs text-gray-600">
                          <p>{daySettings.start} - {daySettings.end}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

  

        {/* Blackout Dates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <X className="h-5 w-5 mr-2" />
                Blackout Dates
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingBlackout(null);
                  setBlackoutForm({ start_date: "", end_date: "", reason: "" });
                  setShowBlackoutModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Blackout Date
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {  availability && availability.blackout_dates.length > 0 ? (
              <div className="space-y-3">
                {availability.blackout_dates.map((blackout) => (
                  <div key={blackout._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {formatDate(blackout.start_date)} - {formatDate(blackout.end_date)}
                      </p>
                      {blackout.reason && (
                        <p className="text-xs text-gray-600">{blackout.reason}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditBlackout(blackout)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteBlackout(blackout._id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No blackout dates set</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* General Settings Modal */}
      {showGeneralSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">General Availability Settings</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowGeneralSettingsModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleGeneralSettingsUpdate} className="space-y-6">
              {/* Accepting Bookings */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="accepting_bookings"
                  checked={generalSettings.is_accepting_bookings}
                  onCheckedChange={(checked) => 
                    setGeneralSettings({...generalSettings, is_accepting_bookings: checked})
                  }
                />
                <Label htmlFor="accepting_bookings">Accepting new bookings</Label>
              </div>

              {/* Notice Period */}
              <div>
                <Label htmlFor="minimum_notice">Minimum Notice Period (hours)</Label>
                <Input
                  id="minimum_notice"
                  type="number"
                  min="0"
                  value={generalSettings.minimum_notice_hours}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings, 
                    minimum_notice_hours: parseInt(e.target.value)
                  })}
                />
              </div>

              {/* Advance Booking */}
              <div>
                <Label htmlFor="maximum_advance">Maximum Advance Booking (days)</Label>
                <Input
                  id="maximum_advance"
                  type="number"
                  min="1"
                  value={generalSettings.maximum_advance_days}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings, 
                    maximum_advance_days: parseInt(e.target.value)
                  })}
                />
              </div>

              {/* Session Durations */}
              <div>
                <Label>Session Duration Options (minutes)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[15, 30, 45, 60, 90, 120, 180, 240].map((duration) => (
                    <div key={duration} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`duration_${duration}`}
                        checked={generalSettings.session_durations.includes(duration)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setGeneralSettings({
                              ...generalSettings,
                              session_durations: [...generalSettings.session_durations, duration].sort((a, b) => a - b)
                            });
                          } else {
                            setGeneralSettings({
                              ...generalSettings,
                              session_durations: generalSettings.session_durations.filter(d => d !== duration)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`duration_${duration}`}>{duration} minutes</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Schedule */}
              <div>
                <Label>Weekly Schedule</Label>
                <div className="space-y-3 mt-2">
                  {dayNames.map((day, index) => {
                    const dayKey = day.toLowerCase();
                    const daySettings = generalSettings?.general_availability[dayKey] ?? "NA";
                    return (
                      <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2 w-24">
                          <Checkbox 
                            id={`available_${dayKey}`}
                            checked={daySettings.available}
                            onCheckedChange={(checked) => 
                              setGeneralSettings({
                                ...generalSettings,
                                general_availability: {
                                  ...generalSettings.general_availability,
                                  [dayKey]: { ...daySettings, available: checked }
                                }
                              })
                            }
                          />
                          <Label htmlFor={`available_${dayKey}`}>{day}</Label>
                        </div>
                        {daySettings.available && (
                          <div className="flex items-center space-x-4">
                            <Input
                              type="time"
                              value={daySettings.start}
                              onChange={(e) => 
                                setGeneralSettings({
                                  ...generalSettings,
                                  general_availability: {
                                    ...generalSettings.general_availability,
                                    [dayKey]: { ...daySettings, start: e.target.value }
                                  }
                                })
                              }
                              className="w-28 pl-2"
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              value={daySettings.end}
                              onChange={(e) => 
                                setGeneralSettings({
                                  ...generalSettings,
                                  general_availability: {
                                    ...generalSettings.general_availability,
                                    [dayKey]: { ...daySettings, end: e.target.value }
                                  }
                                })
                              }
                              className="w-28 pl-2"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowGeneralSettingsModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

     

      {/* Blackout Date Modal */}
      {showBlackoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingBlackout ? 'Edit' : 'Add'} Blackout Date
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowBlackoutModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleBlackoutSubmit} className="space-y-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={blackoutForm.start_date}
                  onChange={(e) => setBlackoutForm({...blackoutForm, start_date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={blackoutForm.end_date}
                  onChange={(e) => setBlackoutForm({...blackoutForm, end_date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={blackoutForm.reason}
                  onChange={(e) => setBlackoutForm({...blackoutForm, reason: e.target.value})}
                  rows={3}
                  placeholder="e.g., Vacation, Holiday, Personal time..."
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowBlackoutModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBlackout ? 'Update' : 'Add'} Blackout
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar; 