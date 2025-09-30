import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'react-toastify';
import { Loader2, UserPlus } from 'lucide-react';
import { useParent } from '../../contexts/ParentContext';
import { useSubject } from '../../hooks/useSubject';

const AddChildModal = ({ isOpen, onClose, onChildAdded, parentUserId }) => {
    const { addChildToParent } = useParent();
    const { academicLevels } = useSubject();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        academic_level: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.age) {
            newErrors.age = 'Age is required';
        } else if (formData.age < 0 || formData.age > 120) {
            newErrors.age = 'Please enter a valid age';
        } else if (formData.age >= 12) {
            newErrors.age = 'Children 12 and older must register themselves. Only children under 12 can be added by parents.';
        }

        if (!formData.academic_level) {
            newErrors.academic_level = 'Academic level is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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

    const handleSelectChange = (value) => {
        setFormData(prev => ({
            ...prev,
            academic_level: value
        }));

        if (errors.academic_level) {
            setErrors(prev => ({
                ...prev,
                academic_level: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const childData = {
                parent_user_id: parentUserId,
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                age: parseInt(formData.age),
                academic_level: formData.academic_level
            };

            const data = await addChildToParent(childData);
            onChildAdded(data.studentUser);
            resetForm();
            toast.success('Child added successfully!');
            
            // Trigger a refresh of parent data in the context
            // This will update the sidebar stats and other components
            window.dispatchEvent(new CustomEvent('parentDataUpdated'));
        } catch (error) {
            // console.error('Error adding child:', error);
            toast.error(error.message || 'An error occurred while adding your child');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            password: '',
            confirmPassword: '',
            age: '',
            academic_level: ''
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px] mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                        Add Your Child
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Create a tutoring account for your child. Children under 12 can be added by parents.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="full_name" className="text-xs sm:text-sm">Full Name *</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="Enter child's full name"
                                className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.full_name ? 'border-red-500' : ''}`}
                            />
                            {errors.full_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
                            )}
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="age" className="text-xs sm:text-sm">Age *</Label>
                            <Input
                                id="age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleInputChange}
                                placeholder="Enter age"
                                min="0"
                                max="11"
                                className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.age ? 'border-red-500' : ''}`}
                            />
                            {errors.age && (
                                <p className="text-xs text-red-500 mt-1">{errors.age}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="email" className="text-xs sm:text-sm">Email Address *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter child's email address"
                            className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="academic_level" className="text-xs sm:text-sm">Academic Level *</Label>
                        <Select value={formData.academic_level} onValueChange={handleSelectChange}>
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
                        {errors.academic_level && (
                            <p className="text-xs text-red-500 mt-1">{errors.academic_level}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="password" className="text-xs sm:text-sm">Password *</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Create a password"
                                className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.password ? 'border-red-500' : ''}`}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm password"
                                className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            <strong>Note:</strong> Your child will have their own login credentials and can access the student dashboard independently.
                        </p>
                    </div>

                    <div className="flex flex-col xs:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="w-full xs:w-auto text-xs sm:text-sm h-9"
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full xs:w-auto text-xs sm:text-sm h-9 flex items-center gap-2"
                            size="sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Add Child
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddChildModal;