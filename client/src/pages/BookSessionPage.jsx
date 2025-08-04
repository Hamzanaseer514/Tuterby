import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { 
  Calendar,
  Clock,
  User,
  ArrowLeft,
  BookOpen,
  MapPin
} from 'lucide-react';
import Layout from '../components/Layout';

const BookSessionPage = () => {
  const { tutorId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    subject: '',
    academic_level: '',
    session_date: '',
    session_time: '',
    duration: '60',
    description: ''
  });

  useEffect(() => {
    if (tutorId) {
      fetchTutorDetails();
    }
  }, [tutorId]);

  const fetchTutorDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`http://localhost:5000/api/auth/tutors/${tutorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutor details');
      }
      
      const data = await response.json();
      setTutor(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tutor details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.subject || !bookingData.session_date || !bookingData.session_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = getAuthToken();
      
      const response = await fetch(`http://localhost:5000/api/auth/book-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tutor_id: tutorId,
          ...bookingData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to book session');
      }
      
      toast({
        title: "Success",
        description: "Session booked successfully!",
      });
      
      // Navigate back to tutor profile
      navigate(`/tutor/${tutorId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tutor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutor Not Found</h2>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate(`/tutor/${tutorId}`)} 
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Book a Session</h1>
                <p className="text-gray-600 mt-1">Schedule a tutoring session with {tutor.user_id.full_name}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <Select 
                          value={bookingData.subject} 
                          onValueChange={(value) => handleInputChange('subject', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {tutor.subjects_taught?.map((subject, index) => (
                              <SelectItem key={index} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Academic Level *
                        </label>
                        <Select 
                          value={bookingData.academic_level} 
                          onValueChange={(value) => handleInputChange('academic_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {tutor.academic_levels_taught?.map((level, index) => (
                              <SelectItem key={index} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <Input
                          type="date"
                          value={bookingData.session_date}
                          onChange={(e) => handleInputChange('session_date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time *
                        </label>
                        <Input
                          type="time"
                          value={bookingData.session_time}
                          onChange={(e) => handleInputChange('session_time', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <Select 
                          value={bookingData.duration} 
                          onValueChange={(value) => handleInputChange('duration', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        placeholder="Describe what you'd like to work on during this session..."
                        value={bookingData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitting}
                    >
                      {submitting ? 'Booking...' : 'Book Session'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Tutor Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Tutor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {tutor.user_id.full_name}
                      </h3>
                      {tutor.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {tutor.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="font-semibold">£{tutor.hourly_rate}</span>
                    </div>
                    
                    {tutor.experience_years && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-semibold">{tutor.experience_years} years</span>
                      </div>
                    )}
                    
                    {tutor.average_rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <span className="font-semibold">{tutor.average_rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Subjects</h4>
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects_taught?.slice(0, 3).map((subject, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {subject}
                        </span>
                      ))}
                      {tutor.subjects_taught?.length > 3 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          +{tutor.subjects_taught.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookSessionPage; 