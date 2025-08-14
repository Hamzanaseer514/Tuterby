import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';

const TutorSetting = () => {
    const { user , getAuthToken } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    const [editedSettings, setEditedSettings] = useState([]);
    const token = getAuthToken();
    useEffect(() => {
        if (user?._id) {
            fetchTutorSettings();
        }
    }, [user]);

    const fetchTutorSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/tutor/settings/${user._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setSettings(data.data);
                setEditedSettings(data.data.currentSettings);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to fetch settings",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast({
                title: "Error",
                description: "Failed to fetch settings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (levelId, field, value) => {
        setEditedSettings(prev => 
            prev.map(setting => 
                setting.educationLevelId === levelId 
                    ? { ...setting, [field]: parseFloat(value) || 0 }
                    : setting
            )
        );
    };

    const calculateMonthlyRate = (hourlyRate, totalSessions, discount) => {
        const gross = hourlyRate * totalSessions;
        const discountAmount = (gross * discount) / 100;
        return gross - discountAmount;
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Calculate monthly rates for all settings
            const settingsWithMonthlyRates = editedSettings.map(setting => ({
                ...setting,
                monthlyRate: calculateMonthlyRate(
                    setting.hourlyRate, 
                    setting.totalSessionsPerMonth, 
                    setting.discount
                )
            }));

            const response = await fetch(`${BASE_URL}/api/tutor/settings/update/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    academicLevelSettings: settingsWithMonthlyRates
                })
            });

            const data = await response.json();
            
            if (data.success) {
                toast({
                    title: "Success",
                    description: "Settings updated successfully",
                });
                // Refresh the data
                fetchTutorSettings();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update settings",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast({
                title: "Error",
                description: "Failed to update settings",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor Settings</h1>
                    <p className="text-gray-600">No settings found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Settings</h1>
                    <p className="text-gray-600">Manage your tutoring rates and session configurations</p>
                </div>

                {/* Subjects Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Subjects Taught</CardTitle>
                        <CardDescription>Your current subject specializations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {settings.subjects && settings.subjects.length > 0 ? (
                                settings.subjects.map((subject, index) => (
                                    <Badge key={index} variant="secondary" className="text-sm">
                                        {subject}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-gray-500">No subjects assigned yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Education Levels and Rates Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Education Levels & Rates</CardTitle>
                        <CardDescription>
                            Configure your hourly rates, monthly sessions, and discounts for each education level
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {editedSettings.length > 0 ? (
                            <div className="space-y-6">
                                {editedSettings.map((setting, index) => (
                                    <div key={setting.educationLevelId} className="border rounded-lg p-6 bg-gray-50">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {setting.educationLevelName}
                                            </h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <Label htmlFor={`hourlyRate-${index}`}>Hourly Rate (£)</Label>
                                                <Input
                                                    id={`hourlyRate-${index}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={setting.hourlyRate}
                                                    onChange={(e) => handleRateChange(setting.educationLevelId, 'hourlyRate', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor={`totalSessions-${index}`}>Monthly Sessions</Label>
                                                <Input
                                                    id={`totalSessions-${index}`}
                                                    type="number"
                                                    min="0"
                                                    value={setting.totalSessionsPerMonth}
                                                    onChange={(e) => handleRateChange(setting.educationLevelId, 'totalSessionsPerMonth', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor={`discount-${index}`}>Discount (%)</Label>
                                                <Input
                                                    id={`discount-${index}`}
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={setting.discount}
                                                    onChange={(e) => handleRateChange(setting.educationLevelId, 'discount', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label>Monthly Rate (£)</Label>
                                                <div className="mt-1 p-2 bg-white border rounded-md text-gray-700 font-medium">
                                                    {calculateMonthlyRate(
                                                        setting.hourlyRate, 
                                                        setting.totalSessionsPerMonth, 
                                                        setting.discount
                                                    ).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="flex justify-end pt-4">
                                    <Button 
                                        onClick={handleSave} 
                                        disabled={saving}
                                        className="px-8"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">
                                No education levels configured yet
                            </p>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default TutorSetting;