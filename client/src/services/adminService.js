// services/adminService.js
import { supabase } from '../lib/supabaseClient';
import { BASE_URL } from '@/config';

const API_BASE_URL = `${BASE_URL}/api/admin`;

// Helper function to get auth token - use the same method as useAuth hook 
export const getAuthToken = () => {
  // Check sessionStorage first, then localStorage (same as useAuth hook)
  return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      ...options,
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
        throw new Error('Unauthorized - Please login again');
      }
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Helper function to get document URL
const getDocumentUrl = (fileUrl) => {
  if (!fileUrl || fileUrl === '#') return '#';
  
  // If it's already a full URL (from backend), return as is
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  // If it's a relative path, construct the full URL
  if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('uploads/')) {
    return `${BASE_URL}/${fileUrl.replace(/^\/+/, '')}`;
  }
  
  // Default case - assume it's a relative path
  return `${BASE_URL}/uploads/${fileUrl}`;
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  return apiCall('/dashboard/stats');
};

// User Management - Enhanced with better error handling and logging
export const getAllUsers = async (filters = {}) => {
  
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const users = await apiCall(endpoint);
    
    // Process users data
    const processedUsers = users.map(user => {
      // Fix document URLs
      if (user.documents && Array.isArray(user.documents)) {
        user.documents = user.documents.map(doc => ({
          ...doc,
          url: getDocumentUrl(doc.url)
        }));
      }
      
      // Parse subjects if they are JSON strings or arrays containing JSON strings
      if (user.subjects) {
        if (Array.isArray(user.subjects)) {
          user.subjects = user.subjects.map(subject => {
            if (typeof subject === 'string' && subject.startsWith('[') && subject.endsWith(']')) {
              try {
                return JSON.parse(subject);
              } catch (error) {
                console.error('Error parsing subject:', subject, error);
                return subject;
              }
            }
            return subject;
          }).flat();
        } else if (typeof user.subjects === 'string') {
          try {
            user.subjects = JSON.parse(user.subjects);
          } catch (error) {
            console.error('Error parsing subjects for user:', user.name, error);
            user.subjects = [];
          }
        }
      }
      
      // Ensure subjects is always an array
      if (!Array.isArray(user.subjects)) {
        user.subjects = [];
      }
      return user;
    });
    
    return processedUsers || [];
  } catch (error) {
    console.error('Error fetching users from API:', error);
    throw error;
  }
};

export const getTutorDetails = async (userId) => { 
  try {
    const details = await apiCall(`/tutors/${userId}`);

    // Fix document URLs
    if (Array.isArray(details.documents)) {
      details.documents = details.documents.map((doc) => ({
        ...doc,
        url: getDocumentUrl(doc.url),
      }));
    } else {
      details.documents = [];
    }

    // Ensure subjects is always an array
    if (!Array.isArray(details.subjects)) {
      details.subjects = [];
    }

    // Ensure academic_levels_taught is always an array
    if (!Array.isArray(details.academic_levels_taught)) {
      details.academic_levels_taught = [];
    }

    // Normalize interview preferred times
    if (Array.isArray(details.preferred_interview_times)) {
      details.preferredSlots = details.preferred_interview_times;
    } else if (Array.isArray(details.preferredSlots)) {
      details.preferredSlots = details.preferredSlots;
    } else {
      details.preferredSlots = [];
    }

    return details;
  } catch (error) {
    console.error("Error fetching tutor details:", error);
    throw error;
  }
};





// Interview Management - Using your existing endpoint
// export const scheduleInterview = async (user_id, scheduledTime, notes = '') => {
//   return apiCall('/tutors/interview/select', {
//     method: 'POST',
//     body: JSON.stringify({
//       user_id: user_id, // This should be the tutor profile ID
//       scheduled_time: scheduledTime
//     }),
//   });
// };

export const completeInterview = async (userId, result, notes = '') => {
  return apiCall('/interviews/complete', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      result,
      notes
    }),
  });
};

export const getAvailableInterviewSlots = async (date) => {
  try {
    const slots = await apiCall(`/interviews/available-slots?date=${date}`);
    return slots;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    // Return mock slots as fallback
    return [
      { date: date, time: '09:00', available: true },
      { date: date, time: '10:00', available: true },
      { date: date, time: '11:00', available: false },
      { date: date, time: '14:00', available: true },
      { date: date, time: '15:00', available: true },
      { date: date, time: '16:00', available: true }
    ];
  }
};

// Application Management
export const updateApplicationNotes = async (tutorId, notes) => {
  return apiCall('/applications/notes', {
    method: 'PUT',
    body: JSON.stringify({
      tutorId,
      notes
    }),
  });
  
};

// Tutor Approval/Rejection
export const approveTutorProfile = async (user_id, reason) => {
  const res = await fetch(`${BASE_URL}/api/admin/tutors/approve`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, reason }),
  });

  const data = await res.json();
  return { status: res.status, data };
};

export const partialApproveTutor = async (user_id, reason) => {
  const res = await fetch(`${BASE_URL}/api/admin/tutors/partial-approve`, {
    method: "POST",
      headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, reason }),
  });

  const data = await res.json();
  return { status: res.status, data };
};

export const rejectTutorProfile = async (user_id, reason) => {
  const res = await fetch(`${BASE_URL}/api/admin/tutors/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, reason }),
  });

  const data = await res.json();
  return { status: res.status, data };
};


// Background Check Verification
// export const verifyBackgroundCheck = async (tutorId) => {
//   return apiCall('/tutors/verify/background', {
//     method: 'POST',
//     body: JSON.stringify({ tutor_id: tutorId }),
//   });
// };

// Individual Document Verification (for Background Check documents)
export const verifyDocument = async (user_id, documentType) => {
  return apiCall('/tutors/verify/document', {
    method: 'POST',
    body: JSON.stringify({ 
      user_id: user_id,  
      document_type: documentType 
    }),
  });
};

// export const verifyReferenceChecks = async (tutorId) => {
//   return apiCall('/tutors/verify/references', {
//     method: 'POST',
//     body: JSON.stringify({ tutor_id: tutorId }),
//   });
// };

// export const verifyQualifications = async (tutorId) => {
//   return apiCall('/tutors/verify/qualifications', {
//     method: 'POST',
//     body: JSON.stringify({ tutor_id: tutorId }),
//   });
// };

// Interview Slot Management
export const setAvailableInterviewSlots = async (userId, preferredTimes) => {
  return apiCall('/tutors/interview/assign', {
    method: 'PUT',
    body: JSON.stringify({
      user_id: userId, // This should be the user ID, not tutor profile ID
      preferred_interview_times: preferredTimes
    }),
  });
};

export const updateUserStatus = async (userId, status) => {
  return apiCall(`/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

// Tutor Sessions Management
export const getAllTutorSessions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const endpoint = `/tutor-sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiCall(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    throw error;
  }
};

// Tutor Reviews Management
export const getAllTutorReviews = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const endpoint = `/tutor-reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiCall(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching tutor reviews:', error);
    throw error;
  }
};


