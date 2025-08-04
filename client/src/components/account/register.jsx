import React, { useState } from 'react';
import { Eye, EyeOff, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { UserPlus, Shield, Star } from 'lucide-react';
import { CheckCircle, AlertCircle, FileUp} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [tutorStep, setTutorStep] = useState(1); // 1: Basic Info, 2: Documents, 3: Final Registration
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        phone_number: '',
        role: 'student',
        photo_url: '',
        bio: '',
        qualifications: '',
        experience_years: '',
        subjects: [],
        subjects_taught: [], // New field for subjects they will teach
        academic_levels_taught: [], // New field for academic levels they will teach
        location: '', // New field for tutor's location
        hourly_rate: '', // New field for tutor's hourly rate
        code_of_conduct_agreed: false,
        academic_level: '',
        learning_goals: '',
        preferred_subjects: [],
        availability: [],
    });
    const [documents, setDocuments] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('');
    const [toasts, setToasts] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState('');
    const [userId, setUserId] = useState(null);
    const [requiredDocuments, setRequiredDocuments] = useState([
        { id: 1, type: 'ID Proof', label: 'Upload Government ID', uploaded: false, file: null },
        { id: 2, type: 'Address Proof', label: 'Upload Address Proof', uploaded: false, file: null },
        { id: 3, type: 'Degree', label: 'Upload Highest Degree', uploaded: false, file: null },
        { id: 4, type: 'Certificate', label: 'Upload Teaching Certificate', uploaded: false, file: null },
    ]);

    const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const navigate = useNavigate();

    const documentTypes = ['ID Proof', 'Address Proof', 'Degree', 'Certificate', 'Reference Letter', 'Background Check'];
    const availabilityOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Spanish', 'French', 'German'];
    const academicLevels = ['Primary School', 'Middle School', 'High School', 'College'];
    const teachingLevels = ['GCSE', 'A-Level', 'IB', 'BTEC', 'Undergraduate', 'Primary', 'Secondary'];
    const durationOptions = ['1-2 hours', '3-4 hours', '4-5 hours', '5-6 hours', '6+ hours'];

    const addToast = (title, description) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, title, description }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3000);
    };

    const validateTutorStep1 = () => {
        const requiredFields = ['full_name', 'email', 'password', 'confirmPassword', 'age', 'phone_number', 'bio', 'qualifications', 'experience_years', 'location', 'hourly_rate'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        
        if (formData.subjects_taught.length === 0) {
            setError('Please select at least one subject you will teach');
            return false;
        }
        
        if (formData.academic_levels_taught.length === 0) {
            setError('Please select at least one academic level you will teach');
            return false;
        }
        
        if (!formData.code_of_conduct_agreed) {
            setError('You must agree to the code of conduct');
            return false;
        }
        
        return true;
    };

    const handleTutorNext = () => {
        setError('');
        if (validateTutorStep1()) {
            setTutorStep(2);
            setIsDocDialogOpen(true);
        }
    };

    const handleTutorBack = () => {
        setTutorStep(1);
        setIsDocDialogOpen(false);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTutorStep(1);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubjectChange = (subject, isChecked, field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: isChecked
                ? [...prev[field], subject]
                : prev[field].filter((s) => s !== subject),
        }));
    };

    const handleAvailabilityChange = (day, isChecked) => {
        setFormData((prev) => {
            if (!isChecked) {
                return {
                    ...prev,
                    availability: prev.availability.filter((item) => item.day !== day),
                };
            }
            if (!selectedDuration) {
                addToast('Error', 'Please select a session duration before adding availability');
                return prev;
            }
            return {
                ...prev,
                availability: [
                    ...prev.availability,
                    { day, duration: selectedDuration },
                ],
            };
        });
    };

    const handleDurationChange = (value) => {
        setSelectedDuration(value);
        setFormData((prev) => ({
            ...prev,
            availability: prev.availability.map((item) => ({ ...item, duration: value })),
        }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                addToast('Error', 'Please upload an image file');
                return;
            }
            setFormData((prev) => ({ ...prev, photo_url: file.name }));
            setIsPhotoDialogOpen(false);
            addToast('Success', 'Profile photo uploaded successfully');
        }
    };

    const removePhoto = () => {
        setFormData((prev) => ({ ...prev, photo_url: '' }));
        addToast('Success', 'Profile photo removed');
    };

    const handleFileUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                addToast('Error', 'File size must be less than 10MB');
                return;
            }

            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                addToast('Error', 'Only PDF, JPG, and PNG files are allowed');
                return;
            }

            setRequiredDocuments(prev => prev.map((doc, i) => 
                i === index 
                    ? { ...doc, uploaded: true, file: file, fileName: file.name }
                    : doc
            ));

            setDocuments(prev => {
                const existingIndex = prev.findIndex(doc => doc.type === requiredDocuments[index].type);
                const newDoc = {
                    type: requiredDocuments[index].type,
                    file: file.name,
                    content: file
                };

                if (existingIndex >= 0) {
                    const newDocs = [...prev];
                    newDocs[existingIndex] = newDoc;
                    return newDocs;
                } else {
                    return [...prev, newDoc];
                }
            });

            addToast('Success', `${file.name} uploaded successfully`);
        }
    };

    const removeDocument = (docToRemove) => {
        setDocuments(prev => prev.filter(doc => doc !== docToRemove));
        setRequiredDocuments(prev => prev.map(doc => 
            doc.type === docToRemove.type 
                ? { ...doc, uploaded: false, file: null, fileName: null }
                : doc
        ));
        addToast('Success', 'Document removed successfully');
    };

    const handleNextDocument = () => {
        if (currentDocumentIndex < requiredDocuments.length - 1) {
            setCurrentDocumentIndex(currentDocumentIndex + 1);
        }
    };

    const handlePreviousDocument = () => {
        if (currentDocumentIndex > 0) {
            setCurrentDocumentIndex(currentDocumentIndex - 1);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (activeTab === 'tutor') {
            if (tutorStep === 1) {
                // For tutor step 1, just validate and move to next step
                if (validateTutorStep1()) {
                    setTutorStep(2);
                    setIsDocDialogOpen(true);
                }
                setLoading(false);
                return;
            }
            
            if (!formData.code_of_conduct_agreed) {
                setError('You must agree to the code of conduct');
                setLoading(false);
                return;
            }
        }

        if (activeTab === 'student') {
            if (formData.availability.length === 0) {
                setError('Please select at least one day of availability');
                setLoading(false);
                return;
            }
            if (!selectedDuration) {
                setError('Please select a session duration');
                setLoading(false);
                return;
            }
            const invalidAvailability = formData.availability.some(
                (item) => !durationOptions.includes(item.duration)
            );
            if (invalidAvailability) {
                setError('Invalid duration selected for availability');
                setLoading(false);
                return;
            }
        }

        try {
            let endpoint;
            let payload;

            if (activeTab === 'student') {
                endpoint = 'http://localhost:5000/api/auth/register';
                payload = {
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    age: parseInt(formData.age) || undefined,
                    role: 'student',
                    phone_number: formData.phone_number,
                    photo_url: formData.photo_url,
                    academic_level: formData.academic_level,
                    learning_goals: formData.learning_goals,
                    preferred_subjects: formData.preferred_subjects,
                    availability: formData.availability,
                };
            } else if (activeTab === 'tutor') {
                endpoint = 'http://localhost:5000/api/auth/register-tutor';
                payload = {
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    age: parseInt(formData.age) || undefined,
                    photo_url: formData.photo_url,
                    bio: formData.bio,
                    phone_number: formData.phone_number,
                    qualifications: formData.qualifications,
                    experience_years: parseInt(formData.experience_years) || undefined,
                    subjects: formData.subjects,
                    subjects_taught: formData.subjects_taught,
                    academic_levels_taught: formData.academic_levels_taught,
                    location: formData.location,
                    hourly_rate: parseFloat(formData.hourly_rate) || undefined,
                    code_of_conduct_agreed: formData.code_of_conduct_agreed,
                };
            } else if (activeTab === 'parent') {
                endpoint = 'http://localhost:5000/api/auth/register-parent';
                payload = {
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    age: parseInt(formData.age) || undefined,
                    phone_number: formData.phone_number,
                    role: 'parent',
                    photo_url: formData.photo_url,
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please check your input and try again.');
            }

            if (activeTab === 'tutor') {
                setUserId(data.user._id);
                setIsDocDialogOpen(true);
            } else {
                addToast('Registration Successful', `Welcome, ${formData.full_name}! Your account has been created as a ${activeTab}.`);
                setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    age: '',
                    role: activeTab,
                    photo_url: '',
                    phone_number: '',
                    bio: '',
                    qualifications: '',
                    experience_years: '',
                    subjects: [],
                    subjects_taught: [],
                    academic_levels_taught: [],
                    location: '',
                    hourly_rate: '',
                    code_of_conduct_agreed: false,
                    academic_level: '',
                    learning_goals: '',
                    preferred_subjects: [],
                    availability: [],
                });
                setDocuments([]);
                setSelectedDuration('');
            }

        } catch (err) {
            const errorMessage = err.message.includes('duplicate key error')
                ? 'Email already exists'
                : err.message;
            setError(errorMessage);
            addToast('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentSubmit = async () => {
        if (documents.length === 0) {
            addToast('Error', 'Please upload at least one document');
            return;
        }

        setLoading(true);
        try {
            // First, register the tutor
            const registerResponse = await fetch('http://localhost:5000/api/auth/register-tutor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    age: parseInt(formData.age) || undefined,
                    photo_url: formData.photo_url,
                    bio: formData.bio,
                    phone_number: formData.phone_number,
                    qualifications: formData.qualifications,
                    experience_years: parseInt(formData.experience_years) || undefined,
                    subjects: formData.subjects,
                    subjects_taught: formData.subjects_taught,
                    academic_levels_taught: formData.academic_levels_taught,
                    location: formData.location,
                    hourly_rate: parseFloat(formData.hourly_rate) || undefined,
                    code_of_conduct_agreed: formData.code_of_conduct_agreed,
                }),
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                throw new Error(registerData.message || 'Tutor registration failed');
            }

            // Then upload documents
            const uploadResponse = await fetch('http://localhost:5000/upload-tutor-documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: registerData.user._id,
                    documents,
                }),
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Document upload failed');
            }

            addToast('Registration Successful', `Welcome, ${formData.full_name}! Your account has been created as a tutor. Please log in to access your dashboard.`);
            setIsDocDialogOpen(false);
            setDocuments([]);
            setSelectedDocType('');
            setTutorStep(1);
            setFormData({
                full_name: '',
                email: '',
                password: '',
                confirmPassword: '',
                age: '',
                role: 'tutor',
                phone_number: '',
                photo_url: '',
                bio: '',
                qualifications: '',
                experience_years: '',
                subjects: [],
                subjects_taught: [],
                academic_levels_taught: [],
                location: '',
                hourly_rate: '',
                code_of_conduct_agreed: false,
                academic_level: '',
                learning_goals: '',
                preferred_subjects: [],
                availability: [],
            });
            setSelectedDuration('');
            
            // Add a small delay before redirecting to show the success message
            setTimeout(() => {
                navigate('/login?registrationSuccess=true');
            }, 2000);
        } catch (err) {
            setError(err.message);
            addToast('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToastProvider>
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 mb-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                    <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
                </div>

                <div className="w-full max-w-4xl relative z-10">
                    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-indigo-400 to-purple-600 text-white p-8 relative overflow-hidden">
                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full"></div>
                            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-white/5 rounded-full"></div>

                            <div className="relative z-10 text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="p-3 bg-white/20 rounded-full shadow-lg backdrop-blur-sm">
                                        <UserPlus className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent text-center">
                                    Create Your Account
                                </CardTitle>
                                <CardDescription className="text-blue-100">
                                    Join as a {activeTab} and start your educational journey
                                </CardDescription>

                                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-blue-100">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-200" />
                                        <span>Secure Registration</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-200" />
                                        <span>Trusted Platform</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8 pb-4 bg-gradient-to-br from-blue-50 to-red-50 ">
                            <div className="flex justify-center mb-8">
                                <div className="inline-flex w-[70%] rounded-md shadow-sm" role="group">
                                    <Button
                                        variant={activeTab === 'student' ? 'default' : 'outline'}
                                        onClick={() => handleTabChange('student')}
                                        className="px-6 w-full rounded-r-none border-r-0 hover:text-white hover:bg-gradient-to-br from-indigo-500 to-purple-400"
                                    >
                                        Student
                                    </Button>
                                    <Button
                                        variant={activeTab === 'tutor' ? 'default' : 'outline'}
                                        onClick={() => handleTabChange('tutor')}
                                        className="px-6 w-full rounded-none border-r-0 hover:text-white hover:bg-gradient-to-br from-indigo-500 to-purple-400"
                                    >
                                        Tutor
                                    </Button>
                                    <Button
                                        variant={activeTab === 'parent' ? 'default' : 'outline'}
                                        onClick={() => handleTabChange('parent')}
                                        className="px-6 w-full rounded-l-none hover:text-white hover:bg-gradient-to-br from-indigo-500 to-purple-400"
                                    >
                                        Parent
                                    </Button>
                                </div>
                            </div>
                            {/* Rest of your form content */}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name" className="text-gray-700">Full Name</Label>
                                        <Input
                                            id="full_name"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                            className="focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-gray-700">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                placeholder="••••••••"
                                                className="focus:ring-2 focus:ring-blue-500 pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-500" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-500" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            className="focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-gray-700">Age</Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="number"
                                            value={formData.age}
                                            onChange={handleChange}
                                            required
                                            placeholder="25"
                                            className="focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {activeTab === 'student' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="academic_level" className="text-gray-700">Academic Level</Label>
                                            <Select
                                                value={formData.academic_level}
                                                onValueChange={(value) => setFormData({ ...formData, academic_level: value })}
                                            >
                                                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                                                    <SelectValue placeholder="Select academic level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicLevels.map((level) => (
                                                        <SelectItem key={level} value={level}>
                                                            {level}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {activeTab === 'tutor' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="experience_years" className="text-gray-700">Years of Experience</Label>
                                            <Input
                                                id="experience_years"
                                                name="experience_years"
                                                type="number"
                                                value={formData.experience_years}
                                                onChange={handleChange}
                                                placeholder="3"
                                                className="focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'parent' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="phone_number" className="text-gray-700">Phone Number</Label>
                                            <Input
                                                id="phone_number"
                                                name="phone_number"
                                                type="text"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                placeholder="+1234567890"
                                                className="focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                {(activeTab === 'student' || activeTab === 'tutor') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number" className="text-gray-700">Phone Number</Label>
                                        <Input
                                            id="phone_number"
                                            name="phone_number"
                                            type="text"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            placeholder="+1234567890"
                                            className="focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-gray-700">Profile Photo</Label>
                                    <div className="flex items-center gap-3 w-full">
                                        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="gap-2 w-full">
                                                    <Upload className="h-4 w-4" />
                                                    {formData.photo_url ? 'Change Photo' : 'Upload Photo'}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="text-gray-800">Upload Profile Photo</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <div className="flex flex-col items-center justify-center space-y-2">
                                                            <Upload className="h-8 w-8 text-gray-400" />
                                                            <p className="text-sm text-gray-600">
                                                                Drag and drop your photo here, or click to browse
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                JPG, PNG up to 5MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        {formData.photo_url && (
                                            <>
                                                <span className="text-sm text-gray-600 truncate max-w-xs">{formData.photo_url}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={removePhoto}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {activeTab === 'student' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="learning_goals" className="text-gray-700">Learning Goals</Label>
                                            <Textarea
                                                id="learning_goals"
                                                name="learning_goals"
                                                value={formData.learning_goals}
                                                onChange={handleChange}
                                                placeholder="Describe what you want to achieve through tutoring..."
                                                className="focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Preferred Subjects</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                                {subjects.map((subject) => (
                                                    <div key={subject} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`student-${subject}`}
                                                            checked={formData.preferred_subjects.includes(subject)}
                                                            onCheckedChange={(checked) => handleSubjectChange(subject, checked, 'preferred_subjects')}
                                                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <Label htmlFor={`student-${subject}`} className="text-gray-700 font-normal">
                                                            {subject}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">

                                            <div className="space-y-2">
                                                <Label htmlFor="duration" className="text-gray-700">Session Duration</Label>
                                                <Select
                                                    value={selectedDuration}
                                                    onValueChange={handleDurationChange}
                                                >
                                                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                                                        <SelectValue placeholder="Select session duration" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {durationOptions.map((duration) => (
                                                            <SelectItem key={duration} value={duration}>
                                                                {duration}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Availability</Label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                                    {availabilityOptions.map((day) => (
                                                        <div key={day} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`day-${day}`}
                                                                checked={formData.availability.some((item) => item.day === day)}
                                                                onCheckedChange={(checked) => handleAvailabilityChange(day, checked)}
                                                                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <Label htmlFor={`day-${day}`} className="text-gray-700 font-normal">
                                                                {day}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </>
                                )}

                                {activeTab === 'tutor' && (
                                    <>
                                        {/* Step Indicator */}
                                        <div className="mb-8">
                                            <div className="flex items-center justify-center space-x-4">
                                                <div className={`flex items-center ${tutorStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${tutorStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                                        1
                                                    </div>
                                                    <span className="ml-2 text-sm font-medium">Basic Information</span>
                                                </div>
                                                <div className={`w-12 h-0.5 ${tutorStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                <div className={`flex items-center ${tutorStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${tutorStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                                        2
                                                    </div>
                                                    <span className="ml-2 text-sm font-medium">Documents</span>
                                                </div>
                                                <div className={`w-12 h-0.5 ${tutorStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                <div className={`flex items-center ${tutorStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${tutorStep >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                                        3
                                                    </div>
                                                    <span className="ml-2 text-sm font-medium">Complete</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleChange}
                                                    placeholder="Tell us about your teaching experience and approach..."
                                                    className="focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                                />
                                            </div>

                                            <div className="space-y-2 mt-7">
                                                <Label htmlFor="qualifications" className="text-gray-700">Qualifications</Label>
                                                <Textarea
                                                    id="qualifications"
                                                    name="qualifications"
                                                    value={formData.qualifications}
                                                    onChange={handleChange}
                                                    placeholder="List your degrees, certifications, and relevant qualifications..."
                                                    className="focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                                />
                                            </div>

                                            <div className="space-y-2 mt-6">
                                                <Label className="text-gray-700">Subjects You Teach</Label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                                    {subjects.map((subject) => (
                                                        <div key={subject} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`tutor-${subject}`}
                                                                checked={formData.subjects_taught.includes(subject)}
                                                                onCheckedChange={(checked) => handleSubjectChange(subject, checked, 'subjects_taught')}
                                                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <Label htmlFor={`tutor-${subject}`} className="text-gray-700 font-normal">
                                                                {subject}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-6">
                                                <Label className="text-gray-700">Academic Levels You Teach</Label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                                    {teachingLevels.map((level) => (
                                                        <div key={level} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`level-${level}`}
                                                                checked={formData.academic_levels_taught.includes(level)}
                                                                onCheckedChange={(checked) => handleSubjectChange(level, checked, 'academic_levels_taught')}
                                                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <Label htmlFor={`level-${level}`} className="text-gray-700 font-normal">
                                                                {level}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="location" className="text-gray-700">Location</Label>
                                                    <Input
                                                        id="location"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleChange}
                                                        placeholder="e.g., London, Manchester"
                                                        className="focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="hourly_rate" className="text-gray-700">Hourly Rate (£)</Label>
                                                    <Input
                                                        id="hourly_rate"
                                                        name="hourly_rate"
                                                        type="number"
                                                        value={formData.hourly_rate}
                                                        onChange={handleChange}
                                                        placeholder="e.g., 25"
                                                        className="focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-3 pt-2 mt-6">
                                                <Checkbox
                                                    id="code_of_conduct_agreed"
                                                    name="code_of_conduct_agreed"
                                                    checked={formData.code_of_conduct_agreed}
                                                    onCheckedChange={(checked) =>
                                                        setFormData({ ...formData, code_of_conduct_agreed: checked })
                                                    }
                                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                                />
                                                <div className="space-y-1">
                                                    <Label htmlFor="code_of_conduct_agreed" className="text-gray-700 font-normal">
                                                        I agree to the tutor code of conduct
                                                    </Label>
                                                    <p className="text-sm text-gray-500">
                                                        By checking this box, you agree to maintain professional standards and ethical behavior.
                                                    </p>
                                                </div>
                                            </div>

                                            {documents.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Uploaded Documents</Label>
                                                    <div className="space-y-2">
                                                        {documents.map((doc) => (
                                                            <div key={`${doc.type}-${doc.file}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="bg-blue-100 p-2 rounded-full">
                                                                        <Upload className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-800">{doc.file}</p>
                                                                        <p className="text-xs text-gray-500">{doc.type}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeDocument(doc)}
                                                                    className="text-red-500 hover:text-red-600"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : activeTab === 'tutor' && tutorStep === 1 ? (
                                        'Next: Upload Documents'
                                    ) : activeTab === 'tutor' && tutorStep === 2 ? (
                                        'Register Tutor'
                                    ) : (
                                        `Register as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                                    )}
                                </Button>

                            </form>
                            <CardFooter className="flex justify-center mt-10">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <a href="./login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Login In
                                    </a>
                                </p>
                            </CardFooter>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
                    <DialogContent className="max-w-4xl rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-gray-800">
                                Upload Required Documents
                            </DialogTitle>
                            <p className="text-sm text-gray-500">
                                Please upload all the required documents to complete your tutor registration.
                            </p>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Document requirements list - Horizontal Layout */}
                            <div className="grid grid-cols-2 gap-4">
                                {requiredDocuments.map((doc, index) => (
                                    <div key={index} className="space-y-3">
                                        <div className={`p-4 rounded-lg border ${doc.uploaded ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-800">
                                                        {doc.label}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {doc.type}
                                                    </p>
                                                </div>
                                                {doc.uploaded ? (
                                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload area for each document */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e, index)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                id={`file-upload-${index}`}
                                            />
                                            <label htmlFor={`file-upload-${index}`} className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                                                <Upload className="h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    {doc.uploaded ? 'Replace file' : `Upload ${doc.label}`}
                                                </p>
                                                {doc.uploaded && (
                                                    <p className="text-xs text-green-600">
                                                        {doc.fileName} uploaded
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    PDF, JPG, PNG up to 10MB
                                                </p>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex justify-between pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleTutorBack}
                                    disabled={loading}
                                >
                                    Back to Information
                                </Button>
                                
                                <Button
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    onClick={handleDocumentSubmit}
                                    disabled={loading || !requiredDocuments.every(doc => doc.uploaded)}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Registering...
                                        </span>
                                    ) : (
                                        'Register Tutor'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>



            </div>

            <ToastViewport className="fixed bottom-4 right-4 z-50" />
            {toasts.map(({ id, title, description }) => (
                <Toast key={id} className="bg-white border border-gray-200 shadow-lg rounded-lg">
                    <div className="grid gap-1 p-4">
                        {title && <ToastTitle className="text-gray-800 font-medium">{title}</ToastTitle>}
                        {description && <ToastDescription className="text-gray-600">{description}</ToastDescription>}
                    </div>
                </Toast>
            ))}
        </ToastProvider>
    );
};

export default Register;