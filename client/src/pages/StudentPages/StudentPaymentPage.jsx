import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubject } from '../../hooks/useSubject';
import { BASE_URL } from '@/config';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/use-toast';
import { ArrowLeft, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';

const StudentPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { getAuthToken, user } = useAuth();
    const { subjects, academicLevels, fetchSubjectRelatedToAcademicLevels} = useSubject();

    const [loading, setLoading] = useState(false);
    const [tutor, setTutor] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [selectedAcademicLevelData, setSelectedAcademicLevelData] = useState(null);
    const [paymentData, setPaymentData] = useState({
        subject: '',
        academic_level: '',
        payment_type: 'hourly', // 'hourly' or 'monthly'
        hours_per_month: 8, // for monthly payment
        notes: ''
    });

    useEffect(() => {
        if (location.state?.tutor) {
            setTutor(location.state.tutor);
        } else {
            // If no tutor data, redirect back
            navigate('/student/tutor-search');
        }

        if (user?._id) {
            getStudentProfile();
            fetchSubjectRelatedToAcademicLevels(academicLevels.map(level => level._id));
        }
    }, [location.state, user, academicLevels]);

    // Auto-select first academic level when tutor data loads
    useEffect(() => {
        if (tutor?.academic_levels_taught && tutor.academic_levels_taught.length > 0) {
            const firstLevel = tutor.academic_levels_taught[0];
            setPaymentData(prev => ({ ...prev, academic_level: firstLevel.educationLevel }));
            setSelectedAcademicLevelData(firstLevel);
        }
    }, [tutor]);

    const getStudentProfile = async () => {
        try {
            if (!user?._id) return;

            const response = await fetch(`${BASE_URL}/api/auth/student/profile/${user._id}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch student profile: ${response.status}`);
            }

            const data = await response.json();
            setStudentProfile(data.student);
        } catch (error) {
            console.error('Error fetching student profile:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setPaymentData(prev => ({ ...prev, [field]: value }));
        
        // If academic level is selected, find the corresponding tutor data
        if (field === 'academic_level') {
            const tutorLevel = tutor?.academic_levels_taught?.find(level => level.educationLevel === value);
            setSelectedAcademicLevelData(tutorLevel);
        }
    };

    const calculateTotalPrice = () => {
        if (!selectedAcademicLevelData?.hourlyRate) return 0;

        if (paymentData.payment_type === 'hourly') {
            return selectedAcademicLevelData.hourlyRate;
        } else {
            return selectedAcademicLevelData.hourlyRate * paymentData.hours_per_month;
        }
    };

    const handlePaymentSubmit = async () => {
        if (!paymentData.subject || !paymentData.academic_level) {
            toast({
                title: "Error",
                description: "Please select subject and academic level",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const token = getAuthToken();

            // Map academic_level name to ID from global academicLevels
            let academic_level_id = null;
            if (paymentData.academic_level) {
                const match = (academicLevels || []).find(l => l.level === paymentData.academic_level || l._id === paymentData.academic_level);
                if (match) academic_level_id = match._id;
            }

            const response = await fetch(`${BASE_URL}/api/auth/tutors/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tutor_user_id: tutor.user_id._id,
                    student_user_id: user._id,
                    subject: paymentData.subject,
                    academic_level_id,
                    notes: paymentData.notes,
                    payment_type: paymentData.payment_type,
                    hours_per_month: paymentData.payment_type === 'monthly' ? paymentData.hours_per_month : undefined
                })
            });

            const data = await response.json();
            const status = response.status;

            if (status === 400) {
                toast({
                    title: "Warning",
                    description: data.message,
                });
            } else if (status === 200) {
                toast({
                    title: "Success",
                    description: "Payment processed and tutor hired successfully!",
                });
                // Redirect to student dashboard
                navigate('/student-dashboard/');
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process payment",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getSubjectName = (subjectId) => {
        const subject = subjects.find(subject => subject._id === subjectId);
        return subject?.name;
    };

    const getAcademicLevelName = (academicLevelId) => {
        const academicLevel = academicLevels.find(level => level._id === academicLevelId);
        return academicLevel;
    };

    if (!tutor) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutor Not Found</h2>
                        <Button onClick={() => navigate('/student/tutor-search')}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
                            <p className="text-gray-600 mt-1">Hire {tutor.user_id.full_name} for tutoring services</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Payment Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Payment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Subject Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        {(() => {
                                            const tutorSubjects = Array.isArray(tutor?.subjects) ? tutor.subjects : [];
                                            const subjectOptions = Array.from(new Set([...(tutorSubjects || [])].filter(Boolean)));
                                            return (
                                                <Select value={paymentData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select subject" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjectOptions.map((subject, index) => (
                                                            <SelectItem key={index} value={subject}>{getSubjectName(subject)}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            );
                                        })()}
                                    </div>

                                    {/* Academic Level Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                                        {(() => {
                                            // Ensure we have array of objects
                                            const tutorLevels = Array.isArray(tutor?.academic_levels_taught) ? tutor.academic_levels_taught : [];


                                            return (
                                                <Select
                                                    value={paymentData.academic_level}
                                                    onValueChange={(value) => handleInputChange('academic_level', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select academic level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tutorLevels.map((level, index) => (
                                                            <SelectItem key={index} value={level.educationLevel}>
                                                                {getAcademicLevelName(level.educationLevel)?.level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            );
                                        })()}

                                    </div>

                                    {/* Payment Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentData.payment_type === 'hourly'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => handleInputChange('payment_type', 'hourly')}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                    <span className="font-medium">Hourly Payment</span>
                                                </div>
                                                <p className="text-sm text-gray-600">Pay per session</p>
                                            </div>

                                            <div
                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentData.payment_type === 'monthly'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => handleInputChange('payment_type', 'monthly')}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="w-5 h-5 text-blue-600" />
                                                    <span className="font-medium">Monthly Payment</span>
                                                </div>
                                                <p className="text-sm text-gray-600">Pay monthly for multiple sessions</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hours per month for monthly payment
                                    {paymentData.payment_type === 'monthly' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Hours per Month</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="40"
                                                value={paymentData.hours_per_month}
                                                onChange={(e) => handleInputChange('hours_per_month', parseInt(e.target.value))}
                                                className="w-full"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Select the number of hours you want per month</p>
                                        </div>
                                    )} */}

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                                        <Input
                                            type="text"
                                            placeholder="Any specific topics or requirements..."
                                            value={paymentData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        onClick={handlePaymentSubmit}
                                        disabled={!paymentData.subject || !paymentData.academic_level || loading}
                                        className="w-full py-3"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                Complete Payment
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Tutor Info */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-lg">
                                                {tutor.user_id.full_name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{tutor.user_id.full_name}</h3>
                                            <p className="text-sm text-gray-600">Tutor</p>
                                        </div>
                                    </div>

                                    {/* Rate Info */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Hourly Rate:</span>
                                            <span className="font-semibold">
                                                £{selectedAcademicLevelData?.hourlyRate || 'Select Academic Level'}
                                            </span>
                                        </div>

                                        {selectedAcademicLevelData?.totalSessionsPerMonth && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total Sessions per Month:</span>
                                                <span className="font-semibold">{selectedAcademicLevelData.totalSessionsPerMonth}</span>
                                            </div>
                                        )}

                                        {/* {paymentData.payment_type === 'monthly' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Hours per Month:</span>
                                                <span className="font-semibold">{paymentData.hours_per_month}</span>
                                            </div>
                                        )} */}

                                        <div className="border-t pt-3">
                                            <div className="flex justify-between items-center text-lg font-bold">
                                                <span>Total:</span>
                                                <span className="text-blue-600">
                                                    £{selectedAcademicLevelData?.hourlyRate ? calculateTotalPrice() : 'Select Academic Level'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {paymentData.payment_type === 'hourly' ? 'Per session' : 'Per month'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium text-gray-900 mb-2">What's Included:</h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                Personalized tutoring sessions
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                Expert subject knowledge
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                Flexible scheduling
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                Progress tracking
                                            </li>
                                        </ul>
                                    </div>

                                   
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

    );
};

export default StudentPaymentPage;
