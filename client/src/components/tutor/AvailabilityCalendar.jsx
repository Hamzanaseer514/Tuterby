import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AvailabilityCalendar = ({ tutorId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showGeneralSettingsModal, setShowGeneralSettingsModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showOneTimeModal, setShowOneTimeModal] = useState(false);
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingBlackout, setEditingBlackout] = useState(null);
  
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
  
  const [recurringForm, setRecurringForm] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "10:00"
  });
  
  const [oneTimeForm, setOneTimeForm] = useState({
    date: "",
    start_time: "09:00",
    end_time: "10:00"
  });
  
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
    if (tutorId) {
      fetchAvailability();
    }
  }, [tutorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/tutor/availability/${tutorId}`);
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
      const response = await fetch(`http://localhost:5000/api/tutor/availability/${tutorId}/general`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettings)
      });

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

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSlot 
        ? `http://localhost:5000/api/tutor/availability/${tutorId}/recurring/${editingSlot._id}`
        : `http://localhost:5000/api/tutor/availability/${tutorId}/recurring`;
      
      const method = editingSlot ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recurringForm)
      });

      if (!response.ok) {
        throw new Error('Failed to save recurring slot');
      }

      setShowRecurringModal(false);
      setEditingSlot(null);
      setRecurringForm({ day_of_week: 1, start_time: "09:00", end_time: "10:00" });
      fetchAvailability();
      toast({
        title: "Success!",
        description: `Recurring slot ${editingSlot ? 'updated' : 'added'} successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save recurring slot: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleOneTimeSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSlot 
        ? `http://localhost:5000/api/tutor/availability/${tutorId}/one-time/${editingSlot._id}`
        : `http://localhost:5000/api/tutor/availability/${tutorId}/one-time`;
      
      const method = editingSlot ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oneTimeForm)
      });

      if (!response.ok) {
        throw new Error('Failed to save one-time slot');
      }

      setShowOneTimeModal(false);
      setEditingSlot(null);
      setOneTimeForm({ date: "", start_time: "09:00", end_time: "10:00" });
      fetchAvailability();
      toast({
        title: "Success!",
        description: `One-time slot ${editingSlot ? 'updated' : 'added'} successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save one-time slot: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleBlackoutSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBlackout 
        ? `http://localhost:5000/api/tutor/availability/${tutorId}/blackout/${editingBlackout._id}`
        : `http://localhost:5000/api/tutor/availability/${tutorId}/blackout`;
      
      const method = editingBlackout ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blackoutForm)
      });

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

  const handleDeleteRecurring = async (slotId) => {
    if (!confirm('Are you sure you want to delete this recurring slot?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/tutor/availability/${tutorId}/recurring/${slotId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete recurring slot');
      }

      fetchAvailability();
      toast({
        title: "Success!",
        description: "Recurring slot deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete recurring slot: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteOneTime = async (slotId) => {
    if (!confirm('Are you sure you want to delete this one-time slot?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/tutor/availability/${tutorId}/one-time/${slotId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete one-time slot');
      }

      fetchAvailability();
      toast({
        title: "Success!",
        description: "One-time slot deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete one-time slot: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteBlackout = async (blackoutId) => {
    if (!confirm('Are you sure you want to delete this blackout date?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/tutor/availability/${tutorId}/blackout/${blackoutId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete blackout date');
      }

      fetchAvailability();
      toast({
        title: "Success!",
        description: "Blackout date deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete blackout date: " + err.message,
        variant: "destructive",
      });
    }
  };

  const openEditRecurring = (slot) => {
    setEditingSlot(slot);
    setRecurringForm({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time
    });
    setShowRecurringModal(true);
  };

  const openEditOneTime = (slot) => {
    setEditingSlot(slot);
    setOneTimeForm({
      date: new Date(slot.date).toISOString().slice(0, 16),
      start_time: slot.start_time,
      end_time: slot.end_time
    });
    setShowOneTimeModal(true);
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Availability</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAvailability}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!availability) return null;

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
              onClick={() => navigate(`/tutor-dashboard/${tutorId}`)}
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
                  {availability.is_accepting_bookings ? (
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
                <p className="text-lg font-semibold">{availability.minimum_notice_hours} hours</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Max Advance Booking</p>
                <p className="text-lg font-semibold">{availability.maximum_advance_days} days</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Session Durations</p>
                <p className="text-sm font-semibold">
                  {availability.session_durations.map(d => `${d}min`).join(', ')}
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
                const daySettings = availability.general_availability[dayKey];
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

        {/* Recurring Availability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recurring Availability Slots
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingSlot(null);
                  setRecurringForm({ day_of_week: 1, start_time: "09:00", end_time: "10:00" });
                  setShowRecurringModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Recurring Slot
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability.recurring_availability.length > 0 ? (
              <div className="space-y-3">
                {availability.recurring_availability.map((slot) => (
                  <div key={slot._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{dayNames[slot.day_of_week]}</p>
                      <p className="text-xs text-gray-600">{slot.start_time} - {slot.end_time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditRecurring(slot)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteRecurring(slot._id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recurring availability slots set</p>
            )}
          </CardContent>
        </Card>

        {/* One-time Availability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                One-time Availability Slots
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingSlot(null);
                  setOneTimeForm({ date: "", start_time: "09:00", end_time: "10:00" });
                  setShowOneTimeModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add One-time Slot
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability.one_time_availability.length > 0 ? (
              <div className="space-y-3">
                {availability.one_time_availability.map((slot) => (
                  <div key={slot._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{formatDate(slot.date)}</p>
                      <p className="text-xs text-gray-600">{slot.start_time} - {slot.end_time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditOneTime(slot)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteOneTime(slot._id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No one-time availability slots set</p>
            )}
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
            {availability.blackout_dates.length > 0 ? (
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
                    const daySettings = generalSettings.general_availability[dayKey];
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

      {/* Recurring Slot Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingSlot ? 'Edit' : 'Add'} Recurring Slot
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowRecurringModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleRecurringSubmit} className="space-y-4">
              <div>
                <Label htmlFor="day_of_week">Day of Week</Label>
                <Select 
                  value={recurringForm.day_of_week.toString()} 
                  onValueChange={(value) => setRecurringForm({...recurringForm, day_of_week: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Select 
                  value={recurringForm.start_time} 
                  onValueChange={(value) => setRecurringForm({...recurringForm, start_time: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Select 
                  value={recurringForm.end_time} 
                  onValueChange={(value) => setRecurringForm({...recurringForm, end_time: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowRecurringModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingSlot ? 'Update' : 'Add'} Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-time Slot Modal */}
      {showOneTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingSlot ? 'Edit' : 'Add'} One-time Slot
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOneTimeModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleOneTimeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={oneTimeForm.date}
                  onChange={(e) => setOneTimeForm({...oneTimeForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Select 
                  value={oneTimeForm.start_time} 
                  onValueChange={(value) => setOneTimeForm({...oneTimeForm, start_time: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Select 
                  value={oneTimeForm.end_time} 
                  onValueChange={(value) => setOneTimeForm({...oneTimeForm, end_time: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowOneTimeModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingSlot ? 'Update' : 'Add'} Slot
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