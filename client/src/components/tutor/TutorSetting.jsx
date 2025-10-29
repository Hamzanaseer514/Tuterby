import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '@/config';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, PlusCircle, Trash2, Save } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useSubject } from '../../hooks/useSubject';

function calculateMonthlyRate(hourlyRate, totalSessionsPerMonth, discount) {
    const gross = Number(hourlyRate || 0) * Number(totalSessionsPerMonth || 0);
    const discountAmount = (gross * Number(discount || 0)) / 100;
    return Math.max(0, gross - discountAmount);
}

const TutorSetting = () => {
    const { user, getAuthToken, fetchWithAuth } = useAuth();
    const token = getAuthToken();
    const { toast } = useToast();
    const { subjects, academicLevels, subjectRelatedToAcademicLevels, fetchSubjectRelatedToAcademicLevels } = useSubject();
    const [loading, setLoading] = useState(true);
    const [educationLevels, setEducationLevels] = useState([]);
    const [subjectIds, setSubjectIds] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedLevelId, setSelectedLevelId] = useState('');
    const [adding, setAdding] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [levelToRemove, setLevelToRemove] = useState({ level: null, relatedSubjectNames: [], relatedSubjectCount: 0 });
    const [confirmSubjectOpen, setConfirmSubjectOpen] = useState(false);
    const [subjectToRemove, setSubjectToRemove] = useState({ id: null, name: '' });

    const levelsById = useMemo(() => {
        const map = new Map();
        educationLevels.forEach(l => map.set(String(l._id), l));
        return map;
    }, [educationLevels]);
    const getSubjectName = (subjectId) => {
        const subject = subjects.find(s => s._id === subjectId);
        return subject ? subject : 'Unknown Subject';
     }
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

    // When a level is selected, fetch its related subjects and reset selection
    useEffect(() => {
        if (selectedLevelId) {
            fetchSubjectRelatedToAcademicLevels([selectedLevelId]);
            setSelectedSubjects([]);
        }
    }, [selectedLevelId]);

    async function loadData() {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${BASE_URL}/api/tutor/settings/${user._id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }, token, (newToken) => localStorage.setItem("authToken", newToken));
            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to fetch');

            const { educationLevels, currentSettings, subjects } = json.data || {};
            setEducationLevels(educationLevels || []);
            setSubjectIds(subjects || []);
            const enriched = (currentSettings || []).map(s => ({
                ...s,
                isSaved: true,
                isTutorCanChangeRate: levelsById.get(String(s.educationLevelId))?.isTutorCanChangeRate !== false
            }));
            setLevels(enriched);
        } catch (e) {
            // console.error(e);
            //     toast({
            //     title: 'Error', 
            //     description: e.message || 'Failed to load settings', 
            //     variant: 'destructive' 
            // });
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
                discount: levelDoc.discount || 0,
                subjects: selectedSubjects || []
            };

            const res = await fetchWithAuth(`${BASE_URL}/api/tutor/settings/${user._id}/level`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(body)
            }, token, (newToken) => localStorage.setItem("authToken", newToken));
            
            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to add level');
            
            toast({ 
                title: 'Success', 
                description: `${levelDoc.level} added successfully` 
            });
            
            setSelectedLevelId('');
            // Merge selected subjects into local subjectIds for immediate feedback
            if (selectedSubjects && selectedSubjects.length > 0) {
                setSubjectIds(prev => Array.from(new Set([...(prev || []), ...selectedSubjects])));
            }
            // Optimistically update the UI
            setLevels(prev => [...prev, {
                ...body,
                educationLevelName: levelDoc.level,
                isSaved: true,
                isTutorCanChangeRate: levelDoc.isTutorCanChangeRate !== false
            }]);
        } catch (e) {
            // console.error(e);
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

            const res = await fetchWithAuth(`${BASE_URL}/api/tutor/settings/update/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ academicLevelSettings: payload })
            }, token, (newToken) => localStorage.setItem("authToken", newToken));

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
            // console.error(e);
                toast({
                title: 'Error', 
                description: e.message || 'Failed to update', 
                variant: 'destructive' 
            });
        } finally {
            setSavingId(null);
        }
    }

    function promptRemove(level) {
        const subjectsForLevel = (subjects || []).filter(s => String(s.level_id?._id || s.level_id) === String(level.educationLevelId));
        // Count only subjects that are actually in tutor's profile
        const tutorSubjectIdSet = new Set((subjectIds || []).map(id => String(id)));
        const relatedInTutorProfile = subjectsForLevel.filter(s => tutorSubjectIdSet.has(String(s._id)));
        const names = relatedInTutorProfile.map(s => s.name).filter(Boolean);
        setLevelToRemove({ level, relatedSubjectNames: names, relatedSubjectCount: names.length });
        setConfirmOpen(true);
    }

    async function removeLevel() {
        if (!levelToRemove?.level) return;
        try {
            const { level, relatedSubjectNames, relatedSubjectCount } = levelToRemove;
            setConfirmOpen(false);
            setDeletingId(level.educationLevelId);
            const res = await fetchWithAuth(`${BASE_URL}/api/tutor/settings/delete/${user._id}/level/${level.educationLevelId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            }, token, (newToken) => localStorage.setItem("authToken", newToken));
            
            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Failed to remove');
            
            toast({ 
                title: 'Success', 
                description: relatedSubjectCount > 0 
                    ? `${level.educationLevelName} removed. Also removed subjects: ${relatedSubjectNames.join(', ')}`
                    : `${level.educationLevelName} removed`
            });
            
            // Optimistically update the UI
            setLevels(prev => prev.filter(l => l.educationLevelId !== level.educationLevelId));
            // Also remove subjects for this level locally
            if ((subjects || []).length > 0) {
                const levelSubjectIds = subjects
                    .filter(s => String(s.level_id?._id || s.level_id) === String(level.educationLevelId))
                    .map(s => s._id);
                if (levelSubjectIds.length > 0) {
                    setSubjectIds(prev => (prev || []).filter(id => !levelSubjectIds.includes(id)));
                }
            }
        } catch (e) {
            // console.error(e);
            toast({
                title: 'Error', 
                description: e.message || 'Failed to remove', 
                variant: 'destructive' 
            });
        } finally {
            setDeletingId(null);
            setLevelToRemove(null);
        }
        }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                    <p className="text-gray-600 text-sm sm:text-base text-center">Loading your settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                {/* Header Section */}
                <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Tutor Settings</h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600">Manage your education levels, rates, and subjects</p>
                </div>

                {/* Subjects Section */}
                <Card className="shadow-sm">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl md:text-2xl">Subjects Taught</CardTitle>
                        <CardDescription className="text-sm sm:text-base">Your current subject specializations</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {subjectIds.length > 0 ? (
                                subjectIds.map((subjectId, index) => {
                                    const s = getSubjectName(subjectId);
                                    return (
                                        <div key={index} className="flex items-center gap-2">
                                            <Badge 
                                                variant="secondary" 
                                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm break-words"
                                            >
                                                {s?.name} - {s?.subject_type?.name} - {s?.level_id?.level}
                                            </Badge>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() => {
                                                    setSubjectToRemove({ id: subjectId, name: s?.name || 'this subject' });
                                                    setConfirmSubjectOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" /> 
                                            </Button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-sm sm:text-base">No subjects assigned yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Add Level Section */}
                <Card className="shadow-sm">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl md:text-2xl">Add Education Level</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Select a level to add to your profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-end">
                            <div className="flex-1 w-full">
                                <Label htmlFor="add-level" className="text-sm sm:text-base font-medium">Education Level</Label>
                                <Select
                                    value={selectedLevelId}
                                    onValueChange={setSelectedLevelId}
                                    disabled={availableLevels.length === 0}
                                >
                                    <SelectTrigger className="mt-1 sm:mt-2 text-sm sm:text-base">
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
                                className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
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

                        {/* Related Subjects for selected level */}
                        {selectedLevelId && (
                            <div className="mt-4 sm:mt-6">
                                <Label className="text-sm sm:text-base font-medium mb-2 block">Select Subjects for this Level</Label>
                                <div className="max-h-56 overflow-auto border rounded-md p-3 bg-white">
                                    {(subjectRelatedToAcademicLevels || []).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {subjectRelatedToAcademicLevels
                                                .filter(s => String(s.level_id?._id || s.level_id) === String(selectedLevelId))
                                                .map((subj) => {
                                                    const id = subj._id;
                                                    const checked = selectedSubjects.includes(id);
                                                    return (
                                                        <label key={id} className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    setSelectedSubjects(prev => {
                                                                        if (e.target.checked) return Array.from(new Set([...(prev || []), id]));
                                                                        return (prev || []).filter(sid => sid !== id);
                                                                    });
                                                                }}
                                                            />
                                                            <span>{subj.name}</span>
                                                        </label>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No subjects found for this level.</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Selected subjects will be added to your profile locally after adding the level.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Levels Section */}
                <Card className="shadow-sm">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl md:text-2xl">Your Education Levels</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Manage rates and settings for each level
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {levels.length === 0 ? (
                            <div className="py-8 sm:py-12 text-center">
                                <p className="text-gray-500 mb-4 text-sm sm:text-base">You haven't added any education levels yet</p>
                                <Button 
                                    variant="outline"
                                    onClick={() => setSelectedLevelId(availableLevels[0]?._id || '')}
                                    disabled={availableLevels.length === 0}
                                    className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Your First Level
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
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
                                            className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                                                <div>
                                                    <h3 className="font-semibold text-base sm:text-lg md:text-lg">
                                                        {level.educationLevelName}
                                                    </h3>
                                                    {locked && (
                                                        <p className="text-xs sm:text-xs text-amber-600 mt-1">
                                                            Rates are managed by admin and cannot be changed
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => promptRemove(level)}
                                                        disabled={deletingId === level.educationLevelId}
                                                        className="text-xs sm:text-sm px-3 sm:px-4 py-2"
                                                    >
                                                        {deletingId === level.educationLevelId ? (
                                                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
                                                        className="text-xs sm:text-sm px-3 sm:px-4 py-2"
                                                    >
                                                        {savingId === level.educationLevelId ? (
                                                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                                                        ) : (
                                                            <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                        )}
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                                <div>
                                                    <Label htmlFor={`hr-${idx}`} className="text-sm sm:text-base font-medium">Hourly Rate (£)</Label>
                                                    <Input
                                                        id={`hr-${idx}`}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={level.hourlyRate}
                                                        onChange={(e) => onFieldChange(level.educationLevelId, 'hourlyRate', e.target.value)}
                                                        disabled={locked}
                                                        className="mt-1 sm:mt-2 text-sm sm:text-base"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`ts-${idx}`} className="text-sm sm:text-base font-medium">Monthly Sessions</Label>
                                                    <Input
                                                        id={`ts-${idx}`}
                                                        type="number"
                                                        min="0"
                                                        value={level.totalSessionsPerMonth}
                                                        onChange={(e) => onFieldChange(level.educationLevelId, 'totalSessionsPerMonth', e.target.value)}
                                                        disabled={locked}
                                                        className="mt-1 sm:mt-2 text-sm sm:text-base"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`dc-${idx}`} className="text-sm sm:text-base font-medium">Discount (%)</Label>
                                                    <Input
                                                        id={`dc-${idx}`}
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        value={level.discount}
                                                        onChange={(e) => onFieldChange(level.educationLevelId, 'discount', e.target.value)}
                                                        disabled={locked}
                                                        className="mt-1 sm:mt-2 text-sm sm:text-base"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm sm:text-base font-medium">Monthly Rate (£)</Label>
                                                    <div className="mt-1 sm:mt-2 p-2 sm:p-3 bg-gray-50 border rounded-md text-gray-700 font-medium text-sm sm:text-base">
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
                {/* Remove confirmation dialog */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove education level?</DialogTitle>
                            <DialogDescription>
                                {levelToRemove?.relatedSubjectCount > 0
                                    ? `Removing ${levelToRemove?.level?.educationLevelName} will also remove the following subject(s) from your profile: ${levelToRemove?.relatedSubjectNames.join(', ')}`
                                    : `This will remove ${levelToRemove?.level?.educationLevelName} from your profile.`}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={removeLevel} disabled={!!deletingId}>
                                {deletingId ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Removing...
                                    </>
                                ) : 'Remove'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Remove subject confirmation dialog */}
                <Dialog open={confirmSubjectOpen} onOpenChange={setConfirmSubjectOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove subject?</DialogTitle>
                            <DialogDescription>
                                {`Are you sure you want to remove ${subjectToRemove?.name} from your profile?`}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmSubjectOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    if (!subjectToRemove?.id) return;
                                    try {
                                        const res = await fetchWithAuth(`${BASE_URL}/api/tutor/settings/delete/${user._id}/subject/${subjectToRemove.id}`, {
                                            method: 'DELETE',
                                            headers: { 'Content-Type': 'application/json' }
                                        }, token, (newToken) => localStorage.setItem("authToken", newToken));
                                        const json = await res.json();
                                        if (!json.success) throw new Error(json.message || 'Failed to remove subject');
                                        setSubjectIds(prev => (prev || []).filter(id => id !== subjectToRemove.id));
                                        toast({ title: 'Success', description: `Removed ${subjectToRemove?.name}` });
                                    } catch (err) {
                                        toast({ title: 'Error', description: err.message || 'Failed to remove subject', variant: 'destructive' });
                                    } finally {
                                        setConfirmSubjectOpen(false);
                                        setSubjectToRemove({ id: null, name: '' });
                                    }
                                }}
                            >
                                Remove
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default TutorSetting;