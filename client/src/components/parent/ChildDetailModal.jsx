import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'react-toastify';
import {
  Loader2,
  User,
  Edit3,
  Save,
  X,
  Camera,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  Target,
  Star
} from 'lucide-react';
import { useParent } from '../../contexts/ParentContext';
import { useSubject } from '../../hooks/useSubject';
import { BASE_URL } from '../../config';

const ChildDetailModal = ({ isOpen, onClose, child, onChildUpdated }) => {
  const { updateChildProfile, uploadChildPhoto } = useParent();
  const { academicLevels, subjects, fetchSubjectRelatedToAcademicLevels, subjectRelatedToAcademicLevels } = useSubject();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    age: '',
    academic_level: '',
    preferred_subjects: [],
    bio: '',
    phone_number: '',
    address: '',
    emergency_contact: '',
    learning_goals: '',
    special_needs: '',
    preferred_learning_style: '',
    availability: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (child) {
      setFormData({
        full_name: child.full_name || '',
        email: child.email || '',
        age: child.age || '',
        academic_level: child.academic_level?._id || '',
        preferred_subjects: child.preferred_subjects || [],
        bio: child.bio || '',
        phone_number: child.phone_number || '',
        address: child.address || '',
        emergency_contact: child.emergency_contact || '',
        learning_goals: child.learning_goals || '',
        special_needs: child.special_needs || '',
        preferred_learning_style: child.preferred_learning_style || '',
        availability: child.availability || []
      });

      // Fetch subjects for the child's academic level
      if (child.academic_level?._id) {
        fetchSubjectRelatedToAcademicLevels([child.academic_level._id]);
      }
    }
  }, [child]); // Removed fetchSubjectRelatedToAcademicLevels from dependencies

  // Auto-open in edit mode if initialEditMode is true
  useEffect(() => {
    if (child?.initialEditMode) {
      setIsEditing(true);
    }
  }, [child]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // If academic level changes, fetch related subjects
    if (name === 'academic_level' && value) {
      fetchSubjectRelatedToAcademicLevels([value]);
    }
  };

  const removeSubject = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      preferred_subjects: prev.preferred_subjects.filter(id => id !== subjectId)
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getAcademicLevelName = (id) => {
    const academicLevel = academicLevels.find(level => level._id === id);
    return academicLevel;
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 0 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.academic_level) {
      newErrors.academic_level = 'Academic level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Update child profile
      const updateData = {
        ...formData,
        age: parseInt(formData.age)
      };

      const finalUpdatedChild = await updateChildProfile(child._id, updateData);

      // Upload photo if selected
      if (photoFile) {
        const photoResponse = await uploadChildPhoto(child._id, photoFile);
        
        // Update the local child object with the new photo URL
        if (photoResponse && photoResponse.photo_url) {
          child.photo_url = photoResponse.photo_url;
          
          // Clear the photo preview since we now have the actual uploaded photo
          setPhotoPreview(null);
        }
      }

      // Immediately update the local child object and form data
      const updatedChild = { ...child, ...updateData };

      // Update the child object passed from parent
      Object.assign(child, updateData);

      // Fix academic_level format - ensure it's an object with _id and level
      if (updateData.academic_level && typeof updateData.academic_level === 'string') {
        const academicLevelObj = academicLevels.find(level => level._id === updateData.academic_level);
        if (academicLevelObj) {
          child.academic_level = academicLevelObj;
          updatedChild.academic_level = academicLevelObj;
        }
      }

      // Update form data to reflect changes
      setFormData({
        full_name: updateData.full_name || '',
        email: updateData.email || '',
        age: updateData.age || '',
        academic_level: updateData.academic_level || '',
        preferred_subjects: updateData.preferred_subjects || [],
        bio: updateData.bio || '',
        phone_number: updateData.phone_number || '',
        address: updateData.address || '',
        emergency_contact: updateData.emergency_contact || '',
        learning_goals: updateData.learning_goals || '',
        special_needs: updateData.special_needs || '',
        preferred_learning_style: updateData.preferred_learning_style || '',
        availability: updateData.availability || []
      });

      // Fetch updated subjects if academic level changed
      if (updateData.academic_level && updateData.academic_level !== child.academic_level?._id) {
        fetchSubjectRelatedToAcademicLevels([updateData.academic_level]);
      }

      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);

      // Notify parent component
      onChildUpdated(updatedChild);

      toast.success('Child profile updated successfully!');

      window.dispatchEvent(new CustomEvent('parentDataUpdated'));
    } catch (error) {
      // console.error('Error updating child profile:', error);
      toast.error(error.message || 'An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);

    // Reset form data to original values
    if (child) {
      setFormData({
        full_name: child.full_name || '',
        email: child.email || '',
        age: child.age || '',
        academic_level: child.academic_level?._id || '',
        preferred_subjects: child.preferred_subjects || [],
        bio: child.bio || '',
        phone_number: child.phone_number || '',
        address: child.address || '',
        emergency_contact: child.emergency_contact || '',
        learning_goals: child.learning_goals || '',
        special_needs: child.special_needs || '',
        preferred_learning_style: child.preferred_learning_style || '',
        availability: child.availability || []
      });
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    onClose();
  };

  if (!child) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            {isEditing ? 'Edit Child Profile' : 'Child Profile Details'}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isEditing
              ? 'Update your child\'s information and preferences'
              : 'View and manage your child\'s tutoring profile'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Profile Photo Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : child.photo_url ? (
                  <img
                    src={`${BASE_URL}${child.photo_url}`}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  child.full_name?.charAt(0)?.toUpperCase() || 'C'
                )}
              </div>

              {isEditing && (
                <label className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
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
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                Click the camera icon to change photo
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="full_name" className="text-xs sm:text-sm">Full Name *</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter child's full name"
                  className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.full_name ? 'border-red-500' : ''}`}
                />
              ) : (
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[36px] sm:min-h-[40px] flex items-center">
                  <span className="font-medium text-sm sm:text-base">{child.full_name}</span>
                </div>
              )}
              {errors.full_name && (
                <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="age" className="text-xs sm:text-sm">Age *</Label>
              {isEditing ? (
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  min="0"
                  max="120"
                  className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.age ? 'border-red-500' : ''}`}
                />
              ) : (
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[36px] sm:min-h-[40px] flex items-center">
                  <span className="font-medium text-sm sm:text-base">{child.age} years old</span>
                </div>
              )}
              {errors.age && (
                <p className="text-xs text-red-500 mt-1">{errors.age}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2 xs:col-span-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email Address *</Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                />
              ) : (
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[36px] sm:min-h-[40px] flex items-center">
                  <span className="font-medium text-sm sm:text-base">{child.email}</span>
                </div>
              )}
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2 xs:col-span-2">
              <Label htmlFor="phone_number" className="text-xs sm:text-sm">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              ) : (
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[36px] sm:min-h-[40px] flex items-center">
                  <span className="font-medium text-sm sm:text-base">{child.phone_number || 'Not specified'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
              Academic Information
            </h3>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="academic_level" className="text-xs sm:text-sm">Academic Level *</Label>
                {isEditing ? (
                  <Select value={formData.academic_level} onValueChange={(value) => handleSelectChange('academic_level', value)}>
                    <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.academic_level ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicLevels.map((level) => (
                        <SelectItem key={level._id} value={level._id} className="text-xs sm:text-sm">
                          {level.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[36px] sm:min-h-[40px] flex items-center">
                    <span className="font-medium text-sm sm:text-base">
                      {(() => {
                        // Handle both cases: when academic_level is an object or just an ID
                        if (child.academic_level && typeof child.academic_level === 'object' && child.academic_level._id) {
                          // It's an object with _id
                          return getAcademicLevelName(child.academic_level._id)?.level || 'Not specified';
                        } else if (child.academic_level && typeof child.academic_level === 'string') {
                          // It's just an ID string
                          return getAcademicLevelName(child.academic_level)?.level || 'Not specified';
                        } else {
                          return 'Not specified';
                        }
                      })()}
                    </span>
                  </div>
                )}
                {errors.academic_level && (
                  <p className="text-xs text-red-500 mt-1">{errors.academic_level}</p>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Account Status</Label>
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[36px] sm:min-h-[40px] flex items-center">
                  <Badge
                    variant={child.is_verified === 'active' ? 'default' : 'secondary'}
                    className={`text-xs ${child.is_verified === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {child.is_verified === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Preferred Subjects</Label>
              {isEditing ? (
                <div className="space-y-2 sm:space-y-3">
                  {/* Show current selected subjects with delete option */}
                  {formData.preferred_subjects && formData.preferred_subjects.length > 0 && (
                    <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 mb-1 sm:mb-2">Currently Selected:</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {formData.preferred_subjects.map((subjectId) => {
                          const subject = subjects.find(s => s._id === subjectId);
                          return subject ? (
                            <Badge
                              key={subjectId}
                              variant="outline"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700 text-xs px-1.5 py-0"
                            >
                              {subject.name}
                              <button
                                onClick={() => removeSubject(subjectId)}
                                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                              >
                                ×
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Subject selection dropdown - only shows subjects related to academic level */}
                  <div>
                    <Label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Add subjects for {getAcademicLevelName(formData.academic_level)?.level || 'selected level'}:
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        if (value && !formData.preferred_subjects.includes(value)) {
                          setFormData(prev => ({
                            ...prev,
                            preferred_subjects: [...prev.preferred_subjects, value]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select a subject to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectRelatedToAcademicLevels && subjectRelatedToAcademicLevels.length > 0 ? (
                          subjectRelatedToAcademicLevels
                            .filter(subject => !formData.preferred_subjects.includes(subject._id))
                            .map((subject) => (
                              <SelectItem key={subject._id} value={subject._id} className="text-xs sm:text-sm">
                                {subject.name}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="" disabled className="text-xs sm:text-sm">
                            {formData.academic_level ? 'No subjects available for this level' : 'Please select academic level first'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {child.preferred_subjects && child.preferred_subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {child.preferred_subjects.map((subjectId) => {
                        const subject = subjects.find(s => s._id === subjectId);
                        return subject ? (
                          <Badge key={subjectId} variant="outline" className="text-xs px-1.5 py-0">
                            {subject.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No subjects selected</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full xs:w-auto text-xs sm:text-sm h-9"
                  size="sm"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full xs:w-auto text-xs sm:text-sm h-9 flex items-center gap-2"
                  size="sm"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full xs:w-auto text-xs sm:text-sm h-9"
                  size="sm"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full xs:w-auto text-xs sm:text-sm h-9 flex items-center gap-2"
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChildDetailModal;