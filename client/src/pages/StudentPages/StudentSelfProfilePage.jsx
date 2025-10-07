import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useSubject } from '../../hooks/useSubject';
import { useToast } from '../../components/ui/use-toast';
import { AlertCircle, CheckCircle, Mail, Send } from 'lucide-react';

function buildImageUrl(raw) {
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [trimmed];
      } catch {
        // fallback
      }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

const StudentSelfProfilePage = () => {
  const { user, getAuthToken, fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const token = getAuthToken();
  const [loading, setLoading] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);

  // ✅ safe defaults
  const [baseUser, setBaseUser] = useState({
    full_name: '',
    email: '',
    photo_url: '',
    phone_number: '',
    age: null,
    isEmailVerified: false
  });

  const [profile, setProfile] = useState({
    academic_level: '',
    learning_goals: '',
    preferred_subjects: [],
    hired_tutors: []
  });

  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // For immediate preview
  const avatarUrl = useMemo(() => {
    // Use preview image if available, otherwise use baseUser photo_url
    return previewImage || buildImageUrl(baseUser?.photo_url);
  }, [baseUser, previewImage]);
  const { academicLevels, subjects } = useSubject();

  const getSubjectById = useCallback((id) => {
    if (!id) return undefined;
    const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
    return s;
  }, [subjects]);

  useEffect(() => {
    if (!user?._id) return;
    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      setLoading(true);
      const [userRes, profileRes] = await Promise.all([
        fetchWithAuth(`${BASE_URL}/api/auth/user-profile/${user._id}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json"
          },
        }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
        ),
        fetchWithAuth(`${BASE_URL}/api/auth/student/profile/${user._id}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json"
          },
        }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
        ),
      ]);

      const userJson = await userRes.json();
      const profileJson = await profileRes.json();

      const isEmailVerified = userJson?.isEmailVerified || false;
      
      setBaseUser({
        full_name: userJson?.full_name || '',
        email: userJson?.email || '',
        photo_url: userJson?.photo_url || '',
        phone_number: userJson?.phone_number || '',
        age: userJson?.age || null,
        isEmailVerified: isEmailVerified
      });

      // Set email verification status immediately to prevent flash
      setEmailVerificationStatus(isEmailVerified);

      setProfile({
        academic_level: profileJson?.student?.academic_level || '',
        learning_goals: profileJson?.student?.learning_goals || '',
        preferred_subjects: profileJson?.student?.preferred_subjects || [],
        hired_tutors: profileJson?.student?.hired_tutors || []
      });
    } finally {
      setLoading(false);
    }
  }

  const matchAcademicLevel = (level) => {
    const matchedLevel = (academicLevels || []).find(l => l._id === level);
    return matchedLevel ? matchedLevel.level : '';
  };

  const handleSendVerification = async () => {
    try {
      setSendingVerification(true);
      const response = await fetchWithAuth(`${BASE_URL}/api/auth/send-email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),
      }, token, (newToken) => localStorage.setItem("authToken", newToken));

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: `A verification code has been sent to ${baseUser.email}`,
        });
        setShowVerificationForm(true);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationOtp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      setVerifying(true);
      const response = await fetchWithAuth(`${BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user._id, 
          otp: verificationOtp 
        }),
      }, token, (newToken) => localStorage.setItem("authToken", newToken));

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified!",
        });
        setBaseUser(prev => ({ ...prev, isEmailVerified: true }));
        setEmailVerificationStatus(true);
        setShowVerificationForm(false);
        setVerificationOtp('');
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to verify email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify email",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const preferredSubjects = toArray(profile.preferred_subjects);
  const hiredTutors = Array.isArray(profile.hired_tutors) ? profile.hired_tutors : [];
  const acceptedCount = hiredTutors.filter(h => h?.status === 'accepted').length;
  const pendingCount = hiredTutors.filter(h => h?.status === 'pending').length;
  const rejectedCount = hiredTutors.filter(h => h?.status === 'rejected').length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      {/* Avatar & Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24 border-2 border-white shadow">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback>
                  {baseUser?.full_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <label className="inline-flex items-center gap-2 text-xs text-blue-700 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    // Show immediate preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setPreviewImage(e.target.result);
                    };
                    reader.readAsDataURL(file);
                    
                    try {
                      setUploading(true);
                      const formData = new FormData();
                      formData.append('photo', file);
                      const res = await fetchWithAuth(`${BASE_URL}/api/auth/user-profile/${user._id}/photo`, {
                        method: 'POST',
                        // headers: { 'Content-Type': `multipart/form-data` },
                        body: formData,
                      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
                      );
                      const json = await res.json();
                      if (json?.success && json.photo_url) {
                        // Update baseUser state with new photo_url without full reload
                        setBaseUser(prev => ({
                          ...prev,
                          photo_url: json.photo_url
                        }));
                        // Clear preview since we now have the real URL
                        setPreviewImage(null);
                        
                        // Trigger photo update event for sidebar
                        window.dispatchEvent(new CustomEvent('photoUpdated'));
                        localStorage.setItem('lastPhotoUpdate', Date.now().toString());
                      }
                    } catch (error) {
                      // If upload fails, clear preview
                      setPreviewImage(null);
                      console.error('Upload failed:', error);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <span className="px-2 py-1 rounded bg-white border shadow-sm">
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </span>
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{baseUser.full_name || 'Student'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600">{baseUser.email || '—'}</p>
                {emailVerificationStatus === null ? (
                  <div className="flex items-center gap-1 text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : emailVerificationStatus ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Unverified</span>
                  </div>
                )}
              </div>
              {baseUser.age && (
                <p className="text-sm text-gray-600 mt-1">Age: {baseUser.age}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Verification Section */}
      {emailVerificationStatus === false && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Mail className="w-5 h-5" />
              Email Verification Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-orange-700">
              Your email address is not verified. Please verify your email to access all features and ensure account security.
            </p>
            
            {!showVerificationForm ? (
              <Button 
                onClick={handleSendVerification}
                disabled={sendingVerification}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendingVerification ? 'Sending...' : 'Send Verification Email'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="verification-otp">Enter Verification Code</Label>
                  <Input
                    id="verification-otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value)}
                    maxLength={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    Check your email for the verification code
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleVerifyEmail}
                    disabled={verifying || !verificationOtp.trim()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {verifying ? 'Verifying...' : 'Verify Email'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowVerificationForm(false);
                      setVerificationOtp('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* About + Preferred Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Academic Level</Label>
                <Input value={matchAcademicLevel(profile.academic_level) || ''} disabled />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={baseUser.phone_number || ''} disabled />
              </div>
            </div>
            <div>
              <Label>Learning Goals</Label>
              <div className="mt-1 p-2 border rounded bg-gray-50 min-h-[44px]">
                {profile.learning_goals || '—'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>Preferred Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {preferredSubjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {preferredSubjects.map((s, i) => {
                  const subj = getSubjectById(s);
                  return (
                    <span
                      key={i}
                      className="px-2 py-1 text-sm border rounded bg-white shadow-sm"
                    >
                      {subj
                        ? `${subj.name || ''} - ${subj.subject_type?.name || ''} - ${subj.level_id?.level || ''}`
                        : s}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No preferred subjects added.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hiring Summary */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle>Hiring Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSelfProfilePage;
