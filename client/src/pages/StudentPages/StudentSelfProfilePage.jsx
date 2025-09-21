import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useSubject } from '../../hooks/useSubject';

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
  const token = getAuthToken();
  const [loading, setLoading] = useState(true);

  // ✅ safe defaults
  const [baseUser, setBaseUser] = useState({
    full_name: '',
    email: '',
    photo_url: '',
    phone_number: '',
    age: null
  });

  const [profile, setProfile] = useState({
    academic_level: '',
    learning_goals: '',
    preferred_subjects: [],
    hired_tutors: []
  });

  const [uploading, setUploading] = useState(false);
  const avatarUrl = useMemo(() => buildImageUrl(baseUser?.photo_url), [baseUser]);
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

      setBaseUser({
        full_name: userJson?.full_name || '',
        email: userJson?.email || '',
        photo_url: userJson?.photo_url || '',
        phone_number: userJson?.phone_number || '',
        age: userJson?.age || null
      });

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
              <p className="text-sm text-gray-600">{baseUser.email || '—'}</p>
              {baseUser.age && (
                <p className="text-sm text-gray-600 mt-1">Age: {baseUser.age}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
