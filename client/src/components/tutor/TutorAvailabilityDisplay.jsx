import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const TutorAvailabilityDisplay = ({ tutorId, onSlotSelect }) => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tutorId) {
      fetchAvailability();
    }
  }, [tutorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/tutor/availability/${tutorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      toast({
        title: "Error",
        description: "Failed to load tutor availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/tutor/availability/${tutorId}/slots?date=${selectedDate}&duration_minutes=${selectedDuration}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      
      const data = await response.json();
      setAvailableSlots(data.available_slots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      toast({
        title: "Error",
        description: "Failed to load available slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedDuration]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSlotSelect = (slot) => {
    if (onSlotSelect) {
      onSlotSelect({
        start: slot.start,
        end: slot.end,
        duration: slot.duration
      });
    }
  };

  if (loading && !availability) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!availability) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Unable to load tutor availability</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!availability.is_accepting_bookings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Accepting Bookings</h3>
            <p className="text-gray-600">This tutor is currently not accepting new bookings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Available Time Slots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Availability Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Minimum Notice</p>
            <p className="text-lg font-semibold">{availability.minimum_notice_hours} hours</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Max Advance Booking</p>
            <p className="text-lg font-semibold">{availability.maximum_advance_days} days</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Session Options</p>
            <p className="text-sm font-semibold">
              {availability.session_durations.map(d => `${d}min`).join(', ')}
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + availability.maximum_advance_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Duration
          </label>
          <Select 
            value={selectedDuration.toString()} 
            onValueChange={(value) => setSelectedDuration(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {availability.session_durations.map((duration) => (
                <SelectItem key={duration} value={duration.toString()}>
                  {duration} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Slots */}
        {selectedDate && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Available Slots for {formatDate(selectedDate)}
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-sm font-medium">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </span>
                    <span className="text-xs text-gray-600">
                      {slot.duration} minutes
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No available slots for this date and duration</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try selecting a different date or duration
                </p>
              </div>
            )}
          </div>
        )}

        {/* General Availability Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">General Availability</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {Object.entries(availability.general_availability).map(([day, settings]) => (
              <div key={day} className="flex items-center space-x-2">
                {settings.available ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="capitalize">{day}</span>
                {settings.available && (
                  <span className="text-xs text-gray-600">
                    {settings.start}-{settings.end}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorAvailabilityDisplay; 