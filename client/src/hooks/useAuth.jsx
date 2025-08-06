import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  }, []);

  const clearAllAuthData = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  }, []);

  const login = useCallback((userData, token, rememberMe = false) => {
    clearAllAuthData();
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
  }, [clearAllAuthData]);

  const isAuthenticated = () => !!user;
  const isTutor = () => user?.role === 'tutor';
  const isAdmin = () => user?.role === 'admin';
  const isStudent = () => user?.role === 'student';
  const isParent = () => user?.role === 'parent';
  const getAuthToken = () => localStorage.getItem('authToken');

  return (
    <AuthContext.Provider
      value={{
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
        clearAllAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
