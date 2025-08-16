import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, PlusCircle, Trash2, Save } from 'lucide-react';
import { Badge } from '../ui/badge';

function calculateMonthlyRate(hourlyRate, totalSessionsPerMonth, discount) {
    const gross = Number(hourlyRate || 0) * Number(totalSessionsPerMonth || 0);
    const discountAmount = (gross * Number(discount || 0)) / 100;
    return Math.max(0, gross - discountAmount);
}

const TutorSetting = () => {
    const { user, getAuthToken } = useAuth();
    const token = getAuthToken();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [educationLevels, setEducationLevels] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedLevelId, setSelectedLevelId] = useState('');
    const [adding, setAdding] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const levelsById = useMemo(() => {
        const map = new Map();
        educationLevels.forEach(l => map.set(String(l._id), l));
        return map;
    }, [educationLevels]);

    // Get available levels that haven't been added yet
    const availableLevels = useMemo(() => {
        return educationLevels.filter(el => 
            !levels.some(l => String(l.educationLevelId) === String(el._id))
        );
    }, [educationLevels, levels]);

    useEffect(() => {
        if (!user?._id) return;
        loadData();
    }, [user]);

    async function loadData() {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/tutor/settings/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to fetch');

            const { educationLevels, currentSettings, subjects } = json.data || {};
            setEducationLevels(educationLevels || []);
            setSubjects(subjects || []);
            const enriched = (currentSettings || []).map(s => ({
                ...s,
                isSaved: true,
                isTutorCanChangeRate: levelsById.get(String(s.educationLevelId))?.isTutorCanChangeRate !== false
            }));
            setLevels(enriched);
        } catch (e) {
            console.error(e);
                toast({
                title: 'Error', 
                description: e.message || 'Failed to load settings', 
                variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    }

    function onFieldChange(educationLevelId, field, value) {
        setLevels(prev => prev.map(l => 
            l.educationLevelId === educationLevelId ? { 
                ...l, 
                [field]: Number(value) || 0 
            } : l
        ));
    }

    async function addLevel() {
        if (!selectedLevelId) {
            toast({ 
                title: 'Error', 
                description: 'Please select an education level', 
                variant: 'destructive' 
            });
            return;
        }

        const levelDoc = levelsById.get(String(selectedLevelId));
        if (!levelDoc) return;

        try {
            setAdding(true);
            const body = {
                educationLevelId: selectedLevelId,
                hourlyRate: levelDoc.hourlyRate || 0,
                totalSessionsPerMonth: levelDoc.totalSessionsPerMonth || 0,
                discount: levelDoc.discount || 0
            };
            
            const res = await fetch(`${BASE_URL}/api/tutor/settings/${user._id}/level`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            });
            
            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to add level');
            
            toast({ 
                title: 'Success', 
                description: `${levelDoc.level} added successfully` 
            });
            
            setSelectedLevelId('');
            // Optimistically update the UI
            setLevels(prev => [...prev, {
                ...body,
                educationLevelName: levelDoc.level,
                isSaved: true,
                isTutorCanChangeRate: levelDoc.isTutorCanChangeRate !== false
            }]);
        } catch (e) {
            console.error(e);
            toast({ 
                title: 'Error', 
                description: e.message || 'Failed to add level', 
                variant: 'destructive' 
            });
        } finally {
            setAdding(false);
        }
    }

    async function updateLevel(level) {
        try {
            setSavingId(level.educationLevelId);
            const payload = [{
                educationLevelId: level.educationLevelId,
                hourlyRate: Number(level.hourlyRate) || 0,
                totalSessionsPerMonth: Number(level.totalSessionsPerMonth) || 0,
                discount: Number(level.discount) || 0
            }];
            
            const res = await fetch(`${BASE_URL}/api/tutor/settings/update/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ academicLevelSettings: payload })
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to update');
            
                toast({
                title: 'Success', 
                description: `${level.educationLevelName} updated` 
            });
            
            // Optimistically update the UI
            setLevels(prev => prev.map(l => 
                l.educationLevelId === level.educationLevelId ? { ...l, isSaved: true } : l
            ));
        } catch (e) {
            console.error(e);
                toast({
                title: 'Error', 
                description: e.message || 'Failed to update', 
                variant: 'destructive' 
            });
        } finally {
            setSavingId(null);
        }
    }

    async function removeLevel(level) {
        try {
            setDeletingId(level.educationLevelId);
            const res = await fetch(`${BASE_URL}/api/tutor/settings/delete/${user._id}/level/${level.educationLevelId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to remove');
            
            toast({ 
                title: 'Success', 
                description: `${level.educationLevelName} removed` 
            });
            
            // Optimistically update the UI
            setLevels(prev => prev.filter(l => l.educationLevelId !== level.educationLevelId));
        } catch (e) {
            console.error(e);
            toast({
                title: 'Error', 
                description: e.message || 'Failed to remove', 
                variant: 'destructive' 
            });
        } finally {
            setDeletingId(null);
        }
        }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-gray-600">Loading your settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Tutor Settings</h1>
                    <p className="text-gray-600">Manage your education levels, rates, and subjects</p>
                </div>

                {/* Subjects Section */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Subjects Taught</CardTitle>
                        <CardDescription>Your current subject specializations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {subjects.length > 0 ? (
                                subjects.map((subject, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="px-3 py-1 text-sm"
                                    >
                                        {subject}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-gray-500">No subjects assigned yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Add Level Section */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Add Education Level</CardTitle>
                        <CardDescription>
                            Select a level to add to your profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <Label htmlFor="add-level">Education Level</Label>
                                <Select
                                    value={selectedLevelId}
                                    onValueChange={setSelectedLevelId}
                                    disabled={availableLevels.length === 0}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={
                                            availableLevels.length === 0 
                                                ? "No available levels to add" 
                                                : "Select a level"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLevels.map(level => (
                                            <SelectItem 
                                                key={level._id} 
                                                value={level._id}
                                            >
                                                {level.level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button 
                                onClick={addLevel} 
                                disabled={!selectedLevelId || adding || availableLevels.length === 0}
                                className="w-full sm:w-auto"
                            >
                                {adding ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Level
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Levels Section */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Your Education Levels</CardTitle>
                        <CardDescription>
                            Manage rates and settings for each level
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {levels.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 mb-4">You haven't added any education levels yet</p>
                                <Button 
                                    variant="outline"
                                    onClick={() => setSelectedLevelId(availableLevels[0]?._id || '')}
                                    disabled={availableLevels.length === 0}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Your First Level
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {levels.map((level, idx) => {
                                    const monthlyRate = calculateMonthlyRate(
                                        level.hourlyRate,
                                        level.totalSessionsPerMonth,
                                        level.discount
                                    );
                                    const locked = level.isTutorCanChangeRate === false;

                                    return (
                                        <div 
                                            key={level.educationLevelId} 
                                            className="border rounded-lg p-4 bg-white shadow-sm"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {level.educationLevelName}
                                            </h3>
                                                    {locked && (
                                                        <p className="text-sm text-amber-600 mt-1">
                                                            Rates are managed by admin and cannot be changed
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeLevel(level)}
                                                        disabled={deletingId === level.educationLevelId}
                                                    >
                                                        {deletingId === level.educationLevelId ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                        )}
                                                        Remove
                                                    </Button>
                                            <Button 
                                                size="sm"
                                                        onClick={() => updateLevel(level)}
                                                        disabled={
                                                            savingId === level.educationLevelId || 
                                                            locked ||
                                                            (level.isSaved && !Object.keys(level).some(k => 
                                                                ['hourlyRate', 'totalSessionsPerMonth', 'discount'].includes(k) && 
                                                                level[k] !== levelsById.get(String(level.educationLevelId))?.[k]
                                                            )
                                                        )}
                                                    >
                                                        {savingId === level.educationLevelId ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <Save className="h-4 w-4 mr-2" />
                                                        )}
                                                        Save
                                            </Button>
                                                </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                    <Label htmlFor={`hr-${idx}`}>Hourly Rate (£)</Label>
                                                <Input
                                                        id={`hr-${idx}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                        value={level.hourlyRate}
                                                        onChange={(e) => onFieldChange(level.educationLevelId, 'hourlyRate', e.target.value)}
                                                        disabled={locked}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                    <Label htmlFor={`ts-${idx}`}>Monthly Sessions</Label>
                                                <Input
                                                        id={`ts-${idx}`}
                                                    type="number"
                                                    min="0"
                                                        value={level.totalSessionsPerMonth}
                                                        onChange={(e) => onFieldChange(level.educationLevelId, 'totalSessionsPerMonth', e.target.value)}
                                                        disabled={locked}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                    <Label htmlFor={`dc-${idx}`}>Discount (%)</Label>
                                                <Input
                                                        id={`dc-${idx}`}
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                        value={level.discount}
                                                        onChange={(e) => onFieldChange(level.educationLevelId, 'discount', e.target.value)}
                                                        disabled={locked}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Monthly Rate (£)</Label>
                                                    <div className="mt-1 p-2 bg-gray-50 border rounded-md text-gray-700 font-medium">
                                                        {monthlyRate.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TutorSetting;