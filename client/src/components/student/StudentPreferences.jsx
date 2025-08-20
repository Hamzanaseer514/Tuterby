import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { BASE_URL } from "@/config";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import { useSubject } from "../../hooks/useSubject";
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
  Calendar,
} from "lucide-react";

const StudentPreferences = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const {
    academicLevels,
    subjects,
    loading: subjectsLoading,
    subjectRelatedToAcademicLevels,
    fetchSubjectRelatedToAcademicLevels,
  } = useSubject();

  // Debug logging to see actual data structure
  useEffect(() => {
    if (academicLevels.length > 0) {
    }
    if (subjects.length > 0) {
    }
  }, [academicLevels, subjects]);

  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    photo_url: "",
    age: "",
    academic_level: "",
    learning_goals: "",
    preferred_subjects: [],
    availability: [],
  });

  const [newSubject, setNewSubject] = useState("");

  // Common subjects for suggestions
  const commonSubjects = [
    "Mathematics",
    "English",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Economics",
    "Business Studies",
    "Computer Science",
    "Art",
    "Music",
    "Physical Education",
    "Religious Studies",
    "Modern Languages",
    "French",
    "German",
    "Spanish",
    "Latin",
    "Greek",
    "Psychology",
    "Sociology",
    "Philosophy",
    "Literature",
    "Creative Writing",
    "Statistics",
    "Accounting",
    "Law",
    "Medicine",
    "Engineering",
    "Architecture",
    "Design",
    "Drama",
    "Media Studies",
    "Politics",
    "International Relations",
    "Environmental Science",
  ];

  useEffect(() => {
    if (formData.academic_level) {
      fetchSubjectRelatedToAcademicLevels(formData.academic_level);
    }
  }, [formData.academic_level, fetchSubjectRelatedToAcademicLevels]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(
        `${BASE_URL}/api/auth/student/dashboard/${user?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data.profile);
      // Set form values
      const availabilityMap = {};
      (data.profile?.availability || []).forEach((slot) => {
        availabilityMap[slot.day.toLowerCase()] = slot.duration;
      });

      setFormData({
        full_name: data.student?.full_name || "",
        phone_number: data.student?.phone_number || "",
        photo_url: data.student?.photo_url || "",
        age: data.student?.age || "",
        academic_level: data.profile?.academic_level || "",
        learning_goals: data.profile?.learning_goals || "",
        preferred_subjects: data.profile?.preferred_subjects || [],
        availability: availabilityMap, // ✅ fixed
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const matchAcademicLevel = (level) => {
    const matchedLevel = academicLevels.find((l) => l.level === level);
    if (matchedLevel) {
      return matchedLevel._id;
    }
    return null;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      const response = await fetch(
        `${BASE_URL}/api/auth/updatestudent/${user?._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            // photo_url: formData.photo_url,
            age: formData.age,
            academic_level: formData.academic_level,
            learning_goals: formData.learning_goals,
            preferred_subjects: formData.preferred_subjects,
            availability: formData.availability,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        fetchProfile();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        });
      }

      // Update local state with the returned data
      setFormData((prev) => ({
        ...prev,
        full_name: result.user?.full_name || prev.full_name,
        phone_number: result.user?.phone_number || prev.phone_number,
        photo_url: result.user?.photo_url || prev.photo_url,
        age: result.user?.age || prev.age,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    if (
      newSubject.trim() &&
      !formData.preferred_subjects.includes(newSubject.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        preferred_subjects: [...prev.preferred_subjects, newSubject.trim()],
      }));
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferred_subjects: prev.preferred_subjects.filter(
        (subject) => subject !== subjectToRemove
      ),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
            <h1 className="text-3xl font-bold text-gray-900">
              Student Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your profile and preferences
              <span className="text-base text-red-600">
                {" "}
                You can update your profile Here
              </span>
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
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
            {/* 
            <div>
              <Label htmlFor="photo_url">Profile Photo URL</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="photo_url"
                  name="photo_url"
                  value={formData.photo_url}
                  onChange={handleInputChange}
                  placeholder="Enter URL for your profile photo"
                />

              </div>
            </div> */}

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
              {subjectsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">
                    Loading academic levels...
                  </span>
                </div>
              ) : (
                <>
                  <Select
                    value={formData.academic_level}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        academic_level: value, // ✅ save selected academic level _id
                      }));

                      // ✅ call subject fetch whenever academic level changes
                      fetchSubjectRelatedToAcademicLevels([value]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicLevels.map((level) => (
                        <SelectItem
                          key={level._id}
                          value={level._id} // ✅ send _id not name
                        >
                          {level.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {academicLevels.length} levels available
                    </span>
                    {academicLevels.length === 0 && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        No levels loaded
                      </Badge>
                    )}
                  </div>
                </>
              )}
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
              <Label>Quick Add from Available Subjects</Label>
              {subjectsLoading ? (
                <div className="flex items-center justify-center p-4 mt-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">
                    Loading subjects...
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2 mt-3">
                    <span className="text-sm text-gray-600">
                      {subjectRelatedToAcademicLevels.length} subjects available
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {subjectRelatedToAcademicLevels
                      .slice(0, 20)
                      .map((subject) => (
                        <Button
                          key={subject._id}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (
                              !formData.preferred_subjects.includes(subject._id)
                            ) {
                              setFormData((prev) => ({
                                ...prev,
                                preferred_subjects: [
                                  ...prev.preferred_subjects,
                                  subject._id,
                                ], // ✅ store ID
                              }));
                            }
                          }}
                          disabled={formData.preferred_subjects.includes(
                            subject._id
                          )}
                        >
                          {subject.name} ({subject.levelData?.level} -{" "}
                          {subject.subjectTypeData?.name}){" "}
                        </Button>
                      ))}
                    {subjects.length > 20 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600"
                      >
                        +{subjects.length - 20} more
                      </Button>
                    )}
                  </div>
                  {subjects.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No subjects available from server
                    </p>
                  )}
                </>
              )}
            </div>

            {/* <div>
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
            </div> */}

            <div>
              <Label>
                Your Subjects ({formData.preferred_subjects.length})
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferred_subjects.map((subjectId) => {
                  const subjectObj =
                     subjects.find((s) => s._id === subjectId);

                  const displayName = subjectObj
                    ? `${subjectObj.name || "No Name"} (${
                        subjectObj.level_id?.level || "-"
                      } - ${subjectObj.subject_type?.name || "-"})`
                    : subjectId;

                  return (
                    <Badge
                      key={subjectId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {displayName}
                      <button
                        onClick={() => removeSubject(subjectId)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>

              {formData.preferred_subjects.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No subjects added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        {/* <Card className="lg:col-span-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => (
                  <div key={day}>
                    <Label className="capitalize">{day}</Label>
                    <Input
                      type="time"
                      value={formData.availability?.[day] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            [day]: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default StudentPreferences;
