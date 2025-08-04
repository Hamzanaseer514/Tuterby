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
  Plus
} from 'lucide-react';

const StudentPreferences = ({ studentId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Form states
  const [academicLevel, setAcademicLevel] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [preferredSubjects, setPreferredSubjects] = useState([]);
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
    if (studentId) {
      fetchProfile();
    }
  }, [studentId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
              const response = await fetch(`http://localhost:5000/api/auth/student/dashboard/${studentId}`, {
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
      setAcademicLevel(data.profile?.academic_level || '');
      setLearningGoals(data.profile?.learning_goals || '');
      setPreferredSubjects(data.profile?.preferred_subjects || []);
      setPreferences(data.profile?.preferences || {
        preferred_session_duration: '1 hour',
        preferred_learning_style: 'visual',
        notification_preferences: {
          email_notifications: true,
          session_reminders: true,
          assignment_updates: true
        }
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
              const response = await fetch(`http://localhost:5000/api/auth/student/preferences/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          academic_level: academicLevel,
          learning_goals: learningGoals,
          preferred_subjects: preferredSubjects,
          preferences: preferences
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !preferredSubjects.includes(newSubject.trim())) {
      setPreferredSubjects([...preferredSubjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove) => {
    setPreferredSubjects(preferredSubjects.filter(subject => subject !== subjectToRemove));
  };

  const handleNotificationChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
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
          <Button 
            onClick={() => navigate(`/student-dashboard/${studentId}`)} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Preferences</h1>
            <p className="text-gray-600 mt-1">Manage your learning preferences and subjects</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <Label htmlFor="academic-level">Academic Level</Label>
              <Select value={academicLevel} onValueChange={setAcademicLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your academic level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary School">Primary School</SelectItem>
                  <SelectItem value="Secondary School">Secondary School</SelectItem>
                  <SelectItem value="GCSE">GCSE</SelectItem>
                  <SelectItem value="A-Level">A-Level</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="Adult Learning">Adult Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="learning-goals">Learning Goals</Label>
              <Textarea
                id="learning-goals"
                placeholder="Describe your learning goals and what you want to achieve..."
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferred Subjects */}
        <Card>
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
                      if (!preferredSubjects.includes(subject)) {
                        setPreferredSubjects([...preferredSubjects, subject]);
                      }
                    }}
                    disabled={preferredSubjects.includes(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Your Subjects ({preferredSubjects.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {preferredSubjects.map((subject) => (
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
              {preferredSubjects.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No subjects added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Learning Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session-duration">Preferred Session Duration</Label>
              <Select 
                value={preferences.preferred_session_duration} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_session_duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="learning-style">Preferred Learning Style</Label>
              <Select 
                value={preferences.preferred_learning_style} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_learning_style: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual (Diagrams, charts, videos)</SelectItem>
                  <SelectItem value="auditory">Auditory (Listening, discussions)</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic (Hands-on, practical)</SelectItem>
                  <SelectItem value="reading/writing">Reading/Writing (Text-based)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-notifications"
                checked={preferences.notification_preferences.email_notifications}
                onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
              />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="session-reminders"
                checked={preferences.notification_preferences.session_reminders}
                onCheckedChange={(checked) => handleNotificationChange('session_reminders', checked)}
              />
              <Label htmlFor="session-reminders">Session Reminders</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="assignment-updates"
                checked={preferences.notification_preferences.assignment_updates}
                onCheckedChange={(checked) => handleNotificationChange('assignment_updates', checked)}
              />
              <Label htmlFor="assignment-updates">Assignment Updates</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
};

export default StudentPreferences; 