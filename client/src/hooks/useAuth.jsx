import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/config";

const AuthContext = createContext();

let isRefreshing = false;
let refreshPromise = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("userData")) || null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem("authToken");

  const clearAllAuthData = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
  }, []);

  const login = useCallback((userData, token) => {
    clearAllAuthData();
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
  }, [clearAllAuthData]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // refreshToken cookie bhejne ke liye
      });
    } catch (error) {
      //console.error("Logout error:", error);
    }

    // ✅ Frontend state clear
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
  }, []);


  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Refresh failed");
      }

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
        return data.accessToken;
      } else {
        throw new Error("No access token in refresh response");
      }
    } catch (err) {
      console.error("Refresh token expired or invalid:", err);
      clearAllAuthData();
      navigate("/login");
      throw err;
    }
  }, [clearAllAuthData, navigate]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    let token = getAuthToken();
    
    if (!token) {
      console.warn("No auth token found, redirecting to login");
      clearAllAuthData();
      navigate("/login");
      throw new Error("No auth token");
    }

    let response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    // If 401, try to refresh the token
    if (response.status === 401) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }
        
        token = await refreshPromise;
        isRefreshing = false;

        // Retry the original request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        // If still 401 after refresh, logout
        if (response.status === 401) {
          console.error("Still unauthorized after token refresh");
          clearAllAuthData();
          navigate("/login");
        }
      } catch (err) {
        isRefreshing = false;
        console.error("Token refresh failed:", err);
        clearAllAuthData();
        navigate("/login");
        throw err;
      }
    }

    return response;
  }, [refreshAccessToken, clearAllAuthData, navigate]);

  const getUserProfile = useCallback(async (user_id) => {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/auth/user-profile/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }, []);

  const isAuthenticated = () => !!user;
  const isTutor = () => user?.role === "tutor";
  const isAdmin = () => user?.role === "admin";
  const isStudent = () => user?.role === "student";
  const isParent = () => user?.role === "parent";

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
        getUserProfile,
        fetchWithAuth,
        clearAllAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
