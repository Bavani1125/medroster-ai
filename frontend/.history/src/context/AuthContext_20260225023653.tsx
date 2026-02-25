import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '../api';
import { UserRole } from '../types';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department_id?: number;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department_id: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setAxiosAuthHeader(token: string | null) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAxiosAuthHeader(token);
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);

      const access_token = response.data?.access_token;
      if (!access_token) throw new Error('Login response missing access_token');

      // If backend returns user fields alongside token
      const userData: User | null =
        response.data?.user ??
        (response.data?.email ? {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          department_id: response.data.department_id,
        } : null);

      setToken(access_token);
      localStorage.setItem('access_token', access_token);
      setAxiosAuthHeader(access_token);

      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: string }) => {
    setIsLoading(true);
    try {
      const payload: RegisterInput = {
        ...data,
        department_id: 0, // REQUIRED by backend schema (Swagger shows this)
      };

      const response = await authAPI.register(payload);

      // backend returns created user object
      const userData: User = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAxiosAuthHeader(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};