// services/assignmentService.js
import { BASE_URL } from '@/config';

const API_BASE_URL = `${BASE_URL}/api/assignments`;

// Helper function to get auth token
export const getAuthToken = () => {
  return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
};

// Helper function to make API calls with fetchWithAuth
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
      //console.error('API Error Response:', errorText);
      
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized - Please login again');
      }
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    //console.error('API call failed:', error);
    throw error;
  }
};

// Tutor: Create assignment for a student
export const createAssignment = async (tutorUserId, assignmentData) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('student_user_id', assignmentData.student_user_id);
  formData.append('subject', assignmentData.subject);
  formData.append('academic_level', assignmentData.academic_level);
  formData.append('title', assignmentData.title);
  formData.append('description', assignmentData.description || '');
  if (assignmentData.due_date) {
    formData.append('due_date', assignmentData.due_date);
  }
  
  // Add file if present
  if (assignmentData.file) {
    formData.append('file', assignmentData.file);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/tutor/${tutorUserId}/assignments`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    //console.error('API Error Response:', errorText);
    
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized - Please login again');
    }
    
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json();
};

// Tutor: Get all assignments created by tutor
export const getTutorAssignments = async (tutorUserId) => {
  return apiCall(`/tutor/${tutorUserId}/assignments`);
};

// Student: Get all assignments assigned to student
export const getStudentAssignments = async (studentUserId) => {
  return apiCall(`/student/${studentUserId}/assignments`);
};

// Download assignment file - now returns S3 URL
export const downloadAssignment = async (assignmentId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/download/${assignmentId}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    //console.error('Download failed:', response.status);
    
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized - Please login again');
    }
    
    throw new Error(`Download failed: ${response.status}`);
  }

  const data = await response.json();
  return data; // Returns { file_url, file_name, file_mime_type }
};

// Get paid subjects and academic levels for a specific student-tutor relationship
export const getPaidSubjectsAndLevels = async (tutorUserId, studentUserId) => {
  return apiCall(`/paid-subjects-levels/${tutorUserId}/${studentUserId}`);
};

// Student: Submit assignment
export const submitAssignment = async (assignmentId, submissionData) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('student_user_id', submissionData.student_user_id);
  formData.append('submission_text', submissionData.submission_text || '');
  
  // Add file if present
  if (submissionData.file) {
    formData.append('file', submissionData.file);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/submit/${assignmentId}`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    //console.error('API Error Response:', errorText);
    
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized - Please login again');
    }
    
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json();
};

// Student: Get their submissions
export const getStudentSubmissions = async (studentUserId) => {
  return apiCall(`/student/${studentUserId}/submissions`);
};

// Tutor: Get submissions for their assignments
export const getTutorSubmissions = async (tutorUserId) => {
  return apiCall(`/tutor/${tutorUserId}/submissions`);
};

// Tutor: Grade submission
export const gradeSubmission = async (submissionId, gradeData) => {
  return apiCall(`/grade/${submissionId}`, {
    method: 'PUT',
    body: JSON.stringify(gradeData),
  });
};
