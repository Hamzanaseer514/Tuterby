import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useSubject } from '../../hooks/useSubject';

function buildImageUrl(raw) {
  if (!raw) return '';
  // Backend already sends complete S3 URL, return as is
  return raw;
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
        // fall through to comma split
      }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

const TutorSelfProfilePage = () => {
  const { user, getAuthToken, fetchWithAuth, getUserProfile } = useAuth();
  const token = getAuthToken();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Store user profile data with S3 URLs
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // For immediate preview
  
  const avatarUrl = useMemo(() => {
    // Use preview image if available, otherwise use userProfile photo_url
    if (previewImage) return previewImage;
    
    // Use userProfile photo_url (has S3 URL) or fallback to profile/user
    const photoUrl = userProfile?.photo_url || profile?.user_id?.photo_url || user?.photo_url;
    return buildImageUrl(photoUrl);
  }, [userProfile, profile, user, previewImage]);
  const { subjects, academicLevels } = useSubject();


  useEffect(() => {
    if (!user?._id) return;
    loadProfile();
    loadUserProfile(); // Also load user profile for S3 URLs
  }, [user]);

  // Load user profile data (same as sidebar) to get S3 URLs
  async function loadUserProfile() {
    try {
      const raw = await getUserProfile(user._id);
      setUserProfile(raw);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }


  const getSubjectName = (id) => {
    if (!id) return '';
    const subject = subjects.find(s => s._id === id);
    return subject ? subject : '';  // or subject.title depending on your schema
  };


  const getAcademicLevelName = (id) => {
    if (!id) return '';
    const academicLevel = academicLevels.find(a => a._id === id);
    return academicLevel ? academicLevel.level : '';
  }

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${BASE_URL}/api/tutor/profile/${user._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }, token, (newToken) => localStorage.setItem("authToken", newToken));
      const json = await res.json();
      const normalized = json && json._id ? json : (json && json._doc ? { ...json._doc, ...json } : json);
      setProfile(normalized);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm sm:text-base text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  // if (!profile) {
  //   return (
  //     <div className="p-6 text-center text-gray-600">Profile not found.</div>
  //   );
  // }

  const subjectsList = toArray(profile?.subjects ?? "NA");
  const qualificationsList = toArray(profile?.qualifications ?? "NA");

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-white shadow">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="text-lg sm:text-xl">
                    {profile?.user_id?.full_name?.charAt(0) || user?.full_name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-700 cursor-pointer">
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
                          body: formData,
                        }, token, (newToken) => localStorage.setItem("authToken", newToken));
                        const json = await res.json();
                        if (json?.success && json.photo_url) {
                          // Update profile state with new photo_url without full reload
                          setProfile(prev => ({
                            ...prev,
                            user_id: {
                              ...prev?.user_id,
                              photo_url: json.photo_url
                            }
                          }));
                          // Also update userProfile state
                          setUserProfile(prev => ({
                            ...prev,
                            photo_url: json.photo_url
                          }));
                          // Clear preview since we now have the real URL
                          setPreviewImage(null);
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
                  <span className="px-2 sm:px-3 py-1 sm:py-2 rounded bg-white border shadow-sm text-xs sm:text-sm">
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </span>
                </label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{profile?.user_id?.full_name || 'Tutor'}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">{profile?.user_id?.email ?? "NA"}</p>
                {profile?.profile_status && profile?.is_verified && (
                  <span
                    className={`inline-block mt-2 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border ${profile.profile_status === 'approved'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : profile.profile_status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : profile.profile_status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                  >
                    {profile.profile_status.replace('_', ' ')} - {profile?.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                )}
                {profile?.location && (
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{profile?.location ?? "NA"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-blue-100">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">About</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <Label className="text-sm sm:text-base font-medium">Bio</Label>
                <div className="mt-1 sm:mt-2 p-3 sm:p-4 border rounded bg-gray-50 min-h-[60px] text-sm sm:text-base">
                  {profile?.bio || '—'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Subjects</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {subjectsList && subjectsList?.length > 0 ? (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {subjectsList?.map((s, i) => (
                    <span key={i} className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border rounded bg-white shadow-sm break-words">
                      {getSubjectName(s)?.name} - {getSubjectName(s)?.subject_type?.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm sm:text-base">No subjects added.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
                <div>
                  <Label className="text-sm sm:text-base font-medium">Experience (years)</Label>
                  <Input value={profile?.experience_years || 0} disabled className="mt-1 sm:mt-2 text-sm sm:text-base" />
                </div>
                <div>
                  <Label className="text-sm sm:text-base font-medium">Total Sessions</Label>
                  <Input value={profile?.total_sessions || 0} disabled className="mt-1 sm:mt-2 text-sm sm:text-base" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div>
                  <Label className="text-sm sm:text-base font-medium">Average Rating</Label>
                  <Input value={profile?.average_rating || 0} disabled className="mt-1 sm:mt-2 text-sm sm:text-base" />
                </div>
                <div>
                  <Label className="text-sm sm:text-base font-medium">Location</Label>
                  <Input value={profile?.location || ''} disabled className="mt-1 sm:mt-2 text-sm sm:text-base" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-100">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {qualificationsList && qualificationsList?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                {qualificationsList?.map((q, idx) => (
                  <li key={idx} className="break-words">{q}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm sm:text-base">No qualifications added.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Academic Levels</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {profile?.academic_levels_taught && profile?.academic_levels_taught.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {profile?.academic_levels_taught.map((lvl, i) => (
                  <div key={i} className="p-3 sm:p-4 border rounded bg-white space-y-2 sm:space-y-3 shadow-sm">
                    <div className="font-medium text-sm sm:text-base">{getAcademicLevelName(lvl.educationLevel)}</div>
                    <div className="text-xs sm:text-sm text-gray-600">£{lvl.hourlyRate}/hr · {lvl.totalSessionsPerMonth} sessions</div>
                    <div className="text-xs sm:text-sm text-gray-600">Discount: {lvl.discount}%</div>
                    {typeof lvl.monthlyRate === 'number' && (
                      <div className="text-xs sm:text-sm text-gray-800 font-medium">Monthly: £{lvl.monthlyRate}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm sm:text-base">No levels configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorSelfProfilePage;


