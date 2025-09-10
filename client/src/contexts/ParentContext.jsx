import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config';
import { useAuth } from '../hooks/useAuth';
const ParentContext = createContext();

export const ParentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const { getAuthToken, fetchWithAuth } = useAuth();
  const token = getAuthToken();

  // Function to fetch parent profile

  const getParentProfile = useCallback(async (userId) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/parent/profile/${userId}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
      if (!response.ok) {
        throw new Error('Failed to fetch parent profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      throw error;
    }
  }, [getAuthToken]);

  const addChildToParent = useCallback(async (childData) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/parent/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData)
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add child');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  }, [getAuthToken]);

  const updateParentProfile = useCallback(async (userId, profileData) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/parent/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to update parent profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating parent profile:', error);
      throw error;
    }
  }, [getAuthToken]);

  const getParentDashboardStats = useCallback(async (userId) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/parent/dashboard-stats/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
    

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }, [getAuthToken]);

  const uploadParentPhoto = useCallback(async (userId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/user-profile/${userId}/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formData
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }, [getAuthToken]);

  const updateChildProfile = useCallback(async (childId, profileData) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/auth/updatestudent/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update child profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating child profile:', error);
      throw error;
    }
  }, [getAuthToken]);

  const uploadChildPhoto = useCallback(async (childId, photoFile) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await fetchWithAuth(`${BASE_URL}/api/auth/user-profile/${childId}/photo`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json" // Let browser set this with boundary
        },
        body: formData
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to upload child photo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading child photo:', error);
      throw error;
    }
  }, [getAuthToken]);

  const createParentPaymentSession = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // Validate required payment data
      if (!paymentData._id || !paymentData.studentEmail) {
        throw new Error('Missing required payment information');
      }

      if (!paymentData.monthly_amount && !paymentData.base_amount) {
        throw new Error('Payment amount is required');
      }

      // Prepare payment payload with proper validation
      const paymentPayload = {
        amount: paymentData.monthly_amount || paymentData.base_amount,
        paymentId: paymentData._id,
        tutorName: paymentData.tutor?.user_id?.full_name || 'Tutor',
        subject: paymentData.subject?.name || 'Subject',
        academicLevel: paymentData.academic_level?.level || 'Level',
        studentEmail: paymentData.studentEmail,
        payment_type: paymentData.payment_type || 'hourly',
        total_sessions_per_month: paymentData.total_sessions_per_month || 1,
        base_amount: paymentData.base_amount || 0,
        discount_percentage: paymentData.discount_percentage || 0,
        days_remaining: 30, // Default 30 days validity
        isParentPayment: true, // Flag to identify parent payment
        studentName: paymentData.student?.full_name || 'Child' // Child's name
      };


      const response = await fetchWithAuth(`${BASE_URL}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Payment session creation failed (${response.status})`);
      }

      const data = await response.json();

      return {
        success: true,
        checkoutUrl: data.url,
        sessionId: data.sessionId || null
      };

    } catch (error) {
      console.error('Error creating parent payment session:', error);
      throw new Error(`Payment session creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const getSpecificStudentDetail = useCallback(async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetchWithAuth(`${BASE_URL}/api/parent/student/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching student details:', error);
      throw error;
    }
  }, [getAuthToken]);

  const getParentStudentsPayments = useCallback(async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetchWithAuth(`${BASE_URL}/api/parent/payments/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }, [getAuthToken]);

  const getStudentSessions = useCallback(async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetchWithAuth(`${BASE_URL}/api/parent/sessions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',

        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }, [getAuthToken]);

  const deleteChildFromParent = useCallback(async (childId, parentUserId) => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(`${BASE_URL}/api/parent/child/${childId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentUserId })
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete child');
      }

      const data = await response.json();
      toast.success('Child deleted successfully');
      return data;
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error(error.message || 'Failed to delete child');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const getTutorsForParent = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.subject_id && { subject_id: filters.subject_id }),
        ...(filters.academic_level && { academic_level: filters.academic_level }),
        ...(filters.location && { location: filters.location }),
        ...(filters.min_rating && { min_rating: filters.min_rating }),
        ...(filters.preferred_subjects_only && { preferred_subjects_only: filters.preferred_subjects_only })
      });

      const response = await fetchWithAuth(`${BASE_URL}/api/parent/tutors/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tutors');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tutors:', error);
      // toast.error(error.message || 'Failed to fetch tutors');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const value = {
    loading,
    setLoading,
    getParentProfile,
    addChildToParent,
    updateParentProfile,
    getParentDashboardStats,
    uploadParentPhoto,
    updateChildProfile,
    uploadChildPhoto,
    getSpecificStudentDetail,
    getParentStudentsPayments,
    createParentPaymentSession,
    getStudentSessions,
    deleteChildFromParent,
    getTutorsForParent
  };

  return (
    <ParentContext.Provider value={value}>
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = () => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
};
