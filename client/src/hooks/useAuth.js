import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    setUser(null);
  }, []);

  const clearAllAuthData = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    setUser(null);
  }, []);

  const login = useCallback((userData, token, rememberMe = false) => {
    console.log('Login function called with:', { userData, token, rememberMe });
    
    // Clear any existing data first - this is crucial to prevent old data from persisting
    clearAllAuthData();
    
    // Store new data
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('Stored in localStorage:', userData);
    
    // Set user state immediately
    console.log('Setting user state to:', userData);
    setUser(userData);

  }, [clearAllAuthData]);

  useEffect(() => {
    console.log('useAuth useEffect running, checking storage...');
    // Check both storages and use the most recent/valid data
    const localToken = localStorage.getItem('authToken');
    const localUserData = localStorage.getItem('userData');
    const sessionToken = sessionStorage.getItem('authToken');
    const sessionUserData = sessionStorage.getItem('userData');

    console.log('Storage check - localToken:', !!localToken, 'localUserData:', !!localUserData);
    console.log('Storage check - sessionToken:', !!sessionToken, 'sessionUserData:', !!sessionUserData);

    let authToken = null;
    let storedUserData = null;

    // Priority: sessionStorage first (more recent), then localStorage
    if (sessionToken && sessionUserData) {
      authToken = sessionToken;
      storedUserData = sessionUserData;
    } else if (localToken && localUserData) {
      authToken = localToken;
      storedUserData = localUserData;
    }

    if (authToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('Setting user from storage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      console.log('No valid auth data found in storage');
    }
    console.log('Setting loading to false');
    setLoading(false);
  }, [logout]);

  const isAuthenticated = () => {
    return !!user;
  };

  const isTutor = () => {
    return user && user.role === 'tutor';
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isStudent = () => {
    return user && user.role === 'student';
  };

  const isParent = () => {
    return user && user.role === 'parent';
  };

  const getAuthToken = () => {
    // Check sessionStorage first, then localStorage
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isTutor,
    isAdmin,
    isStudent,
    isParent,
    getAuthToken,
    clearAllAuthData
  };
}; 