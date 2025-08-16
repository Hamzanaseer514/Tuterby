import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '../../config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

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
        // fall through to comma split
      }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

const StudentSelfProfilePage = () => {
  const { user, getAuthToken } = useAuth();
  const token = getAuthToken();
  const [loading, setLoading] = useState(true);
  const [baseUser, setBaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const avatarUrl = useMemo(() => buildImageUrl(baseUser?.photo_url), [baseUser]);

  useEffect(() => {
    if (!user?._id) return;
    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      setLoading(true);
      const [userRes, profileRes] = await Promise.all([
        fetch(`${BASE_URL}/api/auth/user-profile/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${BASE_URL}/api/auth/student/profile/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const userJson = await userRes.json();
      const profileJson = await profileRes.json();
      setBaseUser(userJson);
      setProfile(profileJson?.student || null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!baseUser || !profile) {
    return (
      <div className="p-6 text-center text-gray-600">Profile not found.</div>
    );
  }

  const preferredSubjects = toArray(profile.preferred_subjects);
  const hiredTutors = Array.isArray(profile.hired_tutors) ? profile.hired_tutors : [];
  const acceptedCount = hiredTutors.filter(h => h?.status === 'accepted').length;
  const pendingCount = hiredTutors.filter(h => h?.status === 'pending').length;
  const rejectedCount = hiredTutors.filter(h => h?.status === 'rejected').length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
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
                    try {
                      setUploading(true);
                      const formData = new FormData();
                      formData.append('photo', file);
                      const res = await fetch(`${BASE_URL}/api/auth/user-profile/${user._id}/photo`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                      });
                      const json = await res.json();
                      if (json?.success && json.photo_url) {
                        await loadProfile();
                      }
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
              <p className="text-sm text-gray-600">{baseUser.email}</p>
              {baseUser.age && (
                <p className="text-sm text-gray-600 mt-1">Age: {baseUser.age}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Academic Level</Label>
                <Input value={profile.academic_level || ''} disabled />
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
                {preferredSubjects.map((s, i) => (
                  <span key={i} className="px-2 py-1 text-sm border rounded bg-white shadow-sm">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No preferred subjects added.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <Card className="border-blue-100">
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(profile.availability) && profile.availability.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {profile.availability.map((slot, idx) => (
                <div key={idx} className="p-3 border rounded bg-white shadow-sm flex items-center justify-between">
                  <span className="font-medium">{slot.day}</span>
                  <span className="text-sm text-gray-600">{slot.duration}</span>
                </div>
              ))}
            </div> 
          ) : (
            <p className="text-gray-600 text-sm">No availability set.</p>
          )}
        </CardContent>
      </Card> */}

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


