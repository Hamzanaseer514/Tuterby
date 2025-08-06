import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import {
  Save,
  ArrowLeft,
  BookOpen,
  Target,
  Clock,
  Bell,
  X,
  Plus,
  User,
  Phone,
  Calendar
} from 'lucide-react';

const StudentPreferences = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    photo_url: '',
    age: '',
    academic_level: '',
    learning_goals: '',
    preferred_subjects: [],
    availability: []
  });

  const [newSubject, setNewSubject] = useState('');
  const [preferences, setPreferences] = useState({
    preferred_session_duration: '1 hour',
    preferred_learning_style: 'visual',
    notification_preferences: {
      email_notifications: true,
      session_reminders: true,
      assignment_updates: true
    }
  });

  // Common subjects for suggestions
  const commonSubjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Economics', 'Business Studies', 'Computer Science',
    'Art', 'Music', 'Physical Education', 'Religious Studies', 'Modern Languages',
    'French', 'German', 'Spanish', 'Latin', 'Greek', 'Psychology', 'Sociology',
    'Philosophy', 'Literature', 'Creative Writing', 'Statistics', 'Accounting',
    'Law', 'Medicine', 'Engineering', 'Architecture', 'Design', 'Drama',
    'Media Studies', 'Politics', 'International Relations', 'Environmental Science'
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/auth/student/dashboard/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data.profile);
      // Set form values
      const availabilityMap = {};
      (data.profile?.availability || []).forEach(slot => {
        availabilityMap[slot.day.toLowerCase()] = slot.duration;
      });

      setFormData({
        full_name: data.student?.full_name || '',
        phone_number: data.student?.phone_number || '',
        photo_url: data.student?.photo_url || '',
        age: data.student?.age || '',
        academic_level: data.profile?.academic_level || '',
        learning_goals: data.profile?.learning_goals || '',
        preferred_subjects: data.profile?.preferred_subjects || [],
        availability: availabilityMap, // ✅ fixed
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/auth/updatestudent/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          photo_url: formData.photo_url,
          age: formData.age,
          academic_level: formData.academic_level,
          learning_goals: formData.learning_goals,
          preferred_subjects: formData.preferred_subjects,
          availability: formData.availability
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Update local state with the returned data
      setFormData(prev => ({
        ...prev,
        full_name: result.user?.full_name || prev.full_name,
        phone_number: result.user?.phone_number || prev.phone_number,
        photo_url: result.user?.photo_url || prev.photo_url,
        age: result.user?.age || prev.age
      }));

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !formData.preferred_subjects.includes(newSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_subjects: [...prev.preferred_subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferred_subjects: prev.preferred_subjects.filter(subject => subject !== subjectToRemove)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="photo_url">Profile Photo URL</Label>
              <img
                id="photo_url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleInputChange}
                placeholder="Enter URL for your profile photo"
                src={formData.photo_url}
                alt="Profile Photo"
                className="w-10 h-10 rounded-full"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="academic_level">Academic Level</Label>
              <Select
                value={formData.academic_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, academic_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your academic level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary School">Primary School</SelectItem>
                  <SelectItem value="Middle School">Middle School</SelectItem>
                  <SelectItem value="Secondary School">Secondary School</SelectItem>
                  <SelectItem value="GCSE">GCSE</SelectItem>
                  <SelectItem value="A-Level">A-Level</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="Adult Learning">Adult Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="learning_goals">Learning Goals</Label>
              <Textarea
                id="learning_goals"
                name="learning_goals"
                placeholder="Describe your learning goals and what you want to achieve..."
                value={formData.learning_goals}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferred Subjects */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Preferred Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Add Subject</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter subject name"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                />
                <Button onClick={addSubject} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Quick Add Common Subjects</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonSubjects.slice(0, 12).map((subject) => (
                  <Button
                    key={subject}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!formData.preferred_subjects.includes(subject)) {
                        setFormData(prev => ({
                          ...prev,
                          preferred_subjects: [...prev.preferred_subjects, subject]
                        }));
                      }
                    }}
                    disabled={formData.preferred_subjects.includes(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Your Subjects ({formData.preferred_subjects.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferred_subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {formData.preferred_subjects.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No subjects added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Set your weekly availability for tutoring sessions
              </p>

              {/* Example availability slots - you can expand this */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Monday</Label>
                  <Input type="time" value={formData.availability.monday} onChange={handleInputChange} />

                </div>
                <div>
                  <Label>Tuesday</Label>
                  <Input type="time" value={formData.availability.tuesday} onChange={handleInputChange} />
                </div>
                {/* Add more days as needed */}
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default StudentPreferences;