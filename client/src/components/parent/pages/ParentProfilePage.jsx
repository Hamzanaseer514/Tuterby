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
  X
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
      console.error('Error fetching profile:', error);
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
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
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
      console.error('Error updating profile:', error);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your personal information and account settings
            </p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                Update your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : parentProfile?.user_id?.photo_url ? (
                    <img 
                      src={`${BASE_URL}${parentProfile.user_id.photo_url}`} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    user?.full_name?.charAt(0)?.toUpperCase() || 'P'
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                    <Camera className="h-4 w-4" />
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click the camera icon to change photo
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{parentProfile?.user_id?.full_name || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{parentProfile?.user_id?.email || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{parentProfile?.user_id?.phone_number || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                {isEditing ? (
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter your age"
                    min="20"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{parentProfile?.user_id?.age || 'Not specified'} years old</span>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {parentProfile?.user_id?.is_verified === 'active' ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {parentProfile?.user_id?.created_at 
                      ? new Date(parentProfile.user_id.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not specified'
                    }
                  </span>
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
