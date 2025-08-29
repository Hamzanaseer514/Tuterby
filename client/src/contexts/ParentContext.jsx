import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config';

const ParentContext = createContext();

export const ParentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  const getParentProfile = useCallback(async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/parent/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/parent/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(childData)
      });

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
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/parent/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

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
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/parent/dashboard-stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await fetch(`${BASE_URL}/api/auth/user-profile/${userId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }, [getAuthToken]);

  const value = {
    loading,
    setLoading,
    getParentProfile,
    addChildToParent,
    updateParentProfile,
    getParentDashboardStats,
    uploadParentPhoto
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
