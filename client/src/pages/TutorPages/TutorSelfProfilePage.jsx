import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '../../config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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

const TutorSelfProfilePage = () => {
  const { user, getAuthToken } = useAuth();
  const token = getAuthToken();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const avatarUrl = useMemo(() => buildImageUrl(profile?.user_id?.photo_url || user?.photo_url), [profile, user]);

  useEffect(() => {
    if (!user?._id) return;
    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/tutor/profile/${user._id}`);
      const json = await res.json();
      const normalized = json && json._id ? json : (json && json._doc ? { ...json._doc, ...json } : json);
      setProfile(normalized);
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

  if (!profile) {
    return (
      <div className="p-6 text-center text-gray-600">Profile not found.</div>
    );
  }

  const subjectsList = toArray(profile.subjects);
  const qualificationsList = toArray(profile.qualifications);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24 border-2 border-white shadow">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback>
                  {profile?.user_id?.full_name?.charAt(0) || user?.full_name?.charAt(0) || 'T'}
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
                        // Force refresh local profile image by updating user.photo_url in memory if needed
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
              <h1 className="text-2xl font-bold text-gray-900">{profile.user_id?.full_name || 'Tutor'}</h1>
              <p className="text-sm text-gray-600">{profile.user_id?.email}</p>
              {profile.profile_status && (
                <span
                  className={`inline-block mt-2 text-xs px-2 py-1 rounded border ${
                    profile.profile_status === 'approved'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : profile.profile_status === 'pending'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : profile.profile_status === 'rejected'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {profile.profile_status.replace('_', ' ')}
                </span>
              )}
              {profile.location && (
                <p className="text-sm text-gray-600 mt-1">{profile.location}</p>
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
            <div>
              <Label>Bio</Label>
              <div className="mt-1 p-2 border rounded bg-gray-50 min-h-[44px]">
                {profile.bio || '—'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Experience (years)</Label>
                <Input value={profile.experience_years || 0} disabled />
              </div>
              <div>
                <Label>Total Sessions</Label>
                <Input value={profile.total_sessions || 0} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Average Rating</Label>
                <Input value={profile.average_rating || 0} disabled />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={profile.location || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Background Check</Label>
                <Input value={profile.is_background_checked ? 'Verified' : 'Not Verified'} disabled />
              </div>
              <div>
                <Label>References</Label>
                <Input value={profile.is_reference_verified ? 'Verified' : 'Not Verified'} disabled />
              </div>
              <div>
                <Label>Qualifications</Label>
                <Input value={profile.is_qualification_verified ? 'Verified' : 'Not Verified'} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subjectsList.map((s, i) => (
                  <span key={i} className="px-2 py-1 text-sm border rounded bg-white shadow-sm">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No subjects added.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle>Qualifications</CardTitle>
        </CardHeader>
        <CardContent>
          {qualificationsList.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {qualificationsList.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">No qualifications added.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle>Academic Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.academic_levels_taught && profile.academic_levels_taught.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.academic_levels_taught.map((lvl, i) => (
                <div key={i} className="p-3 border rounded bg-white space-y-1 shadow-sm">
                  <div className="font-medium">{lvl.name}</div>
                  <div className="text-sm text-gray-600">£{lvl.hourlyRate}/hr · {lvl.totalSessionsPerMonth} sessions</div>
                  <div className="text-sm text-gray-600">Discount: {lvl.discount}%</div>
                  {typeof lvl.monthlyRate === 'number' && (
                    <div className="text-sm text-gray-800">Monthly: £{lvl.monthlyRate}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No levels configured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorSelfProfilePage;


