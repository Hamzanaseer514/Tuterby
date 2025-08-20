import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubject } from "@/hooks/useSubject";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TutorCreateSessionPage = () => {
    const navigate = useNavigate();
    const { user, getAuthToken } = useAuth();
    const { academicLevels, subjects } = useSubject();
    const authToken = getAuthToken();

    const [availableStudents, setAvailableStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [parsedSubjects, setParsedSubjects] = useState([]);
    const [selectedStudentSubjects, setSelectedStudentSubjects] = useState([]);
    const [selectedStudentAcademicLevels, setSelectedStudentAcademicLevels] = useState([]);
    const [tutorAcademicLevels, setTutorAcademicLevels] = useState([]);

    const [availabilitySettings, setAvailabilitySettings] = useState(null);
    const [displayMonth, setDisplayMonth] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });
    const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState(""); // HH:mm
    const [daySessions, setDaySessions] = useState([]); // existing sessions on selected day
    const [conflictingSlots, setConflictingSlots] = useState([]); // array of HH:mm strings that are conflicting
    const [sessionForm, setSessionForm] = useState({
        student_ids: [],
        subject: "",
        academic_level: "",
        session_date: "", // YYYY-MM-DDTHH:mm
        duration_hours: 1,
        hourly_rate: 0,
        notes: ""
    });

    const getSubjectById = useCallback((id) => {
        if (!id) return undefined;
        const s = (subjects || []).find(s => s?._id?.toString() === id.toString());
        return s;
    }, [subjects]);

    const getLevelById = useCallback((id) => {
        if (!id) return undefined;
        const level = (academicLevels || []).find(l => l?._id === id || l?._id?.toString() === id);
        return level;
        // return (academicLevels || []).find(l => l?._id === id || l?._id?.toString() === id || l?.educationLevel === id);
    }, [academicLevels]);

    // Hourly rate strictly from selected academic level
    useEffect(() => {
        if (!sessionForm.academic_level) {
            setSessionForm(prev => ({ ...prev, hourly_rate: 0 }));
            return;
        }
        const level = getLevelById(sessionForm.academic_level);
        const rate = typeof level?.hourlyRate === 'number' ? level.hourlyRate : 0;
        setSessionForm(prev => ({ ...prev, hourly_rate: rate }));
    }, [sessionForm.academic_level, getLevelById]);

    const fetchTutorSubjects = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/tutor/dashboard/${user?._id}`, {
                headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) return;
            const data = await response.json();
            const field = data?.tutor?.subjects;
            const parsed = Array.isArray(field) ? field : (typeof field === 'string' && field.startsWith('[') ? JSON.parse(field) : []);
            setParsedSubjects(Array.isArray(parsed) ? parsed : []);
            setTutorAcademicLevels(data?.tutor?.academic_levels_taught || []);
        } catch { }
    }, [user, authToken]);

    const fetchAvailableStudents = useCallback(async () => {
        try {
            setLoadingStudents(true);
            const response = await fetch(`${BASE_URL}/api/tutor/students/${user._id}`);
            if (!response.ok) throw new Error('Failed to fetch students');
            const data = await response.json();
            setAvailableStudents(data.students || []);
        } catch (err) {
            toast.error('Failed to load students');
        } finally {
            setLoadingStudents(false);
        }
    }, [user]);

    const fetchAvailabilitySettings = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/tutor/availability/${user?._id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            setAvailabilitySettings(data);
        } catch { }
    }, [user, authToken]);

    useEffect(() => {
        if (!user?._id) return;
        fetchTutorSubjects();
        fetchAvailableStudents();
        fetchAvailabilitySettings();
    }, [user, fetchTutorSubjects, fetchAvailableStudents, fetchAvailabilitySettings]);

    // Build subjects and academic levels from selected students
    const onChangeSelectedStudents = (nextIds) => {
        setSessionForm(prev => ({ ...prev, student_ids: nextIds, subject: prev.subject }));

        const selected = availableStudents.filter(s => nextIds.includes(s._id));
        const subjectsSet = new Set();
        const levelIdSet = new Set();
        selected.forEach(s => {
            if (Array.isArray(s.preferred_subjects)) s.preferred_subjects.forEach(x => subjectsSet.add(x));
            if (Array.isArray(s.academic_level)) s.academic_level.forEach(id => levelIdSet.add(id));
            else if (s.academic_level) levelIdSet.add(s.academic_level);
        });
        setSelectedStudentSubjects(Array.from(subjectsSet));
        const levelObjects = Array.from(levelIdSet).map(id => getLevelById(id)).filter(Boolean);
        setSelectedStudentAcademicLevels(levelObjects);
        // setTutorAcademicLevels(levelObjects);
    };

    const monthDays = useMemo(() => {
        const year = displayMonth.getFullYear();
        const month = displayMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const days = [];
        // prepend blanks
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            days.push(null);
        }
        for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
            days.push(new Date(year, month, d));
        }
        return days;
    }, [displayMonth]);

    const formatLocalYyyyMmDd = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isDaySelectable = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const check = new Date(date);
        check.setHours(0, 0, 0, 0);
        // do not allow past days
        if (check < today) return false;
        if (!availabilitySettings) return true;
        // blackout dates
        if (Array.isArray(availabilitySettings.blackout_dates)) {
            for (const blk of availabilitySettings.blackout_dates) {
                const start = new Date(blk.start_date);
                const end = new Date(blk.end_date);
                if (blk.is_active !== false && check >= new Date(start.toDateString()) && check <= new Date(end.toDateString())) {
                    return false;
                }
            }
        }
        // maximum advance days
        if (availabilitySettings.maximum_advance_days) {
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + availabilitySettings.maximum_advance_days);
            if (check > maxDate) return false;
        }
        // weekday availability
        const dayIndex = check.getDay();
        const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const key = keys[dayIndex];
        const dayAvail = availabilitySettings.general_availability?.[key];
        if (dayAvail && dayAvail.available === false) return false;
        return true;
    };

    const fetchSlotsForDay = useCallback(async (yyyyMmDd, durationHours) => {
        if (!yyyyMmDd || !durationHours) return;
        try {
            setLoadingSlots(true);
            const url = `${BASE_URL}/api/tutor/availability/${user?._id}/slots?date=${yyyyMmDd}&duration_minutes=${durationHours * 60}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Failed to load slots');
            const rawSlots = Array.isArray(data.available_slots) ? data.available_slots : [];
            const timeSet = new Set();
            rawSlots.forEach(s => {
                const d = new Date(s.start);
                if (!Number.isNaN(d.getTime())) {
                    timeSet.add(d.toTimeString().slice(0, 5));
                }
            });
            const times = Array.from(timeSet).sort();

            // Fetch existing sessions for the day and filter conflicting slots
            const startISO = `${yyyyMmDd}T00:00:00Z`;
            const endISO = `${yyyyMmDd}T23:59:59Z`;
            const sessionsRes = await fetch(`${BASE_URL}/api/tutor/sessions/${user?._id}?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const sessionsData = await sessionsRes.json();
            const sessionsList = Array.isArray(sessionsData.sessions) ? sessionsData.sessions : [];
            const blocking = sessionsList.filter(s => ['pending', 'confirmed', 'in_progress'].includes(s.status));
            setDaySessions(blocking);

            const overlapsExisting = (slotTimeStr) => {
                const slotStart = new Date(`${yyyyMmDd}T${slotTimeStr}:00Z`);
                const slotEnd = new Date(slotStart.getTime() + durationHours * 60 * 60 * 1000);
                return blocking.some(s => {
                    const sStart = new Date(s.session_date);
                    const sEnd = new Date(sStart.getTime() + (s.duration_hours || 1) * 60 * 60 * 1000);
                    return slotStart < sEnd && slotEnd > sStart;
                });
            };
            const conflicts = times.filter(t => overlapsExisting(t));
            setAvailableSlots(times);
            setConflictingSlots(conflicts);
        } catch (e) {
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [user, authToken]);

    useEffect(() => {
        if (!selectedDate) return;
        fetchSlotsForDay(selectedDate, sessionForm.duration_hours);
    }, [selectedDate, sessionForm.duration_hours, fetchSlotsForDay]);

    useEffect(() => {
        if (selectedDate && selectedTime) {
            setSessionForm(prev => ({ ...prev, session_date: `${selectedDate}T${selectedTime}` }));
        }
    }, [selectedDate, selectedTime]);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            if (!sessionForm.student_ids || sessionForm.student_ids.length === 0) {
                toast.error('Please select at least one student');
                return;
            }
            if (!sessionForm.session_date) {
                toast.error('Please select a date and time');
                return;
            }

            const response = await fetch(`${BASE_URL}/api/tutor/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tutor_id: user?._id,
                    student_ids: sessionForm.student_ids,
                    subject: sessionForm.subject,
                    academic_level: sessionForm.academic_level,
                    session_date: sessionForm.session_date,
                    duration_hours: sessionForm.duration_hours,
                    hourly_rate: sessionForm.hourly_rate,
                    notes: sessionForm.notes,
                }),
            });
            const responseData = await response.json();
            if (response.status == 401) {
                toast.error(responseData.message || 'This Academic Level is not selected by you. Please add this academic level to your profile.');
                navigate('/tutor-dashboard');
                return;
            }
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to create session');
            }
            toast.success('Session created successfully');
            navigate('/tutor-dashboard');
        } catch (err) {
            toast.error(err.message || 'Failed to create session');
        }
    };

    const monthTitle = useMemo(() => {
        return displayMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
    }, [displayMonth]);

    const allSubjects = useMemo(() => {
        if (!sessionForm.student_ids || sessionForm.student_ids.length === 0) {
            return [];
        }

        // Get subjects for each selected student
        const selectedStudents = availableStudents.filter(s => sessionForm.student_ids.includes(s._id));
        const studentSubjectSets = selectedStudents.map(student => {
            const studentSubjects = Array.isArray(student.preferred_subjects) ? student.preferred_subjects : [];
            return new Set(studentSubjects);
        });

        // Get tutor subjects
        const tutorSubjectIds = new Set(parsedSubjects);

        // Find subjects that exist in ALL students AND tutor
        const commonSubjects = [];
        tutorSubjectIds.forEach(subjectId => {
            // Check if this subject exists in ALL selected students
            const existsInAllStudents = studentSubjectSets.every(studentSet =>
                studentSet.has(subjectId)
            );

            if (existsInAllStudents) {
                commonSubjects.push(subjectId);
            }
        });

        return commonSubjects.sort();
    }, [selectedStudentSubjects, parsedSubjects, sessionForm.student_ids, availableStudents]);

    // const allAcademicLevels = useMemo(() => {
    //     const s = new Set();
    //     selectedStudentAcademicLevels.forEach(x => s.add(x));
    //     // tutorAcademicLevels.forEach(x => s.add(x));
    //     return Array.from(s).sort();
    // }, [selectedStudentAcademicLevels]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>

                        <h1 className="text-3xl font-bold text-gray-900">Create New Session</h1>
                        <p className="text-gray-600">Plan a new tutoring session with your students</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                </div>
                {/* Student Details Summary */}
                {sessionForm.student_ids && sessionForm.student_ids.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5">
                        <h4 className="font-medium text-blue-900 mb-3">Selected Students Summary</h4>
                        
                        {/* Header Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 pb-2 border-b border-blue-200">
                            <div className="font-semibold text-blue-900 text-sm">Name</div>
                            <div className="font-semibold text-blue-900 text-sm">Subjects</div>
                            <div className="font-semibold text-blue-900 text-sm">Academic Level</div>
                            <div className="font-semibold text-blue-900 text-sm">Rate</div>
                        </div>
                        
                        {/* Student Rows */}
                        <div className="space-y-3">
                            {availableStudents
                                .filter(s => sessionForm.student_ids.includes(s._id))
                                .map((student) => {
                                    const studentSubjects = Array.isArray(student.preferred_subjects)
                                        ? student.preferred_subjects
                                        : [];
                                    // Handle different formats of academic_level data
                                    let studentLevels = [];
                                    if (student.academic_level) {
                                        if (Array.isArray(student.academic_level)) {
                                            studentLevels = student.academic_level;
                                        } else if (typeof student.academic_level === 'object') {
                                            // If it's already an object, use it directly
                                            studentLevels = [student.academic_level];
                                        } else if (typeof student.academic_level === 'string') {
                                            // If it's a string, try to parse it or use as ID
                                            try {
                                                const parsed = JSON.parse(student.academic_level);
                                                studentLevels = Array.isArray(parsed) ? parsed : [parsed];
                                            } catch {
                                                studentLevels = [student.academic_level];
                                            }
                                        } else {
                                            studentLevels = [student.academic_level];
                                        }
                                    }

                                    // Get the first academic level for rate calculation
                                    const firstLevel = studentLevels.length > 0 ? studentLevels[0] : null;
                                    let rateDisplay = 'N/A';
                                    
                                    if (firstLevel) {
                                        if (typeof firstLevel === 'object' && firstLevel.hourlyRate) {
                                            rateDisplay = `£${firstLevel.hourlyRate}/hr`;
                                        } else if (typeof firstLevel === 'string' || typeof firstLevel === 'object') {
                                            const level = getLevelById(firstLevel);
                                            if (level?.hourlyRate) {
                                                rateDisplay = `£${level.hourlyRate}/hr`;
                                            }
                                        }
                                    }

                                    return (
                                        <div key={student._id} className="border-l-4 border-blue-300 pl-3 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            
                                            <div className="font-medium text-blue-800">
                                                {student.full_name || student?.user_id?.full_name}
                                            </div>
                                            
                                            <div className="text-sm text-blue-700">
                                                {studentSubjects.length > 0
                                                    ? studentSubjects.map(subjectId => {
                                                        const subject = getSubjectById(subjectId);
                                                        return subject?.name || subjectId;
                                                    }).join(', ')
                                                    : 'No subjects selected'
                                                }
                                            </div>
                                            
                                            <div className="text-sm text-blue-700">
                                                {studentLevels.length > 0
                                                    ? studentLevels.map((levelItem, index) => {
                                                        // Check if levelItem is already an object with level property
                                                        if (typeof levelItem === 'object' && levelItem.level) {
                                                            return levelItem.level;
                                                        }
                                                        // If it's an ID, get the level object
                                                        const level = getLevelById(levelItem);
                                                        return level?.level || levelItem;
                                                    }).join(', ')
                                                    : 'No academic levels selected'
                                                }
                                            </div>
                                            
                                            <div className="text-sm text-blue-700 font-medium">
                                                {rateDisplay}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    <div className="lg:col-span-3 space-y-6">

                        <Card>
                            <CardHeader>
                                <CardTitle>Session Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                <div>
                                    <Label>Select Students</Label>
                                    <div className="border rounded-md p-2 max-h-64 overflow-auto bg-white">
                                        {loadingStudents ? (
                                            <div className="p-2 text-sm text-gray-500">Loading students...</div>
                                        ) : (
                                            (availableStudents || []).map((student) => {
                                                const checked = (sessionForm.student_ids || []).includes(student._id);
                                                return (
                                                    <label key={student._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4"
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                const isChecked = e.target.checked;
                                                                const next = new Set(sessionForm.student_ids || []);
                                                                if (isChecked) next.add(student._id); else next.delete(student._id);
                                                                onChangeSelectedStudents(Array.from(next));
                                                            }}
                                                        />
                                                        <span className="text-sm">{student.full_name || student?.user_id?.full_name}</span>
                                                    </label>
                                                );
                                            })
                                        )}
                                        {(!loadingStudents && availableStudents.length === 0) && (
                                            <div className="p-2 text-sm text-gray-500">No students available</div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">You can select multiple students for a group session.</p>
                                </div>


                                <div>
                                    <Label>Subject</Label>
                                    <Select
                                        value={sessionForm.subject}
                                        onValueChange={(value) => setSessionForm({ ...sessionForm, subject: value })}
                                        disabled={!sessionForm.student_ids || sessionForm.student_ids.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={(sessionForm.student_ids || []).length > 0 ? 'Select subject' : 'Select student(s) first'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allSubjects.length > 0 ? (
                                                allSubjects.map(subject => (
                                                    <SelectItem key={`subject-${subject}`} value={subject}>
                                                        {getSubjectById(subject)?.name || subject}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-gray-500">
                                                    No common subjects found between selected students and your profile
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {allSubjects.length === 0 && sessionForm.student_ids && sessionForm.student_ids.length > 0 && (
                                        <p className="text-sm text-red-600 mt-1">
                                            ⚠️ No common subjects found. Students must have subjects that match your teaching subjects.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Academic Level</Label>
                                    <Select
                                        value={sessionForm.academic_level}
                                        onValueChange={(value) => setSessionForm({ ...sessionForm, academic_level: value })}
                                        disabled={!sessionForm.student_ids || sessionForm.student_ids.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={(sessionForm.student_ids || []).length > 0 ? 'Select academic level' : 'Select student(s) first'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(() => {
                                                if (!sessionForm.student_ids || sessionForm.student_ids.length === 0) {
                                                    return [];
                                                }

                                                // Get academic levels for each selected student
                                                const selectedStudents = availableStudents.filter(s => sessionForm.student_ids.includes(s._id));

                                                // Extract student academic levels and normalize them
                                                const studentLevelSets = selectedStudents.map(student => {
                                                    let studentLevels = [];

                                                    // Check multiple possible field names for academic levels
                                                    const academicLevelField = student.academic_level || student.academic_levels || student.preferred_academic_levels || student.education_level;


                                                    if (academicLevelField) {
                                                        if (Array.isArray(academicLevelField)) {
                                                            studentLevels = academicLevelField;
                                                        } else if (typeof academicLevelField === 'string') {
                                                            // Handle case where it might be a JSON string
                                                            try {
                                                                const parsed = JSON.parse(academicLevelField);
                                                                studentLevels = Array.isArray(parsed) ? parsed : [parsed];
                                                            } catch {
                                                                studentLevels = [academicLevelField];
                                                            }
                                                        } else if (typeof academicLevelField === 'object') {
                                                            // If it's already an object, use it directly
                                                            studentLevels = [academicLevelField];
                                                        } else {
                                                            studentLevels = [academicLevelField];
                                                        }
                                                    }


                                                    // Convert to strings for comparison
                                                    const levelIds = studentLevels.map(level => {
                                                        if (typeof level === 'object') {
                                                            const id = level._id?.toString() || level.id?.toString();
                                                            return id;
                                                        } else {
                                                            return level.toString();
                                                        }
                                                    }).filter(Boolean);


                                                    return new Set(levelIds);
                                                });



                                                const tutorLevelIds = new Set(
                                                    tutorAcademicLevels.map(lvl => {
                                                        const levelId = lvl.educationLevel || lvl._id?.toString() || lvl.id?.toString();
                                                        return levelId;
                                                    }).filter(Boolean)
                                                );

                                                // Find levels that exist in ALL students AND tutor
                                                const commonLevelIds = [];
                                                tutorLevelIds.forEach(levelId => {

                                                    // Check if this level exists in ALL selected students
                                                    const existsInAllStudents = studentLevelSets.every((studentSet, index) => {
                                                        const hasLevel = studentSet.has(levelId);
                                                        return hasLevel;
                                                    });


                                                    if (existsInAllStudents) {
                                                        commonLevelIds.push(levelId);
                                                    }
                                                });


                                                // Map back to full level objects and sort
                                                const levels = commonLevelIds
                                                    .map(id => {
                                                        const level = getLevelById(id);
                                                        return level;
                                                    })
                                                    .filter(Boolean)
                                                    .sort((a, b) => a.level.localeCompare(b.level));


                                                if (levels.length === 0) {
                                                    return (
                                                        <div className="p-2 text-sm text-gray-500">
                                                            No common academic levels found between selected students and your profile
                                                        </div>
                                                    );
                                                }

                                                return levels.map((levelObj) => {
                                                    return (
                                                        <SelectItem key={`level-${levelObj._id}`} value={levelObj._id}>
                                                            {levelObj.level}
                                                        </SelectItem>
                                                    );
                                                });
                                            })()}
                                        </SelectContent>
                                    </Select>
                                    {(() => {
                                        if (!sessionForm.student_ids || sessionForm.student_ids.length === 0) return null;

                                        const selectedStudents = availableStudents.filter(s => sessionForm.student_ids.includes(s._id));
                                        const studentLevelSets = selectedStudents.map(student => {
                                            let studentLevels = [];
                                            const academicLevelField = student.academic_level || student.academic_levels || student.preferred_academic_levels || student.education_level;

                                            if (academicLevelField) {
                                                if (Array.isArray(academicLevelField)) {
                                                    studentLevels = academicLevelField;
                                                } else if (typeof academicLevelField === 'string') {
                                                    try {
                                                        const parsed = JSON.parse(academicLevelField);
                                                        studentLevels = Array.isArray(parsed) ? parsed : [parsed];
                                                    } catch {
                                                        studentLevels = [academicLevelField];
                                                    }
                                                } else {
                                                    studentLevels = [academicLevelField];
                                                }
                                            }

                                            return new Set(studentLevels.map(level =>
                                                typeof level === 'object' ? level._id?.toString() || level.id?.toString() : level.toString()
                                            ).filter(Boolean));
                                        });

                                        const tutorLevelIds = new Set(
                                            tutorAcademicLevels.map(lvl => {
                                                const levelId = lvl.educationLevel || lvl._id?.toString() || lvl.id?.toString();
                                                return levelId;
                                            }).filter(Boolean)
                                        );

                                        const commonLevelIds = [];
                                        tutorLevelIds.forEach(levelId => {
                                            const existsInAllStudents = studentLevelSets.every(studentSet =>
                                                studentSet.has(levelId)
                                            );
                                            if (existsInAllStudents) {
                                                commonLevelIds.push(levelId);
                                            }
                                        });

                                        if (commonLevelIds.length === 0) {
                                            return (
                                                <p className="text-sm text-red-600 mt-1">
                                                    ⚠️ No common academic levels found. Students must have academic levels that match your teaching levels.
                                                </p>
                                            );
                                        }

                                        return null;
                                    })()}

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <Label>Duration</Label>
                                        <Input
                                            type="number"
                                            value={1}
                                            disabled
                                        />
                                        {/* hidden input ensures value=1 is sent to backend */}
                                        <input type="hidden" name="duration_hours" value={1} />
                                    </div>

                                    <div className="md:col-span-1">
                                        <Label>Hourly Rate (£)</Label>
                                        <Input type="number" value={sessionForm.hourly_rate} disabled />
                                    </div>

                                    <div className="md:col-span-1">
                                        <Label>Total</Label>
                                        <div className="p-2 bg-gray-50 rounded border text-green-700 font-semibold">
                                            £{(1 * sessionForm.hourly_rate).toFixed(2)}
                                        </div>
                                    </div>
                                </div>


                                <div>
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        value={sessionForm.notes}
                                        onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                                        rows={3}
                                        placeholder="Add any additional notes about the session or link to the session"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
                            <Button
                                onClick={handleCreateSession}
                                className="flex-1"
                                disabled={
                                    !sessionForm.student_ids ||
                                    sessionForm.student_ids.length === 0 ||
                                    allSubjects.length === 0 ||
                                    (() => {
                                        if (!sessionForm.student_ids || sessionForm.student_ids.length === 0) return true;

                                        const selectedStudents = availableStudents.filter(s => sessionForm.student_ids.includes(s._id));
                                        const studentLevelSets = selectedStudents.map(student => {
                                            let studentLevels = [];
                                            const academicLevelField = student.academic_level || student.academic_levels || student.preferred_academic_levels || student.education_level;

                                            if (academicLevelField) {
                                                if (Array.isArray(academicLevelField)) {
                                                    studentLevels = academicLevelField;
                                                } else if (typeof academicLevelField === 'string') {
                                                    try {
                                                        const parsed = JSON.parse(academicLevelField);
                                                        studentLevels = Array.isArray(parsed) ? parsed : [parsed];
                                                    } catch {
                                                        studentLevels = [academicLevelField];
                                                    }
                                                } else {
                                                    studentLevels = [academicLevelField];
                                                }
                                            }

                                            return new Set(studentLevels.map(level =>
                                                typeof level === 'object' ? level._id?.toString() || level.id?.toString() : level.toString()
                                            ).filter(Boolean));
                                        });

                                        const tutorLevelIds = new Set(
                                            tutorAcademicLevels.map(lvl => {
                                                const levelId = lvl.educationLevel || lvl._id?.toString() || lvl.id?.toString();
                                                return levelId;
                                            }).filter(Boolean)
                                        );

                                        const commonLevelIds = [];
                                        tutorLevelIds.forEach(levelId => {
                                            const existsInAllStudents = studentLevelSets.every(studentSet =>
                                                studentSet.has(levelId)
                                            );
                                            if (existsInAllStudents) {
                                                commonLevelIds.push(levelId);
                                            }
                                        });

                                        return commonLevelIds.length === 0;
                                    })()
                                }
                            >
                                Create Session
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Choose Date</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-3">
                                    <Button variant="outline" onClick={() => {
                                        const d = new Date(displayMonth);
                                        d.setMonth(d.getMonth() - 1);
                                        setDisplayMonth(d);
                                    }}>Prev</Button>
                                    <div className="font-semibold">{monthTitle}</div>
                                    <Button variant="outline" onClick={() => {
                                        const d = new Date(displayMonth);
                                        d.setMonth(d.getMonth() + 1);
                                        setDisplayMonth(d);
                                    }}>Next</Button>
                                </div>

                                <div className="grid grid-cols-7 gap-2 text-center mb-2 text-xs text-gray-500">
                                    {dayNamesShort.map(d => <div key={d} className="py-1">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {monthDays.map((d, idx) => {
                                        if (!d) return <div key={`blank-${idx}`} />;
                                        const yyyyMmDd = formatLocalYyyyMmDd(d);
                                        const selectable = isDaySelectable(d);
                                        const isSelected = selectedDate === yyyyMmDd;
                                        return (
                                            <button
                                                key={yyyyMmDd}
                                                type="button"
                                                disabled={!selectable}
                                                onClick={() => { setSelectedDate(yyyyMmDd); setSelectedTime(""); }}
                                                className={`p-2 rounded border text-sm ${selectable ? 'bg-white hover:bg-blue-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} ${isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}`}
                                            >
                                                {d.getDate()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Available Time Slots</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!selectedDate && (
                                    <div className="text-sm text-gray-500">Select a date to see available slots.</div>
                                )}
                                {selectedDate && loadingSlots && (
                                    <div className="text-sm text-gray-500">Loading slots...</div>
                                )}
                                {selectedDate && !loadingSlots && availableSlots.length === 0 && (
                                    <div className="text-sm text-gray-500">No slots available for this day.</div>
                                )}
                                {selectedDate && !loadingSlots && availableSlots.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {availableSlots.map((slot) => {
                                            const isActive = selectedTime === slot;
                                            const isConflict = conflictingSlots.includes(slot);
                                            return (
                                                <button
                                                    key={`slot-${slot}`}
                                                    type="button"
                                                    disabled={isConflict}
                                                    onClick={() => !isConflict && setSelectedTime(slot)}
                                                    className={`px-3 py-2 rounded border text-sm ${isConflict
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : (isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-50 border-gray-200')
                                                        }`}
                                                    title={isConflict ? 'Conflicts with an existing session' : ''}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorCreateSessionPage;

