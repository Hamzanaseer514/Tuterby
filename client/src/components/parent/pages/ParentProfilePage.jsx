import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParent } from '../../../contexts/ParentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Camera, 
  Save, 
  Edit3,
  Check,
  X,
  Shield,
  Clock,
  Upload
} from 'lucide-react';
import {BASE_URL} from '../../../config';

const ParentProfilePage = () => {
  const { user } = useAuth();
  const { getParentProfile, updateParentProfile, uploadParentPhoto } = useParent();
  const [parentProfile, setParentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    age: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getParentProfile(user._id);
      setParentProfile(data.parentProfile);
      
      // Set form data
      setFormData({
        full_name: data.parentProfile.user_id?.full_name || '',
        email: data.parentProfile.user_id?.email || '',
        phone_number: data.parentProfile.user_id?.phone_number || '',
        age: data.parentProfile.user_id?.age || ''
      });
    } catch (error) {
      // console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Please select an image smaller than 5MB');
        return;
      }
      
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Update profile data
      await updateParentProfile(user._id, formData);

      // Upload photo if selected
      if (photoFile) {
        await uploadParentPhoto(user._id, photoFile);
      }
      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      
      // Refresh profile data
      fetchProfile();
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('parentDataUpdated'));
    } catch (error) {
      // console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    
    // Reset form data to original values
    setFormData({
      full_name: parentProfile?.user_id?.full_name || '',
      email: parentProfile?.user_id?.email || '',
      phone_number: parentProfile?.user_id?.phone_number || '',
      age: parentProfile?.user_id?.age || ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] sm:min-h-[500px] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
              Profile Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Manage your personal information and account settings
            </p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 shadow-md w-full xs:w-auto text-xs sm:text-sm"
              size="sm"
            >
              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-col xs:flex-row gap-2 w-full xs:w-auto">
              <Button 
                onClick={handleSave}
                className="flex items-center gap-2 w-full xs:w-auto text-xs sm:text-sm"
                size="sm"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2 w-full xs:w-auto text-xs sm:text-sm"
                size="sm"
                disabled={saving}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Profile Photo Section */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Profile Photo</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="relative inline-block mb-3 sm:mb-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg mx-auto">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : parentProfile?.user_id?.photo_url ? (
                    <img 
                      src={parentProfile.user_id.photo_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-5xl font-bold">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md border border-gray-200 dark:border-gray-600">
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {isEditing && (
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  <label className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${parentProfile?.user_id?.is_verified === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Verification Status</p>
                  <Badge 
                    variant="default" 
                    className={`mt-1 text-xs ${parentProfile?.user_id?.is_verified === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}
                  >
                    {parentProfile?.user_id?.is_verified === 'active' ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm">Member Since</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                    
                    {parentProfile?.user_id?.createdAt 
                      ? new Date(parentProfile.user_id.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Personal Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div className="space-y-2 xs:col-span-2 sm:col-span-1">
                  <Label htmlFor="full_name" className="text-xs sm:text-sm font-medium">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg h-9 sm:h-10 lg:h-11">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">{parentProfile?.user_id?.full_name || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2 xs:col-span-2 sm:col-span-1">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg h-9 sm:h-10 lg:h-11">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">{parentProfile?.user_id?.email || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-xs sm:text-sm font-medium">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg h-9 sm:h-10 lg:h-11">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">{parentProfile?.user_id?.phone_number || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-xs sm:text-sm font-medium">Age</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      min="20"
                      className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg h-9 sm:h-10 lg:h-11">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm">{parentProfile?.user_id?.age || 'Not specified'} years old</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-3 sm:mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Role</Label>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg h-9 sm:h-10 lg:h-11">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm">Parent</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Last Updated</Label>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg h-9 sm:h-10 lg:h-11">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">
                        {parentProfile?.user_id?.updatedAt 
                          ? new Date(parentProfile.user_id.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Not available'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentProfilePage;